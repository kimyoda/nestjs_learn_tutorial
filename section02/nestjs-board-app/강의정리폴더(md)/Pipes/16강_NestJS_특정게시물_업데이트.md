# 특정 게시물 상태 업데이트

- 특정 게시물의 상태 (PUBLIC 또는 PRIVATE)를 업데이트 해주는 기능을 구현한다.

---

## 1. Service에서 updateBoardStatus 메서드 구현

### 1.1 기본 구현

```ts
  @Delete('/:id')
  deleteBoard(@Param('id') id: string): void {
    this.boardService.deleteBoard(id);
  }
```

```ts
  // delete 메서드
  deleteBoard(id: string): void {
    this.boards = this.boards.filter((board) => board.id !== id);
  }

```
