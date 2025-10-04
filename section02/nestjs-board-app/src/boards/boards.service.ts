import { Injectable, NotFoundException } from '@nestjs/common';
import { Board, BoardStatus } from './board.model';
import { v1 as uuid } from 'uuid';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  private boards: Board[] = [];

  getAllBoards(): Board[] {
    return this.boards;
  }

  createBoard(createBoardDto: CreateBoardDto) {
    const { title, description } = createBoardDto;
    const board: Board = {
      id: uuid(),
      title,
      description,
      status: BoardStatus.PUBLIC,
    };

    this.boards.push(board);
    return board;
  }

  // id를 활용 특정 게시물 가져오는 메서드
  getBoardById(id: string): Board {
    const targetBoard = this.boards.find((board) => board.id === id);

    // 찾은 게시물이 없다면, NotFoundException 예외를 던집니다.
    if (!targetBoard) {
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }

    // 게시물을 찾았다면, 해당 게시물을 반환합니다.
    return targetBoard;
  }

  // delete 메서드
  deleteBoard(id: string): void {
    this.boards = this.boards.filter((board) => board.id !== id);
  }

  // update 메서드
  updateBoardStatus(id: string, status: BoardStatus): Board {
    const board = this.getBoardById(id);
    board.status = status;
    return board;
  }
}
