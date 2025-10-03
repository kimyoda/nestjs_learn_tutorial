# ID로 특정 게시물 지우기

- ID를 이용해서 특정 게시물을 지우기 기능을 구현
- Service → Controller 순서로 구현

---

## 1. Service에서 deleteBoard 메서드 구현

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
