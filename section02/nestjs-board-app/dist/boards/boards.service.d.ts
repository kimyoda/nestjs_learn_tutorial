import { Board } from './board.model';
import { CreateBoardDto } from './dto/create-board.dto';
export declare class BoardsService {
    private boards;
    getAllBoards(): Board[];
    createBoard(createBoardDto: CreateBoardDto): Board;
}
