### NestJS Board-App : 게시판 모듈 생성

---

## ✅ 개요

- NestJS 애플리케이션의 핵심 기능 중 하나인 **게시판 모듈(Board Module)**을 생성하는 과정을 다룬다.
- 최종적으로 아래와 같은 구조를 목표로 하며, 이번 단계에서는 `BoardModule`을 생성한다.

### 최종 애플리케이션 구조(해당 강의)

- **AppModule (Root)**
  - **BoardModule**
    - BoardController
    - BoardService
    - BoardEntity
    - BoardRepository
  - **AuthModule**
    - AuthController
    - AuthService
    - UserEntity
    - UserRepository
    - ValidationPipe, JWT, Passport

---

## 🛠️ 1. 모듈 생성

NestJS CLI를 사용하여 `boards`라는 이름의 새로운 모듈을 생성합니다. 터미널에서 아래 명령어를 실행하세요.

```bash
nest g module boards
```

- nest: NestJS CLI 실행 명령어이다.
- g: generate의 축약어입니다.
- module: 생성할 스케매틱(schematic)의 유형을 지정한다.
- boards: 생성할 모듈의 이름이다.

## 📌 2. 모듈 자동 등록 확인

- `nest g module` 명령어를 사용하면 생성된 모듈이 루트 모듈(`app.module.ts`)에 자동으로 imports 배열에 추가됩니다. 이는 별도의 설정 없이 `BoardModule`을 즉시 사용할 수 있게 해줍니다.

```ts
// src/app.module.ts

import { Module } from "@nestjs/common";
import { BoardsModule } from "./boards/boards.module";

@Module({
  imports: [BoardsModule], // 자동으로 추가된 부분
})
export class AppModule {}
```

---
