import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,  
  ) {}


  async getMe(id: string): Promise<User> {
    const found = await this.userRepository.findOneBy({ id: id });
    
    if (!found) throw new NotFoundException(`User id  "${id}" not found`);

    return found;
  }
}
