# 회원 가입 기능 구현

## 📋 목표

- 회원 가입 기능 구현

---

## 🔄 NestJS 요청 처리 흐름

**사용자 (User)**가 애플리케이션에 **요청 (Request)**을 보냅니다.

요청은 라우팅 규칙에 따라 **컨트롤러 (Controller)**의 특정 핸들러(getHello)에 도달합니다. 컨트롤러는 요청을 받아 처리하고, 비즈니스 로직은 서비스에 위임한다.

```ts
// Controller
@Get()
getHello(): string {
  return this.appService.getHello();
}
```

컨트롤러는 의존성으로 주입받은 **서비스 (Service)**의 메서드(getHello)를 호출한다.

서비스는 핵심 비즈니스 로직을 수행합니다. 필요하다면 데이터베이스와 통신하는 **레포지토리 (Repository)**를 호출할 수 있습니다. 로직 처리 후 결과값('Hello World!')을 컨트롤러에 반환한다.

```ts
// Service
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

컨트롤러는 서비스로부터 받은 결과값을 최종 **응답 (Response)**으로 만들어 사용자에게 반환한다.

## ⚠️ 중요! TypeORM 버전 차이로 인한 에러 해결

### 🚨 에러 발생 원인

#### 📊 TypeORM 버전 차이 문제

- **강의 버전**: TypeORM 0.2.x (구버전)
- **현재 버전**: TypeORM 0.3.x+ (최신버전)
- **문제점**: `@EntityRepository()` 데코레이터가 최신 버전에서 **완전히 제거**됨

#### 🔥 발생하는 에러들

```bash
# 이런 에러들이 발생합니다
TypeError: userRepository.createUser is not a function
TypeError: Cannot read property 'save' of undefined
TypeError: this.userRepository.find is not a function
```

### 💡 해결 방법: Custom Repository를 일반 서비스로 변경

#### 🎯 핵심 아이디어

- **구버전**: `@EntityRepository()`로 Repository 자동 등록
- **최신버전**: `@Injectable()`로 일반 서비스로 만들어 수동 등록

---

## 🔧 1단계: user.repository.ts 수정

### ❌ 구버전 코드 (에러 발생)

```ts
// 🚫 이 코드는 최신 TypeORM에서 작동하지 않음
import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User) // ❌ 최신버전에서 제거됨
export class UserRepository extends Repository<User> {
  async createUser(/* ... */): Promise<void> {
    // ...
  }
}
```

### ✅ 최신버전 코드 (정상 작동)

```ts
// src/auth/user.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable() // ✅ NestJS 서비스로 등록
export class UserRepository extends Repository<User> {
  // ✅ 생성자로 Repository 초기화
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(username: string, password: string): Promise<void> {
    const user = this.create({ username, password });
    await this.save(user);
  }
}
```

### 🔍 수정 사항 상세 설명

#### **@Injectable() 추가**

- **역할**: NestJS에게 "이 클래스는 주입 가능한 서비스입니다"라고 알려줌
- **필요성**: 의존성 주입 컨테이너에 등록하기 위해 필수

#### **DataSource 주입**

- **역할**: 데이터베이스 연결 정보를 담고 있는 객체
- **필요성**: Repository가 데이터베이스와 통신하기 위해 필수

#### **super() 호출**

- **역할**: 부모 클래스인 Repository를 올바르게 초기화
- **필요성**: `.save()`, `.find()`, `.create()` 등의 기본 메서드 사용 가능

---

## 🔧 2단계: auth.module.ts 수정

### ❌ 구버전 방식 (에러 발생)

```ts
// 🚫 이 방식은 최신버전에서 작동하지 않음
@Module({
  imports: [TypeOrmModule.forFeature([UserRepository])], // ❌ 에러 발생
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

### ✅ 최신버전 방식 (정상 작동)

```ts
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UserRepository } from './user.repository'; // ✅ Repository import

@Module({
  imports: [TypeOrmModule.forFeature([User])], // ✅ Entity만 등록
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository, // ✅ Repository를 providers에 등록
  ],
})
export class AuthModule {}
```

### 🔍 수정 사항 상세 설명

#### **TypeOrmModule.forFeature([User])**

- **변경**: `[UserRepository]` → `[User]`
- **이유**: Entity만 TypeORM에 등록하고, Repository는 별도로 providers에 등록

#### **providers에 UserRepository 추가**

- **역할**: NestJS 의존성 주입 컨테이너에 Repository 등록
- **필요성**: 다른 서비스에서 Repository를 주입받을 수 있도록 함

---

## 🔧 3단계: auth.service.ts 수정

### ❌ 구버전 방식 (에러 발생)

```ts
// 🚫 이 방식은 최신버전에서 작동하지 않음
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) // ❌ 최신버전에서 작동하지 않음
    private userRepository: Repository<User>,
  ) {}

  async signUp(username: string, password: string): Promise<void> {
    return this.userRepository.createUser(username, password); // ❌ 에러
  }
}
```

### ✅ 최신버전 방식 (정상 작동)

```ts
// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository'; // ✅ Repository 직접 import

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository, // ✅ 직접 주입
  ) {}

  async signUp(username: string, password: string): Promise<void> {
    return this.userRepository.createUser(username, password); // ✅ 정상 작동
  }
}
```

### 🔍 수정 사항 상세 설명

#### **@InjectRepository() 제거**

- **이유**: UserRepository가 이제 일반 서비스이므로 특별한 데코레이터 불필요
- **대안**: 생성자에서 직접 타입 선언으로 주입

#### **Repository 직접 import**

- **장점**: 타입 안정성 확보
- **필요성**: TypeScript 컴파일러가 올바른 타입 체크 가능

---

## 🎯 핵심 정리: 버전 차이 해결법

### 📋 변경 사항 요약

| 구분                | 구버전 (0.2.x)                               | 최신버전 (0.3.x+)             |
| ------------------- | -------------------------------------------- | ----------------------------- |
| **Repository 등록** | `@EntityRepository()`                        | `@Injectable()`               |
| **모듈 등록**       | `TypeOrmModule.forFeature([UserRepository])` | `providers: [UserRepository]` |
| **서비스 주입**     | `@InjectRepository(User)`                    | 직접 주입                     |
| **초기화**          | 자동                                         | `constructor` + `super()`     |

### 🔄 마이그레이션 체크리스트

- [ ] `@EntityRepository()` → `@Injectable()` 변경
- [ ] `DataSource` 주입 및 `super()` 호출 추가
- [ ] `auth.module.ts`에서 `providers`에 Repository 등록
- [ ] `auth.service.ts`에서 `@InjectRepository()` 제거
- [ ] Repository 직접 import 및 주입

### ⚠️ 주의사항

1. **Entity 등록**: `TypeOrmModule.forFeature([User])`에서 Entity만 등록
2. **Repository 등록**: `providers` 배열에 Repository 등록
3. **초기화 필수**: `constructor`에서 `super()` 호출 필수
4. **타입 안정성**: Repository를 직접 import하여 타입 체크

### 🚀 결과

이렇게 수정하면 최신 TypeORM 버전에서도 Custom Repository를 정상적으로 사용할 수 있습니다!

---
