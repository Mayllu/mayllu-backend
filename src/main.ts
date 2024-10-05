import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 300;
  const config = new DocumentBuilder().setTitle('Mayllu API').setDescription('API for Mayllu').setVersion('1.0').build();

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove non allowed fields (dto)
      forbidNonWhitelisted: true, // error if non allowed fields are sent
      transform: true, // transform payload to dto
    }),
  );
  app.enableCors({
    origin: ['*'],
    preflightContinue: false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  // swagger module for handle visual documentation
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      filter: true, // tagged routes
      showRequestDuration: true, // show time of request
    },
  });

  await app.listen(port);
}

bootstrap();
