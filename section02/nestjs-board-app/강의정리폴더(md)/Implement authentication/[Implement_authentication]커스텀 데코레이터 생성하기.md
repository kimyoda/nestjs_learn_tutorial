# 커스텀 데코레이터 생성하기

## 📋 요청안에 유저가 들어가게 하려면

```ts
@Post('/authTest')
@UseGuards(AuthGuard())
authTest(@Req() req) {
  console.log(req);
}
```

---

## 🔄 req.user가 아닌 user라는 파라미타로 가져올 수 있는 방법은?

- 커스텀 데코레이터를 이용하면 된다.

```ts
export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
```

- controller로 user 체크

```ts
  @Post('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() user: User) {
    console.log('user', user);
  }
```

```json
user User {
  id: 10,
  username: 'jwtcheck',
  password: '$2b$10$NVRbhdttb4ei8xj4TPOWXegt5P/2jeABJEQ00GFM6ncA7ASpXGt7y'
}

```

---

## 🎯 커스텀 데코레이터란?

### 기본 개념

- **정의**: NestJS에서 제공하는 `createParamDecorator`를 사용하여 만드는 사용자 정의 데코레이터
- **목적**: 반복적인 코드를 줄이고, 더 깔끔하고 재사용 가능한 코드 작성
- **장점**: 타입 안정성, 코드 가독성 향상, 유지보수 용이성

### createParamDecorator 함수

```ts
createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  // 커스텀 로직
  return extractedValue;
});
```

#### 매개변수 설명

- **data**: 데코레이터에 전달된 데이터 (선택적)
- **ctx**: ExecutionContext 객체 (요청 컨텍스트 정보)
- **반환값**: 추출된 값 (컨트롤러 메소드의 매개변수로 주입됨)

---
