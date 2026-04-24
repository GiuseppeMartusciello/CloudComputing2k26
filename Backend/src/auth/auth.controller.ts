import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(@Body() signUpDto: SignUpDto, @Req() req: Request) {
    return this.authService.signUp(signUpDto);
  }

  @Post('/signin')
  signin(@Body() credentials: SignInDto) {
    return this.authService.signIn(credentials);
  }
}
