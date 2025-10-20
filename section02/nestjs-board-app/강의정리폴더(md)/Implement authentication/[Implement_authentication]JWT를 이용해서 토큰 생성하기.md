# JWT를 이용해서 토큰 생성하기

## 📋 목표

- JWT 모듈을 이용해 토큰을 생성한다.
- PassPort라는 모듈도 함께 사용한다.
- 모듈이 저번 시간에 JWT를 이용해서 인증 처리하고 하는 동의 과정을 쉽게 만들어준다.

---

## 🔄 필요한 모듈들 설치하기

- @nestjs/jwt
  - nestjs에서 jwt를 사용하기 위해 필요한 모듈이다
- @nestjs/passport
  - nestjs에서 passport를 사용하기 위해 필요한 모듈이다
- passport
  - passport 모듈
- passport-jwt
  - jwt 모듈

npm install @nestjs/jwt @nestjs/passport passport poassport-jwt --save

---

### 1. 애플리케이션 JWT 모듈 등록하기

1. auth 모듈 imports에 넣어주기

```ts
// jwtModule 추가(secret, expiresIn 추가
@Module({
  imports: [
    JwtModule.register({
      secret: 'Secret1234',
      signOptions: {
        expiresIn: 60 * 60,
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository],
})
export class AuthModule {}
```

- **JWT 모듈(`@nestjs/jwt`)**: JWT 발급/검증을 NestJS에서 쉽게 쓰도록 해주는 모듈
- **secret**: 토큰 서명에 쓰는 비밀 키(운영환경에서는 환경변수로 관리 권장)
- **signOptions.expiresIn**: 토큰 만료 시간(초 단위 또는 `'1h'`, `'15m'` 등 문자열 가능). 예시의 `60 * 60`은 1시간

Secret

- 토큰을 만들 때 이용하는 Secret 텍스트

Expiresln

- 정해진 시간 이후에 토큰이 유효하지 않게 된다. 60 \* 60은 한시간 이후에는 이 토큰이 더 이상 유효하지 않게 된다.

### 2. 애플리케이션 Passport 모듈 등록하기

1. auth 모듈 imposrt에 넣어주기

```ts
// passportModule 추가
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'Secret1234',
      signOptions: {
        expiresIn: 60 * 60,
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository],
})
export class AuthModule {}
```

- **Passport 모듈(`@nestjs/passport`)**: 인증 전략을 NestJS에 통합(여기서는 `jwt`)
- **defaultStrategy: 'jwt'**: 인증 가드에서 기본으로 JWT 전략 사용

### 3. 로그인 성공 시 JWT를 이용해서 토큰 생성하기

1. Service에서 SignIn 메소드에 생성해주면 된다.
   auth 모듈에 JWT를 등록해주어 Service에 JWT를 가져올 수 있다.

```ts
    private jwtService: JwtService,
```

2. Token을 만드려면 Secret과 Payload가 필요하다.

- Payload에 자신이 전달하고자 하는 정보를 넣어주면 된다.
- Role 정보든, 유저 이름이든, 이메일이든 하지만 Sensitive한 정보는 넣으면 안된다.
- Payload를 이용 JWT에서 토큰을 만들 때 사용하는 메소드를 이용해서 토큰을 생성해준다.

```ts
// 유저 토큰 생성 (Secret + Payload)
const payload = { username };
// 최신 @nestjs/jwt 버전에서는 .sign() 메서드가 동기(Synchronous) 방식으로 변경됨.
// 따라서 Promise를 반환하지 않으므로, 'await' 키워드를 사용하면 에러가 발생.
// (구버전에서는 .sign()이 비동기(Asynchronous)여서 'await'가 필수였습니다.)
const accessToken = this.jwtService.sign(payload);

return { accessToken };
```

**왜 await를 빼나요? (@nestjs/jwt 최신 버전)**

- `jwtService.sign()`은 동기 메서드로 Promise를 반환하지 않음 → `await` 불필요(사용 시 오류 가능)
- 비동기 흐름이 필요한 경우에는 `signAsync()` 사용

```ts
// 필요 시 비동기 버전 사용 예시
const accessToken = await this.jwtService.signAsync(payload);
```

---

### 성공 예시

```bash
POST http://localhost:3000/auth/signin
Content-Type: application/json

{
  "username": "jwtcheck",
  "password": "1234"
}
```

응답:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- 요청 경로: `/auth/signin`
- 본문: `username`, `password` 필수
- 응답: `accessToken` 필드에 JWT 문자열 반환
