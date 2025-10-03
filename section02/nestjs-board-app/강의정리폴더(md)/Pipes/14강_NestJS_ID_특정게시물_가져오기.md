# ID로 특정 게시물 가져오기

- ID를 이용해서 특정 게시물을 가져오는 기능을 구현
- Service → Controller 순서로 구현

---

## 1. Service에서 getBoardById 메서드 구현

### 1.1 기본 구현 (예외처리 없음)

```ts
getBoardById(id: string): Board {
  return this.boards.find((board) => board.id === id);
}
```

**현재 상황:**

- 해당 ID의 게시물이 **존재하면**: Board 객체를 반환
- 해당 ID의 게시물이 **존재하지 않으면**: `undefined`를 반환

### 1.2 문제점 분석

**1. 타입 불일치**

- 메서드는 `Board`를 반환한다고 선언했지만, 실제로는 `Board | undefined`를 반환할 수 있음

**2. 클라이언트 혼란**

- 클라이언트가 `undefined`를 받으면 해당 게시물이 없다는 것을 알 수 없음

**3. 런타임 에러 가능성**

- 클라이언트에서 `undefined`를 Board 객체로 사용하려고 하면 에러 발생

### 1.3 예외처리를 추가하는 이유

**1. 명확한 에러 메시지 제공**

- "해당 게시물을 찾을 수 없습니다" 같은 구체적인 메시지

**2. HTTP 상태 코드로 404 Not Found 응답**

- REST API 표준에 맞는 적절한 상태 코드 반환

**3. 클라이언트가 에러 상황을 명확히 인지 가능**

- 프론트엔드에서 에러 처리를 쉽게 할 수 있음

### 1.4 예외처리 적용된 최종 코드

```ts
import { NotFoundException } from '@nestjs/common';

getBoardById(id: string): Board {
  // 변수명을 'targetBoard'로 명확하게 지정
  const targetBoard = this.boards.find((board) => board.id === id);

  if (!targetBoard) {
    throw new NotFoundException(`Can't find Board with id ${id}`);
  }

  return targetBoard;
}
```

**코드 설명:**

- `find()` 메서드로 해당 ID의 게시물을 찾음
- `if (!targetBoard)`: 게시물이 없으면 (undefined이면)
- `NotFoundException`: NestJS에서 제공하는 404 에러 클래스
- 에러 메시지에 ID를 포함하여 디버깅에 도움

---

## 2. Controller에서 @Param 데코레이터 사용

### 2.1 @Param() 데코레이터란? 🎯

**한마디로 정의:**
URL에 포함된 특정 값(파라미터)을 가져올 때 사용하는 NestJS 데코레이터입니다.

**예시:**

- URL: `/boards/123`
- 여기서 `123`이라는 ID 값을 꺼내오고 싶을 때 사용

**기술적 설명:**
요청(Request) 객체에 들어있는 `params` 속성에서 값을 추출해 컨트롤러 메소드의 파라미터(매개변수)에 넣어주는 역할을 합니다.

### 2.2 사용 방법 📝

**1. 모든 파라미터 한 번에 가져오기**

```ts
// 예시 URL: /boards/nestjs/123
findOne(@Param() params: string[])
```

- `@Param()` 안에 아무것도 쓰지 않으면 URL의 모든 파라미터를 배열이나 객체 형태로 한 번에 받아옴
- 자주 사용되지 않는 방식

**2. 특정 파라미터 하나만 가져오기 (⭐ 가장 일반적인 사용법)**

```ts
// 예시 URL: /boards/123
// 컨트롤러에서 @Get('/:id') 로 경로를 설정했을 경우
findOne(@Param('id') id: string)
```

- `@Param('id')`처럼 데코레이터 안에 키(key) 값을 넣어주면, URL에서 해당 키에 해당하는 값만 정확히 추출
- `/boards/abcde`로 요청이 오면 `id` 변수에는 `'abcde'`라는 문자열이 담김

### 2.3 Controller 구현

```ts
import { Controller, Get, Param } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './board.model';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  // GET /boards/12345 와 같은 요청을 처리
  @Get('/:id')
  getBoardById(@Param('id') id: string): Board {
    // URL의 :id 자리에 있던 '12345' 값이 id 변수로 들어온다.
    return this.boardsService.getBoardById(id);
  }
}
```

**코드 설명:**

- `@Get('/:id')`: URL 경로에서 `:id` 부분을 동적 파라미터로 설정
- `@Param('id') id: string`: URL의 `:id` 자리에 있는 값을 `id` 변수로 추출
- `string` 타입으로 받아서 Service에 전달

---

## 3. 전체 흐름 정리

### 3.1 요청 흐름

```
클라이언트 → GET /boards/123 → Controller → Service → Board 객체 반환
```

### 3.2 에러 처리 흐름

```
클라이언트 → GET /boards/999 → Controller → Service → NotFoundException → 404 에러 응답
```

---

## 4. 핵심 정리 ✨

### 4.1 @Param() 데코레이터

- **목적**: URL 경로의 일부인 동적인 값(파라미터)을 가져올 때 사용
- **사용법**: `@Param('키')`로 특정 키에 해당하는 값만 가져오는 방식이 가장 많이 사용
- **확장성**: 파이프(Pipe)와 함께 사용하면 유효성 검사나 타입 변환 가능

### 4.2 예외처리의 중요성

- **타입 안정성**: 명확한 반환 타입 보장
- **사용자 경험**: 구체적인 에러 메시지 제공
- **API 표준**: REST API 표준에 맞는 HTTP 상태 코드 반환
- **디버깅**: 에러 상황을 쉽게 파악할 수 있음

### 4.3 개발 순서 권장사항

1. **기본 기능 구현**: 예외처리 없이 동작 확인
2. **예외처리 추가**: 안정성과 사용자 경험 개선
3. **테스트**: 다양한 시나리오로 테스트

---
