import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './board.entity';
import { BoardStatus } from './board-status.enum';
export declare class BoardsController {
    private boardService;
    constructor(boardService: BoardsService);
    createBoard(CreateBoardDto: CreateBoardDto): Promise<Board>;
    getBoardById(id: number): Promise<Board>;
    deleteBoard(id: number): Promise<void>;
    updateBoardStatus(id: number, status: BoardStatus): Promise<Board>;
}
