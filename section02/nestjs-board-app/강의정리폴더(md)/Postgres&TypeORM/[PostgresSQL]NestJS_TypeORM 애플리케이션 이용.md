### NestJS_TypeORM

---

## 🤔 TypeORM 애플리케이션 이용

### 📚 TypeORM이란?

TypeORM은 TypeScript와 JavaScript를 위한 ORM(Object-Relational Mapping) 라이브러리입니다.

- **ORM**: 객체지향 프로그래밍 언어와 관계형 데이터베이스 간의 호환되지 않는 데이터를 변환하는 프로그래밍 기법
- **장점**: SQL을 직접 작성하지 않고도 데이터베이스와 상호작용할 수 있음
- **NestJS와의 연동**: NestJS에서 TypeORM을 사용하면 더욱 쉽고 안전하게 데이터베이스 작업을 할 수 있습니다

### 📦 TypeORM을 사용하기 위해서 설치해야하는 모듈들

#### @nestjs/typeorm

- **역할**: NestJS에서 TypeORM을 사용하기 위해 연동시켜주는 모듈
- **설명**: NestJS의 모듈 시스템과 TypeORM을 연결해주는 브릿지 역할

#### typeorm

- **역할**: TypeORM의 핵심 모듈
- **설명**: 실제 ORM 기능을 제공하는 메인 라이브러리

#### pg

- **역할**: PostgreSQL 데이터베이스 드라이버
- **설명**: Node.js에서 PostgreSQL 데이터베이스에 연결하기 위한 드라이버

```bash
npm install pg typeorm @nestjs/typeorm --save
```

> 💡 **참고**: `--save` 옵션은 package.json의 dependencies에 패키지를 추가합니다.

**공식 다큐멘테이션**: https://docs.nestjs.com/techniques/database

---

## 🔄 TypeORM 애플리케이션에 연결하기

### 1️⃣ typeORM 설정파일 생성

#### 📁 파일 위치

`src/configs/typeorm.config.ts` 파일을 생성합니다.

#### ⚠️ 중요한 주의사항

- **synchronize: true**는 개발 모드에서만 사용해야 합니다
- **production 모드에서는 반드시 false로 설정**해야 합니다
- 그렇지 않으면 데이터베이스의 데이터를 잃을 수 있습니다!

#### 📝 설정 파일 내용

```ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
  // Database Type - 사용할 데이터베이스 종류
  type: 'postgres',

  // 데이터베이스 서버 정보
  host: 'localhost', // 데이터베이스 서버 주소
  port: 5432, // PostgreSQL 기본 포트 (해당 비번 → 실제 포트 번호로 변경)
  username: 'postgres', // 데이터베이스 사용자명
  password: 'postgres', // 데이터베이스 비밀번호
  database: 'board.app', // 사용할 데이터베이스 이름

  // 엔티티 설정 - 데이터베이스 테이블과 매핑될 클래스들
  entities: [__dirname + '/../**/*.entity.{js, ts}'],

  // 동기화 설정 (개발용)
  synchronize: true, // ⚠️ production에서는 false로!
};
```

#### 🔍 설정 옵션 상세 설명

**entities 설정 방법:**

1. **자동 스캔 방식** (현재 사용):

   ```ts
   entities: [__dirname + '/../**/*.entity.{js, ts}'];
   ```

   - `__dirname + '/../**/*.entity.{js, ts}'` 패턴으로 모든 엔티티 파일을 자동으로 찾아서 포함
   - 새로운 엔티티를 추가해도 자동으로 인식됨

2. **수동 지정 방식**:

   ```ts
   entities: [User, Board, Comment]; // 각 엔티티를 직접 import해서 지정
   ```

   - 사용할 엔티티를 명시적으로 지정
   - 더 명확하지만 엔티티가 추가될 때마다 수정해야 함

### 2️⃣ 루트 Module에서 Import 합니다.

#### 📁 파일 위치

`src/app.module.ts` 파일을 수정합니다.

#### 📝 코드 구현

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig), // TypeORM 설정을 루트에 적용
    BoardsModule, // 기존 모듈들
  ],
})
export class AppModule {}
```

#### 🔍 코드 설명

**TypeOrmModule.forRoot()의 역할:**

- `forRoot()` 메서드는 TypeORM을 애플리케이션의 루트 레벨에서 설정합니다
- 이 설정은 **모든 하위 모듈(Sub-Module)에 자동으로 적용**됩니다
- 즉, `BoardsModule`이나 다른 모듈에서 별도 설정 없이도 TypeORM을 사용할 수 있습니다

**설정 전파 과정:**

```
AppModule (루트)
├── TypeOrmModule.forRoot() ← 여기서 설정
└── BoardsModule
    └── TypeORM 사용 가능 (자동으로 설정 적용)
```
