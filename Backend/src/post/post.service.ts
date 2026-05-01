import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Post } from './post.entity';
import { User } from 'src/user/user.entity';
import * as path from 'path';
import * as fs from 'fs';
import { TagService } from 'src/tag/tag.service';
import { Vote, VoteType } from 'src/vote/vote.entity';
import { SearchDto } from './dto/search.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { StorageService } from 'src/common/storage.service';
import { extname } from 'path';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,

    private tagService: TagService,
    private storageService: StorageService,
  ) {}

  async createPost(
    user: User,
    dto: CreatePostDto,
    file: Express.Multer.File,
  ): Promise<any> {
    const tags = await this.tagService.findOrCreateTags(dto.tags);

    let imageUrl = '';
    if (file) {
      imageUrl = await this.storageService.uploadFile(file);
    }

    const post = this.postRepository.create({
      title: dto.title,
      imageUrl: imageUrl,
      tags: tags,
      author: { id: user.id },
      upvoteCount: 0,
      downvoteCount: 0,
    });

    const newPost = await this.postRepository.save(post);

    return {
      id: newPost.id,
      title: newPost.title,
      imageUrl: newPost.imageUrl,
      createdAt: newPost.createdAt,
      author: user.username,
      upvote: 0,
      downvote: 0,
      userVote: null,
      tags: newPost.tags.map((tag) => tag.name),
      commentsCount: 0,
    };
  }

  async getAll(userId?: string): Promise<PostResponseDto[]> {
    const posts = await this.postRepository.find({
      relations: ['author', 'tags', 'comments', 'votes'],
      order: { createdAt: 'DESC' },
    });

    const formatted = await this.formatPosts(posts, userId);
    return formatted;
  }

  async getAllPaginated(
    userId?: string,
    limit = 10,
    offset = 0,
  ): Promise<{ posts: PostResponseDto[]; total: number }> {
    const [posts, total] = await this.postRepository.findAndCount({
      relations: ['author', 'tags', 'comments', 'votes'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const formatted = await this.formatPosts(posts, userId);
    return { posts: formatted, total };
  }

  async getById(postId: string, userId?: string): Promise<PostResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: [
        'author',
        'tags',
        'comments',
        'comments.author',
        'votes',
        'votes.user',
      ],
    });

    if (!post) throw new NotFoundException();

    const formatted = await this.formatSinglePost(post, userId);
    return formatted;
  }

  async getMyPosts(
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<{ posts: PostResponseDto[]; total: number }> {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { author: { id: userId } },
      relations: [
        'author',
        'tags',
        'comments',
        'comments.author',
        'votes',
        'votes.user',
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const formatted = await this.formatPosts(posts, userId);
    return { posts: formatted, total };
  }

  async search(
    searchDto: SearchDto,
    userId?: string,
    limit = 10,
    offset = 0,
  ): Promise<{ posts: PostResponseDto[]; total: number }> {
    const { title, date, tags, sortBy } = searchDto;

    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.votes', 'votes');

    // Filtri
    if (title) {
      query.andWhere('LOWER(post.title) LIKE LOWER(:title)', {
        title: `%${title}%`,
      });
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.andWhere('post.createdAt BETWEEN :start AND :end', {
        start,
        end,
      });
    }

    if (tags && tags.length > 0) {
      query.andWhere('tags.name IN (:...tags)', { tags });
    }

    if (sortBy === 'upvote') {
      query.orderBy('post.upvoteCount', 'DESC');
    } else if (sortBy === 'downvote') {
      query.orderBy('post.downvoteCount', 'DESC');
    } else {
      query.orderBy('post.createdAt', 'DESC');
    }

    const [posts, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const formatted = await this.formatPosts(posts, userId);
    return { posts: formatted, total };
  }

  async getMyUpvotedPostsPaginated(
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<{ posts: PostResponseDto[]; total: number }> {
    // Step 1: trova tutti i postId upvotati
    const votes = await this.voteRepository.find({
      where: {
        user: { id: userId },
        type: VoteType.UP,
      },
      relations: ['post'],
    });

    const postIds = votes.map((v) => v.post.id);

    if (postIds.length === 0) {
      return { posts: [], total: 0 };
    }

    // Step 2: paginazione solo su quelli
    const [posts, total] = await this.postRepository.findAndCount({
      where: { id: In(postIds) },
      relations: ['author', 'tags', 'comments', 'votes'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const formatted = await this.formatPosts(posts, userId);
    return { posts: formatted, total };
  }

  async getTodayPost(): Promise<PostResponseDto[]> {
    const allValidPosts = await this.getAll();

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const postsPerDay = 5;
    const startIndex = dayOfYear % allValidPosts.length;

    const dailyPosts: PostResponseDto[] = [];
    for (let i = 0; i < postsPerDay && i < allValidPosts.length; i++) {
      const index = (startIndex + i) % allValidPosts.length;
      dailyPosts.push(allValidPosts[index]);
    }

    return dailyPosts;
  }

  async delete(userId: string, id: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.id !== userId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    if (post.imageUrl) {
      await this.storageService.deleteFile(post.imageUrl);
    }

    await this.postRepository.delete({
      id: id,
      author: { id: userId } as User,
    });
  }


  async formatPosts(
    posts: Post[],
    userId?: string,
  ): Promise<PostResponseDto[]> {
    return await Promise.all(
      posts.map((post) => this.formatSinglePost(post, userId)),
    );
  }

  async formatSinglePost(
    post: Post,
    userId?: string,
  ): Promise<PostResponseDto> {
    let userVoteType: 'UP' | 'DOWN' | null = null;

    if (userId) {
      const userVote = await this.voteRepository.findOne({
        where: {
          post: { id: post.id },
          user: { id: userId },
        },
        select: ['id', 'type'],
      });

      userVoteType = userVote?.type ?? null;
    }

    return {
      id: post.id,
      title: post.title,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      author: post.author.username,
      upvote: post.upvoteCount,
      downvote: post.downvoteCount,
      userVote: userVoteType,
      tags: post.tags.map((tag) => tag.name),
      commentsCount: post.comments.length,
    };
  }
}
