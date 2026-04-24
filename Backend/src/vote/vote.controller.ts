import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VoteService } from './vote.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/get-user.decorator';
import { User } from 'src/user/user.entity';
import { CreateVoteDto } from './dto/create-vote.dto';

@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post('/:postId')
  @UseGuards(AuthGuard('jwt'))
  createOrUpdateVote(
    @Param('postId') postId: string,
    @Body() dto: CreateVoteDto,
    @GetUser() user: User,
  ) {
    return this.voteService.createOrUpdateVote(postId, user.id, dto.type);
  }

  @Get('/:postId/user')
  @UseGuards(AuthGuard('jwt'))
  getUserVote(@Param('postId') postId: string, @GetUser() user: User) {
    return this.voteService.getUserVote(postId, user.id);
  }
}
