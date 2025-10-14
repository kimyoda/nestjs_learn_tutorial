# ID를 이용해서 특정 게시물 가져오기

## 🧩 왜 "생성 로직"을 Service가 아니라 Repository에 뒀나?

- **관심사의 분리**: Service는 비즈니스 규칙(권한, 트랜잭션 경계, 도메인 정책)을 표현하고, Repository는 엔티티의 생성/조회/저장 같은 **영속성 관련 작업**을 담당한다.
- **응집도 향상**: 엔티티를 만들 때 기본값(예: `status: PUBLIC`)을 설정하고 저장하는 일은 도메인-영속성 경계에서 반복되는 패턴이다. 이를 Repository 메서드로 캡슐화하면 엔티티 생성 규칙이 **하나의 장소**에 모여 재사용과 변경이 쉬워진다.
- **테스트 용이성**: Service 테스트에서는 Repository를 더블(mock)로 교체해 **비즈니스 플로우**만 검증하고, Repository 테스트는 **DB 상호작용**만 집중해서 검증할 수 있다.
- **TypeORM 관례 활용**: TypeORM의 `Repository`는 `create`, `save` 같은 엔티티 생명주기 편의 메서드를 제공합니다. 생성 로직을 Repository로 모으면 이 편의들을 **일관되게** 활용할 수 있다.

결론: Service는 "무엇을" 할지 결정하고, Repository는 "어떻게 저장할지"를 수행합니다. 이번 케이스의 생성은 비즈니스 규칙이 거의 없고 저장 중심이므로 Repository에 두워야 한다.

---

## 🔧 이번 변경점 요약(Module, Repository, Service, Controller)

### 1) Module

- **변경점**: `TypeOrmModule.forFeature([Board])`만 import하고, `providers`에 `BoardsService`, `BoardRepository`를 등록하여 의존성 주입이 가능하게 했다.

```ts
// src/boards/boards.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Board])],
  controllers: [BoardsController],
  providers: [BoardsService, BoardRepository],
})
export class BoardsModule {}
```

### 2) Repository

- **핵심**: `Repository<Board>`를 상속받는 `BoardRepository`를 만들고, `createBoard`에서 `create`와 `save`를 사용해 엔티티 생성/저장을 캡슐했다.

```ts
// src/boards/board.repository.ts
@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(dataSource: DataSource) {
    super(Board, dataSource.createEntityManager());
  }

  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const { title, description } = createBoardDto;
    const board = this.create({
      title,
      description,
      status: BoardStatus.PUBLIC,
    });
    await this.save(board);
    return board;
  }
}
```

### 3) Service

- **역할**: 비즈니스 계층의 진입점으로 남기되, 생성은 Repository의 `createBoard`에 위임합니다. 나중에 생성 시 추가 정책(예: 권한 검사, 트랜잭션 처리)이 생기면 이 계층에서 조합하면 됩니다.

```ts
// src/boards/boards.service.ts
@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
  ) {}

  createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardRepository.createBoard(createBoardDto);
  }
}
```

### 4) Controller

- **변경점**: `POST /boards`에서 DTO 검증 후 Service의 `createBoard`를 호출합니다.

```ts
// src/boards/boards.controller.ts
@Post()
@UsePipes(ValidationPipe)
createBoard(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
  return this.boardService.createBoard(createBoardDto);
}
```

---

## ✅ 정리

- **생성 로직은 Repository**로 내려 비즈니스/영속성 관심사를 분리했습니다.
- `Module`은 의존성을 정리했고, `Service`는 위임, `Controller`는 요청-응답만 담당합니다.
- 이후 생성 규칙(예: 권한, 감사 로그, 트랜잭션)이 추가되면 Service에 자연스럽게 녹여 조합할 수 있습니다.
