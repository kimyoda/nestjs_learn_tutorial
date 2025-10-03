# 특정 게시물 상태 업데이트

- 특정 게시물의 상태 (PUBLIC 또는 PRIVATE)를 업데이트 해주는 기능을 구현한다.
- CRUD의 **U(Update)** 부분에 해당

---

## 1. @Patch 데코레이터란? 🎯

### 1.1 HTTP 메서드 비교

| HTTP 메서드 | 용도          | 설명                      |
| ----------- | ------------- | ------------------------- |
| `PUT`       | 전체 업데이트 | 리소스의 모든 필드를 교체 |
| `PATCH`     | 부분 업데이트 | 리소스의 특정 필드만 수정 |

### 1.2 @Patch를 사용하는 이유

**왜 PUT이 아닌 PATCH를 사용할까?**

- 게시물의 **상태(status)만** 변경하고 싶음
- `title`, `description`은 그대로 두고 `status`만 업데이트
- REST API 설계 원칙에 따라 부분 업데이트에는 PATCH 사용

---

## 2. Service에서 updateBoardStatus 메서드 구현

### 2.1 기본 구현

```ts
// update 메서드
updateBoardStatus(id: string, status: BoardStatus): Board {
  const board = this.getBoardById(id);
  board.status = status;
  return board;
}
```

### 2.2 코드 분석

**1. `const board = this.getBoardById(id);`**

- 기존에 구현한 `getBoardById` 메서드 재사용
- 해당 ID의 게시물을 찾아서 가져옴
- 게시물이 없으면 `getBoardById`에서 `NotFoundException` 발생

**2. `board.status = status;`**

- 찾은 게시물의 `status` 필드만 업데이트
- 객체 참조를 통해 원본 배열의 데이터가 직접 수정됨

**3. `return board;`**

- 업데이트된 게시물 객체를 반환
- 클라이언트가 변경된 내용을 확인할 수 있음

### 2.3 메모리에서의 데이터 변경 과정

```ts
// 업데이트 전
boards = [
  { id: '1', title: '제목1', description: '내용1', status: 'PUBLIC' },
  { id: '2', title: '제목2', description: '내용2', status: 'PUBLIC' },
];

// updateBoardStatus("1", "PRIVATE") 실행 후
boards = [
  { id: '1', title: '제목1', description: '내용1', status: 'PRIVATE' }, // 상태만 변경
  { id: '2', title: '제목2', description: '내용2', status: 'PUBLIC' },
];
```

---

## 3. Controller에서 @Patch 구현

### 3.1 Controller 메서드 구현

```ts
@Patch('/:id/status')
updateBoardStatus(
  @Param('id') id: string,
  @Body('status') status: BoardStatus,
) {
  return this.boardService.updateBoardStatus(id, status);
}
```

### 3.2 코드 분석

**1. `@Patch('/:id/status')`**

- HTTP PATCH 메서드로 요청 처리
- URL 패턴: `/boards/:id/status`
- 예시: `PATCH /boards/123/status`

**2. `@Param('id') id: string`**

- URL에서 `:id` 부분을 추출
- 예시: `/boards/123/status` → `id = "123"`

**3. `@Body('status') status: BoardStatus`**

- 요청 Body에서 `status` 필드만 추출
- `BoardStatus` 타입으로 자동 변환

### 3.3 요청 예시

**요청:**

```http
PATCH /boards/123/status
Content-Type: application/json

{
  "status": "PRIVATE"
}
```

**응답:**

```json
{
  "id": "123",
  "title": "기존 제목",
  "description": "기존 내용",
  "status": "PRIVATE"
}
```

---
