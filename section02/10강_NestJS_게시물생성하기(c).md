# 게시물 생성하기 (CRUD => C): Service

- 게시물 생성 긴을 만들기 전 게시물에 필요한 데이터 구조를 정의하기 위해 **Board Model**을 생성한다.

---

## 1. uuid 모듈 설치

게시물 ID를 유니크하게 생성하기 위해 uuid 모듈을 설치한다.

```bash
npm install uuid --save
```

---

## 2. Service에서 게시물 생성 로직 구현

### 2.1 필요한 모듈 import

```ts
import { Injectable } from "@nestjs/common";
import { Board, BoardStatus } from "./board.model";
import { v1 as uuid } from "uuid";
```

### 2.2 createBoard 메소드 구현

```ts
createBoard(title: string, description: string): Board {
  const board: Board = {
    id: uuid(),
    title,
    description,
    status: BoardStatus.PUBLIC,
  };
  this.boards.push(board);
  return board;
}
```

**구현 내용:**

- `uuid()`: 유니크한 ID 생성
- `title`, `description`: 요청받은 제목과 내용
- `status`: 기본값으로 `PUBLIC` 설정
- `this.boards.push()`: 생성된 게시물을 배열에 추가
- `return board`: 생성된 게시물 반환

---

## 3. Controller에서 POST 핸들러 구현

### 3.1 필요한 데코레이터 import

```ts
import { Controller, Get, Post, Body } from "@nestjs/common";
```

### 3.2 POST 핸들러 구현

```ts
@Post()
createBoard(
  @Body('title') title: string,
  @Body('description') description: string,
): Board {
  return this.boardService.createBoard(title, description);
}
```

**구현 내용:**

- `@Post()`: POST 요청을 처리하는 핸들러
- `@Body('title')`, `@Body('description')`: 요청 body에서 데이터 추출
- Service의 `createBoard` 메소드 호출

---

## 4. 게시물 생성 API 사용법

### 4.1 요청 방법

```bash
POST http://localhost:3000/boards
Content-Type: application/json

{
  "title": "게시물 제목",
  "description": "게시물 내용"
}
```

### 4.2 응답 예시

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "게시물 제목",
  "description": "게시물 내용",
  "status": "PUBLIC"
}
```

---

## 5. 게시물 ID 처리 방식

### 5.1 데이터베이스 사용 시

- 데이터베이스가 자동으로 유니크한 ID 생성
- Primary Key, Auto Increment 등 활용

### 5.2 메모리 배열 사용 시 (현재)

- `uuid` 모듈을 사용하여 유니크한 ID 생성
- `v1 as uuid`로 import하여 사용
- 모든 게시물에 고유한 식별자 보장

---

## 6. 전체 흐름도

```scss
[클라이언트] POST 요청 (/boards)
   ↓
[Controller] @Post() 핸들러
   ↓
[Controller] @Body()로 데이터 추출
   ↓
[Service] createBoard() 메소드 호출
   ↓
[Service] uuid()로 ID 생성
   ↓
[Service] Board 객체 생성 및 배열에 추가
   ↓
[Controller] 생성된 Board 반환
   ↓
[클라이언트] 응답 받음
```

### 핵심요약

- **uuid 모듈**: 유니크한 ID 생성
- **Service**: 게시물 생성 로직 처리
- **Controller**: POST 요청 처리 및 Service 호출
- **@Body()**: 요청 데이터 추출
- **전체 흐름**: Controller → Service → 데이터 생성 → 반환
