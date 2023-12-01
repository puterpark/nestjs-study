import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './util/swagger/setupSwagger';
import { ValidationPipe } from "@nestjs/common";
import { logger3 } from "./logger/logger3.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  app.use(logger3); // 미들웨어 전역 설정

  // swagger
  setupSwagger(app);

  await app.listen(3000);
}
bootstrap();
