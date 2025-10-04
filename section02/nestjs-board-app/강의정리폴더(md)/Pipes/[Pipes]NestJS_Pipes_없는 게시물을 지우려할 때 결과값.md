### 없는 게시물을 지우려 할 때 결과값 처리

- 없는 게시물을 ID로 가져 올때 지우려할때도 에러값을 주려한다.

---

# 구현

- 이미 있는 getBoardById를 이용해, 체크해주고 없다면 에러 문구를 보내면된다.

예시

```ts
  // delete 메서드
  deleteBoard(id: string): void {
    const found = this.getBoardById(id);
    this.boards = this.boards.filter((board) => board.id !== found.id);
  }
```

---
