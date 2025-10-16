# 게시물 모든 게시물 가져오기

---

## 🔄 모든 게시물 가져오기

board.service.ts

```ts
  // 모든 게시물 가져오기
  async getAllBoards(): Promise<Board[]> {
    return this.boardRepository.find();
  }
```

board.controller.ts

```ts
  // 모든 게시물 가져오기
  @Get()
  getAllBoard(): Promise<Board[]> {
    return this.boardService.getAllBoards();
  }
```

## 🔍 TypeORM의 find() 메소드란?

`find()` 메소드는 TypeORM Repository에서 제공하는 기본 메소드로, 데이터베이스에서 모든 레코드를 조회할 때 사용한다.

### 주요 특징:

- **전체 조회**: 조건 없이 해당 테이블의 모든 데이터를 가져옴
- **배열 반환**: 조회된 모든 레코드를 배열 형태로 반환
- **자동 매핑**: 데이터베이스 결과를 Entity 객체로 자동 변환
- **비동기 처리**: Promise를 반환하여 비동기적으로 처리

### 사용 예시:

- 게시판의 모든 게시물 목록 조회
- 관리자 페이지에서 전체 데이터 확인
- 통계나 분석을 위한 전체 데이터 수집

### 주의사항:

데이터가 많을 경우 성능에 영향을 줄 수 있으므로, 필요에 따라 페이지네이션이나 필터링을 고려해야 한다.
