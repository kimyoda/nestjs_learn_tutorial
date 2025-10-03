# 게시물 생성하기 (CRUD => C): Controller

- 게시물 생성 기능을 Controller에서 구현한다.

---

## 1. Controller에서 게시물 생성 API 구현

### 1.1 필요한 모듈 import

```ts
import { Controller, Get, Post, Body } from "@nestjs/common";
import { BoardsService } from "./boards.service";
import { Board } from "./board.model";
```

### 1.2 POST 메서드 구현

```ts
@Post()
createBoard(
  @Body('title') title: string,
  @Body('description') description: string,
): Board {
  return this.boardService.createBoard(title, description);
}
```

### 1.3 전체 Controller 코드

```ts
import { Controller, Get, Post, Body } from "@nestjs/common";
import { BoardsService } from "./boards.service";
import { Board } from "./board.model";

@Controller("boards")
export class BoardsController {
  constructor(private boardService: BoardsService) {}

  @Get("/")
  getAllBoards(): Board[] {
    return this.boardService.getAllBoards();
  }

  @Post()
  createBoard(
    @Body("title") title: string,
    @Body("description") description: string
  ): Board {
    return this.boardService.createBoard(title, description);
  }
}
```

---

## 결과

{
"id": "729f4860-a04e-11f0-aa65-a3cd7489eb37",
"title": "김요한 폴더1",
"description": "Description 1",
"status": "PUBLIC"
}
