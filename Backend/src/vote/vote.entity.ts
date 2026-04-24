import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';


export enum VoteType {
  UP = 'UP',
  DOWN = 'DOWN',
}

@Entity()
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: VoteType,
  })
  type: VoteType;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.votes, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, (user) => user.votes, { onDelete: 'CASCADE' })
  user: User
}
