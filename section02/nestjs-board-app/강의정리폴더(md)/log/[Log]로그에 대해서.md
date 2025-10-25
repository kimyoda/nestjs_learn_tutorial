# 로그에 대해서

- 애플리케이션을 운영하면 에러가 날때가 많이 있다.
- 어디 부분이 문제인지 빠르고 정확하게 파악하기 위해 어떠한 곳에서 에러가 어떻게 나는지 보기 위해 로그를 보는게 중요하다.
- 로그에 대해서 알아본다.

---

# 로그의 종류

1. **Log** - 중요한 정보의 범용 로깅

2. **Warning** - 치명적이거나 파괴적이지 않은 처리되지 않은 문제

3. **Error** - 치명적이거나 파괴적인 처리되지 않은 문제

4. **Debug** - 오류 발생시 로직을 디버그하는데 도움이 되는 유용한 정보이다. 개발자용

5. **Verbose** - 응용 프로그램 동작에 대한 통찰력을 제공하는 정보이다.

# 로그레벨

| Environment | Log | Error | Warning | Debug | Verbose |
| ----------- | --- | ----- | ------- | ----- | ------- |
| Development | o   | o     | o       | o     | o       |
| Staging     | o   | o     | o       | x     | x       |
| Production  | o   | o     | x       | x     | x       |

---

# 실제로 애플리케이션 로그 적용하기

- 몇 가지 케이스를 넣어서 어떠한 식으로 넣는지 확인한다.

## 📝 원래 로그 넣는 것은

- 개발을 다하고 난 후에 로그를 넣는다.
- Logging 부분을 배우기 위해

## 로그를 처리하기 위해 사용하는 모듈은

- expressjs를 사용하려면 winston이란 모듈을 주로 사용한다.
- nestjs에는 logger클래스가 있어 그걸 사용한다.

실제예시

```bash
[Nest] 83921  - 10/25/2025, 11:44:43 PM     LOG [RouterExplorer] Mapped {/auth/test, POST} route +0ms
[Nest] 83921  - 10/25/2025, 11:44:43 PM     LOG [NestApplication] Nest application successfully started +1ms
[Nest] 83921  - 10/25/2025, 11:44:43 PM     LOG Application running on port 3000
```

````ts
  // 모든 게시물 가져오기
  @Get()
  getAllBoard(@GetUser() user: User): Promise<Board[]> {
    this.logger.verbose(`User ${user.username} trying to get all boards`);
    return this.boardService.getAllBoards(user);
  }
```bash
[Nest] 85227  - 10/25/2025, 11:46:43 PM     LOG [NestApplication] Nest application successfully started +0ms
[Nest] 85227  - 10/25/2025, 11:46:43 PM     LOG Application running on port 3000
[Nest] 85227  - 10/25/2025, 11:47:18 PM VERBOSE [BoardsController] User user2 trying to get all boards
````

```ts
 // 게시물 생성
  @Post()
  @UsePipes(ValidationPipe)
  createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @GetUser() user: User,
  ): Promise<Board> {
    this.logger.verbose(
      `User ${user.username} creating a new board. Payload: ${JSON.stringify(createBoardDto)}`,
    );
    return this.boardService.createBoard(createBoardDto, user);
  }

```

```bash
[Nest] 87799  - 10/25/2025, 11:50:42 PM     LOG [RouterExplorer] Mapped {/auth/test, POST} route +0ms
[Nest] 87799  - 10/25/2025, 11:50:42 PM     LOG [NestApplication] Nest application successfully started +1ms
[Nest] 87799  - 10/25/2025, 11:50:42 PM     LOG Application running on port 3000
[Nest] 87799  - 10/25/2025, 11:50:53 PM VERBOSE [BoardsController] User user2 creating a new board. Payload: {"title":"board11","description":"new description"}

```

---

# 로그가 왜 중요한가?

## 🚨 문제 상황 예시

```
사용자: "어? 내 게시물이 안 보여요!"
개발자: "어디서 문제가 생겼을까... 🤔"
```

**로그가 없으면:**

- 어떤 사용자가 언제 어떤 요청을 했는지 모름
- 어느 부분에서 에러가 발생했는지 추적 불가
- 문제 해결에 몇 시간~며칠 소요

**로그가 있으면:**

- 정확한 에러 발생 시점과 위치 파악
- 사용자 행동 패턴 분석 가능
- 빠른 문제 해결 (몇 분 내)

---

# NestJS Logger 사용법 상세

## 1. Logger 인스턴스 생성

```ts
import { Logger } from '@nestjs/common';

