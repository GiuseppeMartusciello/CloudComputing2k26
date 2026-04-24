import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/transform.interceptor';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger();

  const uploadPath = process.env.UPLOAD_PATH || join(__dirname, '..', 'uploads');
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads',
  });

  app.enableCors({
    origin: true, // Permette tutte le origini in test
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 8080;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
