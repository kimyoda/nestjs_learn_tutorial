import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
export declare class AuthService {
    private userRepository;
    constructor(userRepository: UserRepository);
    signUp(authCredentialsDto: AuthCredentialsDto): Promise<void>;
}
