import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signUp.dto';
import { JwtPayload } from './dto/jwtPayload.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from './auth-response';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { SignInDto } from './dto/signIn.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponse> {
    const { username, email, password, birthDate } = signUpDto;

    const found = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email OR user.username = :username', {
        email,
        username,
      })
      .getOne();

    if (found) throw new ConflictException('User already exists');

    const hashedPassword = await this.hashPassword(password);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      birthDate,
    });

    await this.userRepository.save(user);

    const payload: JwtPayload = {
      userId: user.id,
    };

    const accessToken = await this.createToken(payload, '5h');

    return { accessToken: accessToken };
  }

  async signIn(credentials: SignInDto): Promise<AuthResponse> {
    const { email, password } = credentials;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email o password non validi');
    }

    const payload: JwtPayload = { userId: user.id };

    const accessToken = await this.createToken(payload, '5h');

    return { accessToken: accessToken };
  }

  private async createToken(payload: JwtPayload, expiresIn: string) {
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn,
    });
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
