import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Injectable } from '@nestjs/common';

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
    const user = this.create({ username, password });

    await this.save(user);
  }
}
