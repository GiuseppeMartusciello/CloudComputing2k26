import { Module } from '@nestjs/common';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { UserModule } from './user/user.module';
import { TagModule } from './tag/tag.module';
import { VoteModule } from './vote/vote.module';
import { CommonModule } from './common/common.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { createClient } from 'redis';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: configValidationSchema,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          url: `rediss://:${configService.get('REDIS_PASSWORD')}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
          ttl: 600,
        });

        // Gestore errori minimo per non far crashare l'app
        if ((store as any).client) {
          (store as any).client.on('error', (err: any) => {
            console.warn('Redis connection issue (handled):', err.message);
          });
        }

        return { store };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        synchronize: false,
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        ssl: configService.get('DB_HOST')?.includes('azure.com') ? { rejectUnauthorized: false } : false,
      }),
    }),
    AuthModule,
    PostModule,
    UserModule,
    TagModule,
    VoteModule,
    CommentModule,
  ],
})
export class AppModule { }
