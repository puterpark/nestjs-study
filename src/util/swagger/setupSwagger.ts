import { INestApplication } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * Swagger 설정
 * @param app
 */
export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle("테스트")
    .setDescription("스웨거 테스트")
    .setVersion("0.0.1")
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api-doc", app, document);
}