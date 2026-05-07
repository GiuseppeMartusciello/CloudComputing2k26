import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
import { Comment } from 'src/comment/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(
    user: User,
    postId: string,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({
      text: dto.text,
      author: user,
      post: post,
    });

    return this.commentRepository.save(comment);
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });
    if (comment?.author.id != userId)
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );

    const result = await this.commentRepository.delete(commentId);
    if (result.affected === 0) {
      throw new NotFoundException(`Comment id "${commentId}" not found`);
    }
  }

  async getByPostId(postId: string): Promise<any[]> {
    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    if (!comments) {
      throw new NotFoundException(`Comment for post id "${postId}" not found`);
    }

    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        return {
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt,
          author: comment.author.username,
        };
      }),
    );

    return formattedComments;
  }
}
