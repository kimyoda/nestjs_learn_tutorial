# DTO(Data Transfer Object) 적용하기

## 1. DTO란?

DTO(Data Transfer Object)는 계층 간 데이터 교환을 위한 객체입니다. 클라이언트에서 서버로 전송되는 데이터의 구조를 정의하고, 데이터 유효성 검사와 타입 안정성을 제공합니다.

**Class를 사용하는 이유:**

- class는 런타임에서 작동하여 파이프(Pipe) 같은 기능을 이용할 때 유용하다.
- 컴파일 시점뿐만 아니라 런타임에서도 존재하여 유효성 검사가 가능하다.

---

## 2. CreateBoardDto 클래스 생성

게시물 생성을 위한 DTO 클래스를 생성합니다.

```ts
export class CreateBoardDto {
  title: string;
  description: string;
}
```

**설명:**

- `title`과 `description` 필드를 가진 간단한 DTO 클래스
- 클라이언트에서 전송할 데이터의 구조를 명확히 정의
- TypeScript의 타입 시스템을 활용하여 타입 안정성 확보

---

## 3. Controller에서 DTO 적용

기존의 개별 파라미터 방식에서 DTO 객체 방식으로 변경합니다.

### 3.1 기존 방식 (개별 파라미터)

```ts
@Post()
createBoard(
  @Body('title') title: string,
  @Body('description') description: string,
): Board {
  return this.boardService.createBoard(title, description);
}
```

### 3.2 DTO 적용 후

```ts
@Post()
createBoard(@Body() createBoardDto: CreateBoardDto): Board {
  return this.boardService.createBoard(createBoardDto);
}
```

**변경 이유:**

- **코드 간소화**: 개별 파라미터를 하나의 객체로 통합
- **유지보수성**: 필드 추가/삭제 시 한 곳만 수정하면 됨
- **타입 안정성**: DTO 클래스로 명확한 타입 정의
- **확장성**: 향후 유효성 검사나 변환 로직 추가 용이

---

## 4. Service에서 구조분해할당 적용

Service에서 DTO 객체를 받아 구조분해할당으로 처리합니다.

```ts
createBoard(createBoardDto: CreateBoardDto) {
  const { title, description } = createBoardDto;
  const board: Board = {
    id: uuid(),
    title,
    description,
    status: BoardStatus.PUBLIC,
  };

  this.boards.push(board);
  return board;
}
```

### 4.1 구조분해할당 (Destructuring Assignment) 설명

```ts
const { title, description } = createBoardDto;
```

**이렇게 작성한 이유:**

- **가독성 향상**: 객체의 속성을 명시적으로 추출
- **코드 간소화**: `createBoardDto.title`, `createBoardDto.description` 대신 `title`, `description` 직접 사용
- **ES6 문법 활용**: 현대적인 JavaScript/TypeScript 문법 사용

### 4.2 구조분해할당 vs 기존 방식 비교

**기존 방식:**

```ts
createBoard(title: string, description: string) {
  const board: Board = {
    id: uuid(),
    title: title,
    description: description,
    status: BoardStatus.PUBLIC,
  };
}
```

**구조분해할당 방식:**

```ts
createBoard(createBoardDto: CreateBoardDto) {
  const { title, description } = createBoardDto;
  const board: Board = {
    id: uuid(),
    title,        // ES6 단축 속성명
    description,  // ES6 단축 속성명
    status: BoardStatus.PUBLIC,
  };
}
```

---

## 5. DTO 적용의 장점

### 5.1 코드 일관성

- 모든 게시물 생성 요청이 동일한 구조를 가짐
- API 스펙이 명확해짐

### 5.2 유지보수성

- 필드 추가/삭제 시 DTO 클래스만 수정
- 여러 곳에 흩어진 파라미터 정의 불필요

### 5.3 확장성

- 향후 유효성 검사 데코레이터 추가 가능
- 변환 로직이나 기본값 설정 용이

### 5.4 타입 안정성

- 컴파일 타임에 타입 체크
- IDE에서 자동완성 및 오류 검출

---
