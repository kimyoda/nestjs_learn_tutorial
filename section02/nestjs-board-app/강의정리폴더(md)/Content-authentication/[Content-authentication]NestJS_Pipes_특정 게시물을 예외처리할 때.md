### 특정 게시물을 찾을 때 없는 경우 결과 값 처리

- 현재 특정 게시물을 ID로 가져올 때 없는 게시물을 가져오려 하면 결과값으로 아무 내용 없이 돌아온다.
- 에러를 표출하기 위해 예외 인스턴스를 생성해서 이용해준다.

---

# 예시

```ts
  // id를 활용 특정 게시물 가져오는 메서드
  getBoardById(id: string): Board {
    const targetBoard = this.boards.find((board) => board.id === id);

    // 찾은 게시물이 없다면, NotFoundException 예외를 던집니다.
    if (!targetBoard) {
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }

    // 게시물을 찾았다면, 해당 게시물을 반환합니다.
    return targetBoard;
  }

```

결과 예시

```json
{
  "message": "Cannot POST /boards/wadsasd",
  "error": "Not Found",
  "statusCode": 404
}
```

---
