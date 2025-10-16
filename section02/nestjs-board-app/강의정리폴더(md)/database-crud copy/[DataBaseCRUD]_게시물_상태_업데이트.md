# 게시물 상태 업데이트

---

## 🔄 게시물 상태 업데이트하기

board.service.ts

```ts
  // 게시물 상태 업데이트
  async updateBoardStatus(id: number, status: BoardStatus): Promise<Board> {
    const board = await this.getBoardById(id);

    board.status = status;
    await this.boardRepository.save(board);

    return board;
  }
```

board.controller.ts

```ts
  // 게시물 상태 업데이트
  @Patch('/:id/status')
  updateBoardStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', BoardStatusValidationPipe) status: BoardStatus,
  ): Promise<Board> {
    return this.boardService.updateBoardStatus(id, status);
  }
```

## 예시

{
"status": "PRIVATE"
}

->

{
"id": 1,
"title": "요한1",
"description": "체크",
"status": "PRIVATE"
}

## 🔍 BoardStatusValidationPipe란?

`BoardStatusValidationPipe`는 NestJS의 커스텀 파이프로, 게시물 상태 업데이트 시 전달되는 `status` 값이 유효한지 검증합니다.

### 주요 기능:

- **유효성 검증**: `PUBLIC`, `PRIVATE` 값만 허용
- **자동 변환**: 문자열로 전달된 상태값을 `BoardStatus` enum으로 자동 변환
- **예외 처리**: 잘못된 상태값이 전달되면 `BadRequestException` 발생

### 사용 목적:

게시물 상태는 `BoardStatus` enum에 정의된 특정 값만 허용해야 하므로, 클라이언트에서 잘못된 값을 보내더라도 서버에서 안전하게 처리할 수 있도록 보장합니다.
