# 인증된 유저만 게시물 보고 쓸 수 있게 만들기

- 인증된 유저만 게시물 보고 쓰고 업데이트하는 작업

## 🎯 유저에게 게시물 접근 권한 주기

1. 인증에 관한 모듈을 board모듈에서 쓸수 있게 하기에 board.module에 인증모듈 imports 해오기

2. @UseGuards(AuthGuard())를 이용해서, 사용자가 요청을 보낼 때 올바른 토큰을 가지고 있는지 확인한 후에 게시물에 접근할 권한을 준다. 이 AuthGuard는 getAllTask() 같은 개별 라우트(핸들러)에 각각 적용할 수도 있고, 위 코드처럼 컨트롤러 클래스 자체에 적용하여 안에 있는 모든 라우트에 한 번에 적용할 수 있다.

module.ts

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Board]), AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService, BoardRepository], // BoardRepository 추가
})
export class BoardsModule {}
```

controller에 추가

```ts
@UseGuards(AuthGuard())
```

---

- token을 받아와서 get()으로 조회해오기!

```json
[
  {
    "id": 2,
    "title": "왜 서버지?",
    "description": "이거뭐지?",
    "status": "PUBLIC"
  },
  {
    "id": 1,
    "title": "요한1",
    "description": "체크",
    "status": "PRIVATE"
  }
]
```
