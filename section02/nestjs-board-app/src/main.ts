import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  // app.get()이 아니라 config.get()을 바로 씁니다.
  const serverConfig = config.get('server');

  const port = serverConfig.port;
  await app.listen(port);

  // Logger.log()가 아니라 인스턴스(logger)의 log()를 씁니다.
  logger.log(`Application running on port ${port}`);
}
bootstrap();
