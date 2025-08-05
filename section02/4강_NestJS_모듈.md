### nest.js의 모듈

---

## ✅ 모듈이란?

- NestJS의 애플리케이션 구성 단위.
- `@Module()` 데코레이터로 정의된 클래스다.
- NestJS가 의존성 주입과 구조화를 수행할 수 있도록 메타데이터 제공한다.
- 하나의 루트 모듈(AppModule)을 포함, 기능별로 하위 모듈 구성

> 예: `UserModule`, `BoardModule`, `ChatModule` 등

---

## 🧩 모듈 구성 예제 (Board 기능)

```ts
// board.module.ts
import { Module } from "@nestjs/common";
import { BoardController } from "./board.controller";
import { BoardService } from "./board.service";

@Module({
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
```

```ts
// board.controller.ts
import { Controller, Get } from "@nestjs/common";
import { BoardService } from "./board.service";

@Controller("board")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  getAllBoards() {
    return this.boardService.findAll();
  }
}
```

## 📌 모듈 특징 정리

| 특징   | 설명                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| 구성   | `@Module()` 데코레이터와 함께 `controllers`, `providers`, `imports`, `exports` 속성 포함 |
| 목적   | 관련된 기능을 그룹화하고 모듈화된 구조 제공                                              |
| 싱글톤 | 기본적으로 모듈은 싱글톤. 여러 모듈에서 동일한 서비스 인스턴스를 공유 가능               |
| 독립성 | 독립적으로 재사용하거나 `imports`를 통해 다른 모듈에서 사용 가능                         |

---

## 💡 추가 개념

### 📌 `imports`

- 다른 모듈에서 정의된 서비스나 컴포넌트를 가져올 때 사용

```ts
@Module({
  imports: [UserModule],
})
```

### 📌 `exports`

- 다른 모듈에서 이 모듈의 provider를 사용하도록 외부에 공개

```ts
@Module({
  providers: [UserService],
  exports: [UserService],
})
```

### 📌 `루트모듈(AppModule)`

- Nest 애플리케이션의 진입점이자 루트 모듈

```ts
@Module({
  imports: [BoardModule],
})
export class AppModule {}
```
