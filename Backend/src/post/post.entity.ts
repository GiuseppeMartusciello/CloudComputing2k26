import { Tag } from 'src/tag/tag.entity';
import { Vote } from 'src/vote/vote.entity';
import { Comment } from 'src/comment/comment.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/user/user.entity';


@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  imageUrl: string; 

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  upvoteCount: number;
  
  @Column({ default: 0 })
  downvoteCount: number;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  author: User;

  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];
  
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @ManyToMany(() => Tag, (tag) => tag.posts, { cascade: true })
  @JoinTable()
  tags: Tag[];
}