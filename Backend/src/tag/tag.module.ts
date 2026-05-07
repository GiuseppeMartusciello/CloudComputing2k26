import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [],
  providers: [TagService],
  exports: [TypeOrmModule,TagService],
})
export class TagModule {}
