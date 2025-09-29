import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔧 Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Email Service API')
    .setDescription('API documentation for the Email Service')
    .setVersion('1.0')
    .addBearerAuth() // Add JWT Bearer auth to Swagger
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Use the validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Only allow properties defined in the DTO
      forbidNonWhitelisted: true, // Throw error for any extra properties
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
