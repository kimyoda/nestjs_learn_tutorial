import { BoardsService } from './boards.service';
import { Board } from './board.model';
import { CreateBoardDto } from './dto/create-board.dto';
export declare class BoardsController {
    private boardService;
    constructor(boardService: BoardsService);
    getAllBoard(): Board[];
    createBoard(createBoardDto: CreateBoardDto): Board;
}
