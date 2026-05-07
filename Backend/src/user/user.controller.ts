import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/common/get-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  getMe(@GetUser() user: User) {
    return this.userService.getMe(user.id);
  }
}
