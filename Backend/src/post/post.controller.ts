import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FileUploadInterceptor } from 'src/common/file-upload.interceptor';
import { GetUser } from 'src/common/get-user.decorator';
import { User } from 'src/user/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtOptionalAuthGuard } from 'src/common/jwt-optional-auth.guard';
import { SearchDto } from './dto/search.dto';
import { PostResponseDto } from './dto/post-response.dto';

@Controller('post')
@UseInterceptors(ClassSerializerInterceptor)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @FileUploadInterceptor()
  @UseGuards(AuthGuard('jwt'))
  async createPost(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePostDto,
    @GetUser() user: User,
  ): Promise<any> {
    return this.postService.createPost(user, dto, file.filename);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  getAllPosts(
    @GetUser() user: User,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ posts: PostResponseDto[]; total: number }> {
    const parsedLimit = Number(limit) || 10;
    const parsedOffset = Number(offset) || 0;

    return this.postService.getAllPaginated(
      user?.id,
      parsedLimit,
      parsedOffset,
    );
  }

  @Post('/search')
  search(
    @Body() searchDto: SearchDto,
    @GetUser() user: User,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ): Promise<{ posts: PostResponseDto[]; total: number }> {
    return this.postService.search(searchDto, user?.id, +limit, +offset);
  }

  @Get('/mine')
  @UseGuards(AuthGuard('jwt'))
  getMyPosts(
    @GetUser() user: User,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ posts: PostResponseDto[]; total: number }> {
    const parsedLimit = Number(limit) || 10;
    const parsedOffset = Number(offset) || 0;

    return this.postService.getMyPosts(user.id, parsedLimit, parsedOffset);
  }
  @Get('/my-upvoted-posts')
  @UseGuards(AuthGuard('jwt'))
  getMyUpvotedPosts(
    @GetUser() user: User,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ posts: PostResponseDto[]; total: number }> {
    const parsedLimit = Number(limit) || 10;
    const parsedOffset = Number(offset) || 0;

    return this.postService.getMyUpvotedPostsPaginated(
      user.id,
      parsedLimit,
      parsedOffset,
    );
  }

  @Get('/today')
  getTodayPosts(): Promise<PostResponseDto[]> {
    return this.postService.getTodayPost();
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('/:id')
  async getById(
    @Param('id') postId: string,
    @GetUser() user: User,
  ): Promise<any> {
    if (user) return this.postService.getById(postId, user.id);

    return this.postService.getById(postId);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.postService.delete(user.id, id);
  }
}
