import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs'; // bcryptjs 추가

@Injectable() // ✅ 1. @Injectable() 데코레이터 사용
export class UserRepository extends Repository<User> {
  // ✅ 1. DataSource를 주입받는 생성자를 추가해야 합니다.
  constructor(private dataSource: DataSource) {
    // ✅ 2. super()를 호출해서 부모 클래스(Repository)를 초기화합니다.
    super(User, dataSource.createEntityManager());
  }
  // 유저 생성 추가
  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    // 암호화 로직 적용, Salt 생성
    const salt = await bcrypt.genSalt();
    // 비밀번호 생성
    const hashPassword = await bcrypt.hash(password, salt);
    // 해싱된 비밀번호로 유저 생성
    const user = this.create({ username, password: hashPassword });

    // try-catch 문 적용
    try {
      await this.save(user);
    } catch (error) {
      // "23505"는 PostgreSQL의 unique violation에러 코드이다.
      if (error.code === '23505') {
        throw new ConflictException('Existing username');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
