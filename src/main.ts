import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties not in the DTO (e.g., extra fields are ignored)
      forbidNonWhitelisted: true, // Throws error if extra properties are present
      transform: true, // Auto-transforms payloads to DTO instances (e.g., query strings to numbers)
      disableErrorMessages: false, // Include error details in responses (set to true in production for security)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
