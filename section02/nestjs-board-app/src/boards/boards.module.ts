import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { AuthModule } from 'src/auth/auth.module';
import { BoardsService } from './boards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardRepository } from './board.repository';
import { Board } from './board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board]), AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService, BoardRepository], // BoardRepository 추가
})
export class BoardsModule {}
