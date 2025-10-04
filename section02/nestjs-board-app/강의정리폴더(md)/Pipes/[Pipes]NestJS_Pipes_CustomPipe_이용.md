# 🛠️ NestJS Custom Pipe 완벽 가이드

> **나만의 파이프를 만들어보자! 커스텀 파이프 구현하기**

---

## 🤔 Custom Pipe란?

**Custom Pipe는 NestJS에서 제공하는 기본 파이프로는 해결할 수 없는 특별한 요구사항을 위해 직접 만드는 파이프입니다.**

### 🎯 Custom Pipe를 만드는 이유

- 기본 파이프로는 처리할 수 없는 복잡한 검증 로직
- 비즈니스 로직에 특화된 데이터 변환
- 특정 도메인에 맞는 유효성 검사

---

## 🏗️ 커스텀 파이프 구현 방법

### 📋 기본 구조

- **PipeTransform 인터페이스**를 구현해야 함
- PipeTransform은 모든 파이프에서 **반드시 구현**해야 하는 인터페이스
- **transform() 메소드**를 필수로 포함해야 함
- NestJS가 인자(arguments)를 처리하기 위해 사용

### 🔧 transform() 메소드의 역할

**transform() 메소드는 두 개의 파라미터를 받습니다:**

1. **value** (첫 번째 파라미터): 처리할 인자의 값
2. **metadata** (두 번째 파라미터): 인자에 대한 메타데이터를 포함한 객체

### 📤 반환값과 예외 처리

- **성공**: transform() 메소드에서 반환된 값이 Route 핸들러로 전달
- **실패**: 예외가 발생하면 클라이언트에 바로 에러 전달

```ts
import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

export class BoardStatusValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('value', value);
    console.log('metadata', metadata);

    return value;
  }
}
```

---

## 🧪 실제 테스트해보기

### 📝 테스트 단계

1. **커스텀 파이프 생성** ✅
2. **게시물 업데이트 핸들러에 커스텀 파이프 적용** ✅
3. **Postman으로 요청 테스트** ✅

### 🔄 GET으로 얻은 데이터를 PATCH에 적용

**요청 URL:**

```
localhost:3000/boards/a3df51c0-a12c-11f0-a8b4-c985fed73ffe/status
```

**유효한 요청 (PUBLIC):**

```json
{
  "id": "a3df51c0-a12c-11f0-a8b4-c985fed73ffe",
  "title": "체크용2",
  "description": "체크",
  "status": "PUBLIC"
}
```

**유효하지 않은 요청 (12345):**

```json
{
  "id": "a3df51c0-a12c-11f0-a8b4-c985fed73ffe",
  "title": "체크용2",
  "description": "체크",
  "status": "12345"
}
```

**콘솔 출력 결과:**

```bash
value public
metadata { metatype: [Function: String], type: 'body', data: 'status' }
```

---

## 🎯 실제 기능 구현하기

### 💡 구현할 기능

**상태는 PUBLIC과 PRIVATE만 허용하고, 나머지는 에러를 발생시키는 기능**

### 🔒 readonly 클래스 프로퍼티

- **readonly** 접두사는 속성을 읽기 전용으로 만듦
- 읽기 전용 멤버는 클래스 외부에서 접근 가능하지만 **값 변경은 불가능**
- 상수값을 저장할 때 유용

```ts
import { BadRequestException, PipeTransform } from '@nestjs/common';
import { BoardStatus } from '../board.model';

export class BoardStatusValidationPipe implements PipeTransform {
  readonly StatusOptions = [BoardStatus.PRIVATE, BoardStatus.PUBLIC];

  transform(value: any) {
    value = value.toUpperCase();

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value} isn't in the status options`);
    }

    return value;
  }

  private isStatusValid(status: any) {
    const index = this.StatusOptions.indexOf(status);
    return index !== -1;
  }
}
```

### 🔍 코드 동작 방식 설명

1. **StatusOptions**: 허용되는 상태값들을 배열로 정의 (readonly로 보호)
2. **transform()**:
   - 입력값을 대문자로 변환 (`toUpperCase()`)
   - `isStatusValid()` 메소드로 유효성 검사
   - 유효하지 않으면 `BadRequestException` 발생
   - 유효하면 변환된 값을 반환
3. **isStatusValid()**:
   - `indexOf()`로 허용된 상태값 배열에 존재하는지 확인
   - 존재하면 `true`, 없으면 `false` 반환

---

## 🎉 Custom Pipe의 장점

- **재사용성**: 한 번 만들면 여러 곳에서 사용 가능
- **유연성**: 비즈니스 로직에 맞는 자유로운 검증 규칙 구현
- **유지보수성**: 검증 로직을 한 곳에서 관리
- **타입 안전성**: TypeScript와 함께 사용하면 더욱 안전한 코드 작성

> **💡 Tip**: Custom Pipe는 마치 나만의 특별한 검사관을 만드는 것과 같습니다. 기본 검사관으로는 해결할 수 없는 특별한 경우를 위해 직접 만드는 맞춤형 검사관이라고 생각하시면 됩니다!

---

# 예시

- 성공

```json
{
  "id": "a7e314d0-a12e-11f0-a6ed-83ff2f7b036a",
  "title": "체크용2",
  "description": "체크",
  "status": "PRIVATE"
}
```

- 실패

```json
{
  "message": "이건 실패 isn't in the status options",
  "error": "Bad Request",
  "statusCode": 400
}
```
