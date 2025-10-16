# 게시물 생성하기

## 📋 목표

- 데이터베이스에서 특정 ID의 게시물을 조회하는 기능 구현
- TypeORM의 Repository 패턴 활용
- Board 서비스에 Board 리포지토리를 주입하여 사용

---

## 🔄 NestJS 요청 처리 흐름

### 1. 사용자 (User) → 요청 (Request)

- 사용자가 웹사이트의 특정 URL로 접속
- 브라우저가 서버에 **HTTP 요청(Request)** 전송

### 2. 요청 (Request) → 컨트롤러 (Controller)

- **컨트롤러**가 요청을 가장 먼저 받는 관문 역할
- `@Get`, `@Post` 등 데코레이터로 요청 타입 확인
- 어떤 처리를 해야 할지 라우팅 결정

### 3. 컨트롤러 (Controller) → 서비스 (Service)

- **서비스**는 실질적인 비즈니스 로직을 처리하는 핵심 계층
- 데이터베이스 조회, 데이터 가공 등의 실제 업무 수행
- 예: '특정 게시물 가져오기' 요청 시 데이터베이스에서 해당 게시물 조회

---

## 🛠️ Service에서 getBoardById 메소드 구현

### 핵심 개념

- **TypeORM의 findOne 메소드** 사용
- **async/await** 패턴으로 비동기 데이터베이스 작업 처리
- **예외 처리**를 통한 안전한 에러 핸들링

### JavaScript vs NestJS 비동기 처리

- **async/await**: JavaScript 표준 문법과 **동일**
- **Promise**: JavaScript 표준 문법과 **동일**
- **차이점**: NestJS에서는 TypeORM과 함께 사용하여 데이터베이스 비동기 작업을 더 체계적으로 관리

### TypeORM 메소드 설명

- **findOne(id)**: 데이터베이스에서 특정 ID에 해당하는 단일 레코드 조회
- **반환값**: 해당하는 레코드가 있으면 엔티티 객체, 없으면 `null`
- **비동기**: 데이터베이스 I/O 작업이므로 Promise 반환

```ts
async getBoardById(id: number): Promise<Board> {
  const found = await this.boardRepository.findOne(id);

  if (!found) {
    throw new NotFoundException(`Can't find Board with id ${id}`);
  }

  return found;
}
```

### 코드 설명

- `async`: 이 함수가 비동기 함수임을 선언
- `Promise<Board>`: Board 타입의 Promise를 반환함을 명시
- `await`: findOne 작업이 완료될 때까지 대기
- `NotFoundException`: NestJS에서 제공하는 HTTP 예외 클래스

---

## 🎯 Controller 수정

### 목적

- 서비스의 `getBoardById` 메소드를 호출
- URL 파라미터로 받은 `id` 값을 서비스에 전달
- 클라이언트에게 결과 반환

```ts
@Get('/:id')
getBoardById(@Param('id') id: number): Promise<Board> {
  return this.boardsService.getBoardById(id);
}
```

### 코드 설명

- `@Get('/:id')`: GET 요청으로 URL 파라미터 `id`를 받는 엔드포인트
- `@Param('id')`: URL에서 `id` 파라미터를 추출하여 메소드 인자로 주입
- `Promise<Board>`: 서비스 메소드와 동일한 반환 타입 명시
