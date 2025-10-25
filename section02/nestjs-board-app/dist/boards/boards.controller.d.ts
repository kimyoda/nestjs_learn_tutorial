import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './board.entity';
import { BoardStatus } from './board-status.enum';
import { User } from 'src/auth/user.entity';
export declare class BoardsController {
    private boardService;
    constructor(boardService: BoardsService);
    createBoard(CreateBoardDto: CreateBoardDto, user: User): Promise<Board>;
    getBoardById(id: number): Promise<Board>;
    deleteBoard(id: number): Promise<void>;
    updateBoardStatus(id: number, status: BoardStatus): Promise<Board>;
    getAllBoard(user: User): Promise<Board[]>;
}
