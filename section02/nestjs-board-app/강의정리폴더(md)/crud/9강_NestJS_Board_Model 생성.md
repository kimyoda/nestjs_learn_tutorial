# Board Model 정의하기

- 게시물 생성 긴을 만들기 전 게시물에 필요한 데이터 구조를 정의하기 위해 **Board Model**을 생성한다.

---

## 1. Model 파일 생성

- `board.model.ts` 파일을 생성하여 게시물의 데이터 구조를 정의한다.
- 정의방법:
  - **Class**: 변수의 타입체크, 인스턴스 생성 가능
  - **Interface**: 변수의 타입만 체크 (구조 정의 적합)

---

## 2. Board Interface 구조 정의

```ts
export interface Board {
  id: string; // 게시물 식별자
  title: string; // 제목
  description: string; // 내용 설명
  status: BoardStatus; // 게시물 상태
}
```

---

## 3. BoardStatus Enum정의

- 게시물이 **공개 게시물**인지 **비밀 게시물**인지 구분하는 상택밧
- 두 가지 상태 외에는 허용되지 않도록 **Enum**사용
- `status` 필드에 `BoardStatus` 타입을 지정하여 제한된 값만 사용 가능

```ts
export enum BoardStatus {
  PUBLIC = "PUBLIC", // 공개 게시물
  PRIVATE = "PRIVATE", // 비밀 게시물
}
```

---

## 4. 타입 정의 적용

생성한 Board model을 이용해서 타입을 정의한다

- **Service**: `boards` 변수와 메소드 리턴값에 타입 정의
- **Controller**: 핸들러에서 결과값을 리턴하는 부분에 타입 정의
- **메소드**: 파라미터와 반환값에 Board 타입 적용

---

## 5. 타입 정의의 장점

```scss
[타입 정의]  선택사항이지만 권장
   ↓
[에러 방지]  잘못된 타입 사용 시 컴파일 에러
   ↓
[가독성 향상]  코드 구조 명확화 (readable)
   ↓
[개발 생산성]  IDE 자동완성 및 타입 체크
   ↓
[유지보수성]  코드 구조 파악 용이
```

### 핵심요약

- **Interface**: Board 데이터 구조 정의
- **Enum**: BoardStatus로 제한된 상태값 관리
- **타입 정의**: 에러 방지, 가독성, 생산성 향상
- **적용 범위**: Service, Controller, 메소드 전체에 타입 적용
