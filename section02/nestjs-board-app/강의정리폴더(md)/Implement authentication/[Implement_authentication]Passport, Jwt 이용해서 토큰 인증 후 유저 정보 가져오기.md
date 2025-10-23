# Passport, Jwt 이용해서 토큰 인증 후 유저 정보 가져오기

## 📋 목표

- 저번 시간에 JWT 를 이용해서 유저가 로그인 할 때 토큰을 생성해줬다.
- 그래서 이제는 유저가 요청을 보낼 떄 요청 안에 있는 Header에 토큰을 넣어서 요청을 보내는데 Payload가 있다.
- payload 안에 유저 이름을 넣는다.
- 토큰이 유요한 토큰인지 서버에 secret text를 이용해서 알아내고 payload 안에 유저 이름을 이용한다
- 데이터베이스 안에 있는 유저 이름에 해당하는 유저 정보를 모두 가져올 수 있다.
- 처리를 쉽게 Passport 모듈이다. Passport 모듈을 이용해 이 부분을 구현할 수 있다.

---

## 🔐 JWT 인증 구현 과정

### 1. JwtPayload 인터페이스 생성

JWT 토큰의 payload에 들어갈 데이터 구조를 정의합니다.

```ts
// jwt.payload.interface.ts
export interface JwtPayload {
  username: string;
}
```

### 2. JwtStrategy 구현

Passport의 JWT 전략을 구현하여 토큰 검증 및 사용자 정보 추출을 담당합니다.

