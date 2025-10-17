# 로그인 기능 구현

## 📋 목표

- 가입한 아이디 로그인 기능 구현

---

## 🔧 구현 코드

### auth.service.ts

```ts
  // 로그인 기능
  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    const { username, password } = authCredentialsDto;
    const user = await this.userRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      return 'logIn success';
    } else {
      throw new UnauthorizedException('logIn failed');
    }
  }
```

### auth.controller.ts

```ts
  // 로그인  기능
  @Post('/signin')
  signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto) {
    return this.authService.signIn(authCredentialsDto);
  }
```

---

## 🧪 테스트 결과

### 1. 회원가입 (사전 준비)

**요청:**

```
POST localhost:3000/auth/signup
Content-Type: application/json

{
  "username": "logincheck",
  "password": "1234"
}
```

**데이터베이스 저장 결과:**

```
8 "logincheck" "$2b$10$Ygmjdr2T5Mc8Hle4tyAAWekGoR/X19R4.nO.22F4TsEiCH7ZZ9Q4O"
```

### 2. 로그인 테스트

**요청:**

```
POST localhost:3000/auth/signin
Content-Type: application/x-www-form-urlencoded

username: logincheck
password: 1234
```

**응답:**

```
Status: 201 Created
Body: logIn success
```

---

## 🔍 동작 원리

1. **사용자 조회**: `findOne({ where: { username } })`로 사용자명으로 DB에서 사용자 찾기
2. **비밀번호 검증**: `bcrypt.compare()`로 입력된 비밀번호와 저장된 해시 비교
3. **결과 반환**:
   - 성공 시: `'logIn success'` 문자열 반환
   - 실패 시: `UnauthorizedException` 예외 발생

---
