### NestJS Providers, Service란?

---

## ✅ Provider란?

- **NestJs의 핵심 개념**
- 대부분의 클래스 (서비스, 리포지토리, 팩토리, 헬퍼 등)는 **Provider**로 간주된다.
- 주요 개념: **의존성 주입(Dependency Injection, DI)** 을 통해 다른 클래스에서 사용 가능

> Nest 런타임이 객체들 간의 관계를 자동으로 연결해줌

---

## 🧪 Service란?

- 소프트웨어 전반에서 사용되는 일반적인 개념(NestJS, JS 한정 아님)
- NestJS에서 `@Injectable()` 데코레이터로 선언하여 **DI 대상**으로 설정
- 모듈에 `providers`로 등록하여 사용
- 컨트롤러에서 사용되는 **비즈니스 로직 처리**를 담당

### 📍 예: 데이터 유효성 검사, DB 생성/조회 등의 비즈니스 로직

```ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello(); // Service 메서드 호출
  }
}
```

---

## Controller와 Service 연결 (DI 활용)

- Controller 내부에서 constructor를 통해 Service를 주입(inject)받는다.
- private 접근자를 사용해서 클래스 내부에서 해당 서비스가 사용 가능하다.
- Nest는 타입을 기반으로 자동 주입한다(TS때문)

```ts
@Controller("boards")
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  getAllBoards() {
    return this.boardsService.findAll(); // BoardsService 메서드 사용
  }
}
```

---

## Provider 등록하기

- Provider는 사용 전에 반드시 등록해야 함
- 등록 위치: 해당 모듈의 @Module() 데코레이터 내부의 providers 배열

```ts
@Module({
  controllers: [BoardsController],
  providers: [BoardsService], // 여기에 등록!
})
export class BoardsModule {}
```

---

| 구분     | 설명                                                                   |
| -------- | ---------------------------------------------------------------------- |
| Provider | Nest에서 의존성 주입 대상이 되는 클래스들 (Service, Repository 등)     |
| Service  | 비즈니스 로직을 처리하는 Provider                                      |
| DI 방법  | Controller에서 `constructor(private xxxService: XxxService)` 방식 사용 |
| 등록     | 모듈 파일의 `providers` 배열에 등록 필수                               |
