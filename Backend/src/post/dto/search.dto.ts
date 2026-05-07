import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  date?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsIn(['date', 'upvote', 'downvote'])
  sortBy?: 'date' | 'upvote' | 'downvote';
}
