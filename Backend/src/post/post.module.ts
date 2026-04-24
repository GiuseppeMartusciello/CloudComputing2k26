import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from 'src/comment/comment.module';
import { Tag } from 'src/tag/tag.entity';
import { TagModule } from 'src/tag/tag.module';
import { VoteModule } from 'src/vote/vote.module';
import { Vote } from 'src/vote/vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post,Tag,Vote]), CommentModule,TagModule,VoteModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
