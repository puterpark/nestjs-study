import { NestFactory } from '@nestjs/core';
import { utilities, WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import * as process from 'process';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { setupSwagger } from './util/swagger/setupSwagger';
import { ValidationPipe } from "@nestjs/common";
import { logger3 } from "./logger/logger3.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // 부트스트래핑까지 포함하여 내장 로거 대체
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_EVN === 'prod' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            utilities.format.nestLike('MyApp', { prettyPrint: true }),
          ),
        }),
      ],
    })
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  // 미들웨어 전역 설정
  app.use(logger3);

  // swagger
  setupSwagger(app);

  // 로깅 전역 설정
  // app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  await app.listen(3000);
}
bootstrap();
