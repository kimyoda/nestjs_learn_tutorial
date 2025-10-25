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

controller

```ts
  async getBoardById {
    id: number,
    user: User
  }: Promise<Board> {
    const found await this.boardRepository.findOne({where: {id, userId: user.id}});

    if (!found) {
      throw new NotFoundException(`Can't find Board with id ${id}`)
    }

    return found;
  }
```

결과 예시
user2로 만든 게시물(토큰받아옴) -> user3으로 로그인하여 지워보기(에러)

```json
{
  "message": "Can't find Board with id 7",
  "error": "Not Found",
  "statusCode": 404
}
```

---
