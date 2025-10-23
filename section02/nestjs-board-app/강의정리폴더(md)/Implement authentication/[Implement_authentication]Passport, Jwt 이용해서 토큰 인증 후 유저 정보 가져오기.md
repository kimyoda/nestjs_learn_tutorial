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
