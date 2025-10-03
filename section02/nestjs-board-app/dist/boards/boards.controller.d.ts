import { BoardsService } from './boards.service';
import { Board } from './board.model';
export declare class BoardsController {
    private boardService;
    constructor(boardService: BoardsService);
    getAllBoard(): Board[];
    createBoard(title: string, description: string): Board;
}
