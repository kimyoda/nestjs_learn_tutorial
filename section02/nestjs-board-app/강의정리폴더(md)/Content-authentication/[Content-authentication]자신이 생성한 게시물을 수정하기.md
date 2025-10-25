# 자신이 생성한 게시물을 수정하기

- 수정하고자 원하는 게시물의 아이디를 이용, 자신이 작성한 게시물을 수정한다.

---

# 구현

예시

```ts
  @Patch('/:id/status')
  updateBoardStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', BoardStatusValidationPipe) status: BoardStatus,
    @GetUser() user: User,
  ): Promise<Board> {
    return this.boardService.updateBoardStatus(id, status, user);
  }
```

srvice

```ts
async getAllBoards(
  user: User,
): Promise <Board []> {
  const query = this.boardRepository.createQueryBuilder('board');

  query.where('board.userId = :userId', { userId: user.id})

  const boards = await query.getMany ();
  return boards;
}
```

---

결과값

user2가 작성한 게시물만 가져옴

```json
[
  {
    "id": 3,
    "title": "board3",
    "description": "new description",
    "status": "PUBLIC"
  },
  {
    "id": 4,
    "title": "board4",
    "description": "new description",
    "status": "PUBLIC"
  }
]
```

---

# TypeORM QueryBuilder 개념 정리

## createQueryBuilder란?

```typescript
const query = this.boardRepository.createQueryBuilder('board');
```

- **QueryBuilder**: TypeORM에서 제공하는 SQL 쿼리를 프로그래밍 방식으로 작성할 수 있게 해주는 도구
- **createQueryBuilder('board')**: 'board'는 별칭(alias)으로, 실제 테이블명 대신 사용할 수 있는 짧은 이름
- 복잡한 쿼리나 동적 쿼리를 작성할 때 유용

## where절 활용

```typescript
query.where('board.userId = :userId', { userId: user.id });
```

- **where()**: SQL의 WHERE 조건을 추가하는 메서드
- **:userId**: 파라미터 바인딩을 위한 플레이스홀더 (SQL Injection 방지)
- **{ userId: user.id }**: 실제 값이 바인딩될 객체
- 여러 조건을 추가할 때는 `andWhere()`, `orWhere()` 사용

## getMany() 메서드

```typescript
const boards = await query.getMany();
```

- **getMany()**: 쿼리 결과를 배열로 반환
- **getOne()**: 단일 결과를 반환 (없으면 null)
- **getRawMany()**: 원시 SQL 결과 반환
- **getRawOne()**: 단일 원시 결과 반환

## QueryBuilder의 장점

```typescript
// 동적 쿼리 예시
const query = this.boardRepository.createQueryBuilder('board');

if (status) {
  query.andWhere('board.status = :status', { status });
}

if (searchKeyword) {
  query.andWhere('board.title LIKE :keyword', {
    keyword: `%${searchKeyword}%`,
  });
}

query.orderBy('board.createdAt', 'DESC');
query.limit(10);
query.offset(0);

return await query.getMany();
```

- **동적 쿼리**: 조건에 따라 다른 쿼리를 생성 가능
- **타입 안전성**: TypeScript와 함께 사용하면 컴파일 타임에 오류 검출
- **가독성**: 복잡한 SQL을 메서드 체이닝으로 표현
- **재사용성**: 쿼리 로직을 함수로 분리하여 재사용 가능
