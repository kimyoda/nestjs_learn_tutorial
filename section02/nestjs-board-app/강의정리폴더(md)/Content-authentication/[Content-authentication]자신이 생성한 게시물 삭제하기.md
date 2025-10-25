# 자신이 생성한 게시물을 삭제하기

- 자신이 생성한 게시물만을 삭제할 수 있게 기능을 구현

---

# 예시

controller

```ts
  @Delete('/:id')
  getBoardById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Board> {
    return this.boardsService.getBoardBy(id), user;
  }
```

service

```ts
  async updateBoardStatus(
    id: number,
    status: BoardStatus,
    user: User,
  ): Promise<Board> {
    const board = await this.getBoardById(id, user);

    board.status = status;
    await this.boardRepository.save(board);

    return board;
  }
```

결과 예시
localhost:3000/boards/8/status

```json
{
    "status": "PUBLIC"
}
{
    "status": "PRIVATE"
}


{
    "id": 8,
    "title": "board9",
    "description": "new description",
    "status": "PUBLIC",
    "userId": 2
}
{
    "id": 8,
    "title": "board9",
    "description": "new description",
    "status": "PRIVATE",
    "userId": 2
}
```

---