```ts
// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { JwtPayload } from './jwt.payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    super({
      secretOrKey: 'Secret1234',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    const { username } = payload;
    const user: User | null = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

#### JwtStrategy 핵심 기능

- **토큰 추출**: `ExtractJwt.fromAuthHeaderAsBearerToken()`로 Authorization 헤더에서 Bearer 토큰 추출
- **토큰 검증**: `secretOrKey`로 토큰의 유효성 검증
- **사용자 조회**: payload의 username으로 데이터베이스에서 사용자 정보 조회
- **사용자 반환**: 검증된 사용자 정보를 request 객체에 주입

### 3. AuthModule 수정

JWT 인증을 위한 모듈 설정을 추가합니다.

```ts
// auth.module.ts
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
  providers: [AuthService, UserRepository, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

#### AuthModule 주요 설정

- **PassportModule**: 기본 전략을 'jwt'로 설정
- **JwtModule**: JWT 토큰 생성 및 검증을 위한 설정
- **JwtStrategy**: providers에 등록하여 의존성 주입 가능하게 함
- **exports**: 다른 모듈에서 JwtStrategy와 PassportModule 사용 가능

### 4. UseGuards 데코레이터 사용

컨트롤러에서 JWT 인증을 적용하는 방법입니다.

```ts
// auth.controller.ts
@Post('/test')
@UseGuards(AuthGuard())
test(@Req() req) {
  console.log('req', req);
}
```

#### UseGuards 동작 원리

1. **요청 접수**: 클라이언트가 Authorization 헤더와 함께 요청 전송
2. **토큰 추출**: JwtStrategy가 헤더에서 Bearer 토큰 추출
3. **토큰 검증**: secret key로 토큰 유효성 검증
4. **사용자 조회**: payload의 username으로 데이터베이스에서 사용자 정보 조회
5. **request 주입**: 검증된 사용자 정보를 `req.user`에 주입
6. **컨트롤러 실행**: 인증이 성공하면 컨트롤러 메소드 실행

#### 요청 객체에 사용자 정보 주입

인증이 성공하면 `req.user`에 사용자 정보가 자동으로 주입됩니다:

```ts
{
  id: 10,
  username: 'jwtcheck',
  password: '$2b$10$NVRbhdttb4ei8xj4TPOWXegt5P/2jeABJEQ00GFM6ncA7ASpXGt7y'
}
```

---

## 🔧 필요한 패키지 설치

JWT 인증을 구현하기 위해 필요한 패키지들을 설치해야 합니다.

```bash
npm install @nestjs/passport @nestjs/jwt passport passport-jwt
npm install --save-dev @types/passport-jwt
```

### 패키지 설명

- **@nestjs/passport**: NestJS에서 Passport를 사용하기 위한 모듈
- **@nestjs/jwt**: NestJS에서 JWT 토큰을 생성하고 검증하기 위한 모듈
- **passport**: Node.js 인증 미들웨어
- **passport-jwt**: Passport의 JWT 전략
- **@types/passport-jwt**: TypeScript 타입 정의

---

## 🚨 에러 처리 및 보안 고려사항

### 1. 토큰 만료 처리

JWT 토큰이 만료되었을 때의 처리:

```ts
// JwtStrategy에서 토큰 만료는 자동으로 처리됨
// 만료된 토큰은 validate 메소드가 호출되지 않음
```

### 2. 잘못된 토큰 처리

- **잘못된 서명**: `JsonWebTokenError` 발생
- **만료된 토큰**: `TokenExpiredError` 발생
- **형식이 잘못된 토큰**: `NotBeforeError` 발생

### 3. 사용자 존재하지 않을 때

```ts
if (!user) {
  throw new UnauthorizedException();
}
```

### 4. 보안 권장사항

- **Secret Key**: 환경변수로 관리 (`process.env.JWT_SECRET`)
- **토큰 만료시간**: 적절한 시간 설정 (1시간 권장)
- **HTTPS 사용**: 프로덕션 환경에서는 반드시 HTTPS 사용

---

## 📝 실제 사용 예시

### 1. 보호된 라우트에서 사용자 정보 사용

```ts
@Get('/profile')
@UseGuards(AuthGuard())
getProfile(@Req() req) {
  return {
    message: `안녕하세요, ${req.user.username}님!`,
    user: req.user
  };
}
```

### 2. 게시물 작성 시 작성자 정보 자동 주입

```ts
@Post('/boards')
@UseGuards(AuthGuard())
createBoard(
  @Body() createBoardDto: CreateBoardDto,
  @Req() req
) {
  return this.boardsService.createBoard(createBoardDto, req.user);
}
```

### 3. 사용자별 게시물 조회

```ts
@Get('/my-boards')
@UseGuards(AuthGuard())
getMyBoards(@Req() req) {
  return this.boardsService.getBoardsByUser(req.user.id);
}
```

---

## 🔍 디버깅 팁

### 1. 토큰 확인

Postman이나 브라우저 개발자 도구에서 토큰이 올바르게 전송되는지 확인:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. 콘솔 로그로 디버깅

```ts
@Post('/test')
@UseGuards(AuthGuard())
test(@Req() req) {
  console.log('=== 요청 정보 ===');
  console.log('Headers:', req.headers);
  console.log('User:', req.user);
  console.log('================');
  return { message: '인증 성공!', user: req.user };
}
```

### 3. 일반적인 문제들

- **토큰이 없을 때**: `UnauthorizedException` 발생
- **잘못된 토큰**: `UnauthorizedException` 발생
- **만료된 토큰**: `UnauthorizedException` 발생
- **사용자가 DB에 없을 때**: `UnauthorizedException` 발생

---

## 🎯 JWT 토큰의 구조 이해

### JWT 토큰 구성 요소

JWT 토큰은 세 부분으로 구성됩니다:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imp3dGNoZWNrIiwiaWF0IjoxNzYxMjI4MTc2LCJleHAiOjE3NjEyMzE3NzZ9.u2oPgBsRz4P_L9-FX0piznxUKtR5TlM3DYcUa-BryKc
```

1. **Header (헤더)**: 토큰 타입과 암호화 알고리즘 정보
2. **Payload (페이로드)**: 실제 데이터 (사용자 정보 등)
3. **Signature (서명)**: 토큰의 무결성을 검증하는 서명

### Payload 내용 확인

```ts
// 디코딩된 payload 예시
{
  "username": "jwtcheck",
  "iat": 1761228176,  // 발급 시간 (issued at)
  "exp": 1761231776   // 만료 시간 (expiration)
}
```

---

## 🔄 미들웨어 실행 순서와 Guards

### NestJS 미들웨어 실행 순서

```
middleware → guard → interceptor (before) → pipe → controller → service → controller → interceptor (after) → filter (if applicable) → client
```

### Guards의 역할

- **인증 (Authentication)**: 사용자가 누구인지 확인
- **인가 (Authorization)**: 사용자가 해당 리소스에 접근할 권한이 있는지 확인
- **실행 시점**: Controller 메소드 실행 전에 먼저 실행

### AuthGuard 동작 과정

```ts
@UseGuards(AuthGuard())  // JWT 전략 사용
```

1. **요청 분석**: Authorization 헤더에서 토큰 추출
2. **토큰 검증**: JwtStrategy의 validate 메소드 호출
3. **사용자 조회**: 데이터베이스에서 사용자 정보 확인
4. **권한 부여**: 인증 성공 시 req.user에 사용자 정보 주입
5. **요청 진행**: Controller 메소드 실행 허용

---

## 🛡️ 다양한 인증 전략

### 1. Local Strategy (로그인)

```ts
// 로그인 시 사용
@UseGuards(AuthGuard('local'))
@Post('/login')
async login(@Req() req) {
  return req.user; // 로그인된 사용자 정보
}
```

### 2. JWT Strategy (토큰 검증)

```ts
// 보호된 라우트에서 사용
@UseGuards(AuthGuard('jwt'))
@Get('/protected')
async protected(@Req() req) {
  return req.user; // 토큰으로 검증된 사용자 정보
}
```

### 3. 커스텀 Guard

```ts
@Injectable()
export class CustomAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // 커스텀 인증 로직
    return super.canActivate(context);
  }
}
```

---

## 📊 토큰 관리 전략

### 1. Access Token vs Refresh Token

```ts
// Access Token (짧은 수명)
{
  secret: 'Secret1234',
  expiresIn: '15m'  // 15분
}

// Refresh Token (긴 수명)
{
  secret: 'RefreshSecret1234',
  expiresIn: '7d'    // 7일
}
```

### 2. 토큰 갱신 구현

```ts
@Post('/refresh')
async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
  // Refresh Token 검증
  // 새로운 Access Token 발급
  return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
}
```

### 3. 토큰 블랙리스트

```ts
// 로그아웃 시 토큰 무효화
@Post('/logout')
@UseGuards(AuthGuard())
async logout(@Req() req) {
  const token = this.extractTokenFromHeader(req);
  await this.authService.addToBlacklist(token);
  return { message: '로그아웃 성공' };
}
```

---

## 🔧 환경 설정 및 보안

### 1. 환경변수 설정

```ts
// .env 파일
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=3600
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=604800
```

### 2. 설정 파일 사용

```ts
// auth.module.ts
JwtModule.registerAsync({
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
    },
  }),
  inject: [ConfigService],
});
```

### 3. 프로덕션 보안 설정

```ts
// 프로덕션 환경에서의 추가 보안
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '1h',
    issuer: 'your-app-name',
    audience: 'your-app-users',
  },
  verifyOptions: {
    issuer: 'your-app-name',
    audience: 'your-app-users',
  },
};
```
