import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './board.entity';
export declare class BoardsController {
    private boardService;
    constructor(boardService: BoardsService);
    createBoard(CreateBoardDto: CreateBoardDto): Promise<Board>;
    getBoardById(id: number): Promise<Board>;
    deleteBoard(id: number): Promise<void>;
}
