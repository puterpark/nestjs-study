import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import emailConfig from './config/emailConfig';
import { validationSchema } from './config/validationSchema';
import { TypeOrmModule } from "@nestjs/typeorm";
import * as process from "process";
import { LoggerMiddleware } from "./logger/logger.middleware";
import { UsersController } from "./users/users.controller";
import { Logger2Middleware } from "./logger/logger2.middleware";

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`],
      load: [emailConfig],
      isGlobal: true,
      validationSchema
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'prod',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  // 특정 모듈에 미들웨어 적용
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(LoggerMiddleware, Logger2Middleware) // 미들웨어가 나열된 순서대로 적용
      .exclude({ path: '/users', method: RequestMethod.GET }) // [GET] /users는 미들웨어 제외
      .forRoutes(UsersController);
  }
}
