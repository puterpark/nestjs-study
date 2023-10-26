import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './util/swagger/setupSwagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // swagger
  setupSwagger(app);

  await app.listen(3000);
}
bootstrap();
