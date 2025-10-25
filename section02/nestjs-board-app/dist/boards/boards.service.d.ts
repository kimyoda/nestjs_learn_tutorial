import { BoardRepository } from './board.repository';
import { Board } from './board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardStatus } from './board-status.enum';
import { User } from 'src/auth/user.entity';
export declare class BoardsService {
    private boardRepository;
    constructor(boardRepository: BoardRepository);
    createBoard(createBoardDto: CreateBoardDto, user: User): Promise<Board>;
    getBoardById(id: number, user: User): Promise<Board>;
    deleteBoard(id: number, user: User): Promise<void>;
    updateBoardStatus(id: number, status: BoardStatus, user: User): Promise<Board>;
    getAllBoards(user: User): Promise<Board[]>;
}
