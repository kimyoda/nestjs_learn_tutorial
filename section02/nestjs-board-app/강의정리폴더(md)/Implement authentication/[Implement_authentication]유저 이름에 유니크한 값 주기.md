# 유저 이름에 유니크한 값 주기

## 📋 목표

- 유저를 생성할 때 유저 이름이 이미 사용되는 유저 이름을 사용하면 에러를 보내는 기능 구현
- repository에서 findOne 메소드를 이용, 같은 유저 이름을 가진 아이디 확인
- 없으면 데이터를 저장하는 방법이나 데이터베이스 처리를 두번해야함
- 데이터베이스 레벨에서 같은 이름을 가진 유저가 있으면 에러를 던져주는 방법(catch-try)

---

## 🔄 두번째 방법 구현

### 1. 구현

- user.entity.ts에서 유니크한 값을 원하는 필드 값 세팅

### 2. 테스트

- 이미 있는 유저를 다시 생성하려면 에러 발생
- NestJs에서 에러가 발생, try catch 구문인 catch에서 잡아주지 않으면 에러가 controller 레벨로 넘어감
- try catch 구문을 써야함

### Try Catch

- try catch 구문
  user.repository.ts

```ts
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

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

    // try-catch 문 적용
    try {
      await this.save(user);
    } catch (error) {
      // "23505"는 PostgreSQL의 unique violation에러 코드이다.
      if (error.code === '23505') {
        throw new ConflictException('Existiong username');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
```

---

## 결과

{
"username": "yohan",
"password": "1231111"
}

중복 시

{
"message": "Existiong username",
"error": "Conflict",
"statusCode": 409
}

---
