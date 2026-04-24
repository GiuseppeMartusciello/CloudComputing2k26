export class PostResponseDto {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
  author: string;
  upvote: number;
  downvote: number;
  userVote: 'UP' | 'DOWN' | null;
  tags: string[];
  commentsCount: number;
}
