import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Vote, VoteType } from './vote.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async createOrUpdateVote(postId: string, userId: string, type: VoteType) {
    let vote = await this.getUserVote(postId, userId);
    const post = await this.postRepository.findOneOrFail({ where: { id: postId } });
  
    if (vote) {
      if (vote.type === type) {
        // Se il voto esiste ed è uguale, lo elimino
        await this.voteRepository.delete(vote.id);
  
        if (type === VoteType.UP) {
          post.upvoteCount = Math.max(0, post.upvoteCount - 1);
        } else {
          post.downvoteCount = Math.max(0, post.downvoteCount - 1);
        }
  
        await this.postRepository.save(post);
        return null;
      } else {
        // Se il voto esiste ma è diverso, lo aggiorno
        if (vote.type === VoteType.UP) {
          post.upvoteCount = Math.max(0, post.upvoteCount - 1);
          post.downvoteCount += 1;
        } else {
          post.downvoteCount = Math.max(0, post.downvoteCount - 1);
          post.upvoteCount += 1;
        }
  
        vote.type = type;
        await this.voteRepository.save(vote);
        await this.postRepository.save(post);
        return vote;
      }
    } else {
      // Crea nuovo voto
      vote = this.voteRepository.create({
        type,
        post: { id: postId } as Post,
        user: { id: userId } as User,
      });
  
      if (type === VoteType.UP) {
        post.upvoteCount += 1;
      } else {
        post.downvoteCount += 1;
      }
  
      await this.voteRepository.save(vote);
      await this.postRepository.save(post);
      return vote;
    }
  }
  

  async getUserVote(postId: string, userId: string): Promise<Vote | null> {
    return this.voteRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });
  }

  async delete(voteId: string, userId: string): Promise<void> {
    if (!voteId) {
      throw new NotFoundException('Post not found');
    }

    await this.voteRepository.delete({
      id: voteId,
      user: { id: userId } as User,
    });
  }
}
