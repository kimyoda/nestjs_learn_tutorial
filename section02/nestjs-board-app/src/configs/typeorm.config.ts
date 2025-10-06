import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

// .env 파일을 읽어 process.env에 설정
dotenv.config();

export const typeORMConfig: TypeOrmModuleOptions = {
  // Database Type
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: process.env.DB_PASSWORD,
  //
  entities: [__dirname + '/../**/*.entity.{js, ts}'],
  synchronize: true,
};
