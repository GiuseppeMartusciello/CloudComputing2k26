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
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            tls: configService.get('REDIS_PORT') === 6380 ? ({ rejectUnauthorized: false } as any) : false,
            keepAlive: 10000, // Invia un ping ogni 10 secondi per non far cadere la linea
            reconnectStrategy: (retries) => {
              // Prova a riconnettersi ogni 1s, fino a un massimo di 3s tra i tentativi
              return Math.min(retries * 1000, 3000);
            },
          },
          password: configService.get('REDIS_PASSWORD'),
          ttl: 600,
        }),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        synchronize: true,
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
export class AppModule {}