@Controller('boards')
export class BoardsController {
  private logger = new Logger('BoardsController'); // 클래스명으로 구분

  // 또는
  private logger = new Logger(BoardsController.name);
}
```

## 2. 다양한 로그 레벨 사용법

```ts
export class BoardsController {
  private logger = new Logger('BoardsController');

  @Get()
  getAllBoards(@GetUser() user: User): Promise<Board[]> {
    // DEBUG: 개발자용 상세 정보
    this.logger.debug(`Getting boards for user: ${user.id}`);

    // VERBOSE: 일반적인 동작 추적
    this.logger.verbose(`User ${user.username} requested all boards`);

    // LOG: 중요한 비즈니스 로직
    this.logger.log(`Successfully retrieved boards for ${user.username}`);

    return this.boardService.getAllBoards(user);
  }

  @Post()
  createBoard(@Body() createBoardDto: CreateBoardDto, @GetUser() user: User) {
    // WARNING: 주의가 필요한 상황
    if (createBoardDto.title.length > 100) {
      this.logger.warn(
        `User ${user.username} created board with long title: ${createBoardDto.title.length} chars`,
      );
    }

    // ERROR: 에러 상황
    try {
      return this.boardService.createBoard(createBoardDto, user);
    } catch (error) {
      this.logger.error(
        `Failed to create board for user ${user.username}`,
        error.stack,
      );
      throw error;
    }
  }
}
```

---

# 실제 운영 환경에서의 로그 활용

## 📊 로그 모니터링 도구들

1. **ELK Stack** (Elasticsearch, Logstash, Kibana)
2. **Splunk**
3. **Datadog**
4. **New Relic**

## 🔍 로그 분석 예시

```bash
# 특정 사용자의 활동 추적
grep "User user2" application.log

# 에러 발생 빈도 확인
grep "ERROR" application.log | wc -l

# 특정 시간대 로그 확인
grep "2025-10-25 11:4[0-9]" application.log
```

## 📈 로그를 통한 성능 분석

```ts
@Get()
async getAllBoards(@GetUser() user: User): Promise<Board[]> {
  const startTime = Date.now();

  this.logger.verbose(`User ${user.username} requesting boards`);

  const boards = await this.boardService.getAllBoards(user);

  const duration = Date.now() - startTime;

  // 성능 모니터링
  if (duration > 1000) {
    this.logger.warn(`Slow query detected: ${duration}ms for user ${user.username}`);
  }

  this.logger.log(`Retrieved ${boards.length} boards in ${duration}ms`);

  return boards;
}
```

---

# 로그 작성 시 주의사항

## ✅ 좋은 로그 예시

```ts
// 구체적이고 의미있는 정보
this.logger.log(
  `User ${user.username} (ID: ${user.id}) created board "${createBoardDto.title}"`,
);

// 에러 시 충분한 컨텍스트
this.logger.error(`Database connection failed for user ${user.id}`, {
  userId: user.id,
  operation: 'createBoard',
  timestamp: new Date().toISOString(),
});
```

---

# 로그 레벨별 실제 사용 사례

| 로그 레벨   | 사용 시점                       | 예시                                                           |
| ----------- | ------------------------------- | -------------------------------------------------------------- |
| **ERROR**   | 시스템 에러, 예외 발생          | `this.logger.error('Database connection failed', error.stack)` |
| **WARN**    | 비정상적이지만 처리 가능한 상황 | `this.logger.warn('User attempted to access deleted board')`   |
| **LOG**     | 중요한 비즈니스 로직            | `this.logger.log('User successfully logged in')`               |
| **DEBUG**   | 개발 중 디버깅 정보             | `this.logger.debug('Query executed: SELECT * FROM boards')`    |
| **VERBOSE** | 일반적인 동작 추적              | `this.logger.verbose('User requested board list')`             |

---

## 📝 로그 패턴 모범 사례

1. **일관된 포맷 사용**

   ```ts
   // 좋은 예
   this.logger.log(`[${operation}] User ${userId}: ${message}`);

   // 나쁜 예
   this.logger.log('User did something');
   ```

2. **구조화된 로그 데이터**

   ```ts
   this.logger.log('User action', {
     userId: user.id,
     action: 'createBoard',
     boardTitle: createBoardDto.title,
     timestamp: new Date().toISOString(),
   });
   ```

3. **적절한 로그 레벨 선택**
   - ERROR: 시스템이 멈춰야 하는 상황
   - WARN: 주의가 필요하지만 계속 진행 가능
   - LOG: 중요한 비즈니스 이벤트
   - DEBUG: 개발/디버깅용 상세 정보
   - VERBOSE: 일반적인 동작 추적
