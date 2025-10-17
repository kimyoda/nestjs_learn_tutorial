# 유저 데이터 유효성 체크

## 📋 목표

- 유저를 생성할 때 원하는 이름의 길이 비밀번호 같은 유효성 체크를 할 수 있게 각 Coulumn에 맞는 조건을 건다.

---

### 1. Class-validator

- https://github.com/typestack/class-validator
- 유효성 체크를 하기 위해 class-validator 모듈을 이용하면 된다.
- Dto 파일에서 Request 들어오는 값을 정의
- Dto 파일에 값들 하나하나 class-validator를 이용해 유효성 조건을 넣어준다.
- auth-credentials.ts

```ts
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  // 영어랑 숫자만 가능한 유효성 체크
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts english and number',
  })
  password: string;
}
```

### 2. ValidationPipe

- 요청이 컨트롤러에 있는 핸들러로 들어왔을 때 Dto에 있는 유효성 조건에 맞게 체크를 해준다.
- ValidationPipe를 넣어주면 된다.
  auth.controller.ts

```ts
  @Post('/signup')
  signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }
```

### 3. 원하는 에러 메세지 설정하기

- 비밀번호가 유효성 체크에 걸리면 엄청 긴 에러메세지가 나온다.
- 이 부분을 원하는 메세지로 세팅하도록 설정한다.
  결과
  1 "요한" "1234"
  2 "yohan" "1231111"

---

사용예시
{
"username": "yohan",
"password": "1231111!"
}
결과
{
"message": [
"password only accepts english and number"
],
"error": "Bad Request",
"statusCode": 400
}

---

### 4. 데코레이터 상세 설명 (class-validator)

- **@IsString()**: 값이 문자열(String) 타입인지 검사한다. 숫자/불리언/객체가 오면 실패한다.
  - 파이프에서 `transform: true`를 쓰지 않는 이상, JSON의 숫자 123은 그대로 number로 처리된다.

- **@MinLength(n)**: 문자열 길이가 최소 n 이상인지 검사한다.
  - 공백도 길이에 포함됩니다. 앞뒤 공백을 허용하지 않으려면 사전 trim 처리 또는 커스텀 파이프 사용을 고려해야한다.

- **@MaxLength(n)**: 문자열 길이가 최대 n 이하인지 검사한다.

- **@Matches(regex, { message })**: 주어진 정규식과 일치하는지 검사한다.
  - `message` 옵션으로 더 친절한 에러 메세지를 제공할 수 있다.
  - 단순히 영문/숫자만 허용하려면 `/^[a-zA-Z0-9]+$/`처럼 사용한다.
  - 비밀번호 정책을 강화하려면 전방탐색(lookahead) 등을 포함한 패턴을 사용할 수 있다.

```ts
// 예: 영문/숫자만 허용(1자 이상)
@Matches(/^[a-zA-Z0-9]+$/, {
  message: 'only english letters and numbers are allowed',
})

// 예: 8~20자, 영문 1개 이상 + 숫자 1개 이상 포함(특수문자 불가)
@Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, {
  message: 'password must be 8-20 chars, include letters and numbers',
})
```

> 참고: **@IsAlphanumeric()**로 영문/숫자 체크를 간단히 대체할 수도 있습니다.

### 5. 정규식(RegExp) 요약

- **형식**: `/패턴/플래그` (예: `/^[a-z]+$/i`)
  - **주요 플래그**: `i`(대소문자무시), `g`(전역검색), `m`(멀티라인), `u`(유니코드)

- **주요 기호/메타문자**
  - `^` / `$`: 문자열의 시작/끝과 매칭
  - `[]`: 문자 클래스(대괄호 안에서 한 글자 매칭). 예: `[a-zA-Z0-9]`
  - `-`: 범위 지정. 예: `a-z`
  - 수량자: `*`(0회 이상), `+`(1회 이상), `?`(0 또는 1회), `{m,n}`(m~n회)
  - 단축 클래스: `\d`(숫자), `\w`(워드문자), `\s`(공백) — 대문자는 반대 의미
  - `.`: 임의의 한 문자(기본적으로 개행 제외)
  - 그룹/OR: `()`, `|`

- **현재 문서 예시 해설**
  - `/^[a-zA-Z0-9]*$/`: 영문 대소문자+숫자만 0자 이상 허용(빈 문자열 허용)
  - `/^[a-zA-Z0-9]+$/`: 영문 대소문자+숫자만 1자 이상 허용(빈 문자열 불허)

```ts
// 빈 문자열 허용(0자 이상)
/^[a-zA-Z0-9]*$/

// 빈 문자열 불허(1자 이상)
/^[a-zA-Z0-9]+$/

// 8~20자, 영문/숫자 혼합 필수(특수문자 불가)
/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/
```
