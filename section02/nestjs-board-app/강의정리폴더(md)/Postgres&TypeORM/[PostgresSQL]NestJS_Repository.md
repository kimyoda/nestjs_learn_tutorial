### NestJS_Repository

---

## 🤔 Repository 무엇인가?

- 리포지토리는 엔터티 개체와 함께 작동하고 엔터티 찾기, 삽입, 업데이트, 삭제 등을 처리한다.
- http://typeorm.delightful.studio/classes/ repository repository .repository.html(공식문서주소)

### 📋 Repository 흐름

컨트롤러와 서비스 아키텍처
사용자(User)는 **요청(Request)**을 보내고 시스템은 **응답(Response)**을 반환합니다. 이 과정에서 **컨트롤러(Controller)**는 요청을 받아 **서비스(Service)**에 전달하고, 서비스는 비즈니스 로직을 처리한 후 그 결과를 다시 컨트롤러에 반환합니다.

Controller
컨트롤러는 들어온 요청을 적절한 서비스 메서드에 연결하는 역할을 합니다.

```ts
@Get()
getHello(): string {
  return this.appService.getHello();
}

```

---

## 🧭 처음 시작하는 사람을 위한 가이드

- **Repository의 목적**: 엔티티에 대한 데이터 접근 로직을 한 곳에 모아 서비스가 비즈니스 로직에만 집중하도록 합니다.
- **흐름 기억하기**: Controller → Service → Repository → DB. 컨트롤러는 요청 분기, 서비스는 규칙/절차, 리포지토리는 CRUD.
- **버전 메모**: TypeORM 0.2대는 `@EntityRepository()` 커스텀 리포지토리를 사용합니다. 0.3대는 `DataSource.getRepository(Entity)` 또는 `@InjectRepository(Entity)`가 일반적입니다. 프로젝트 버전에 맞춰 사용하세요.

## 🔧 Repository에서 자주 쓰는 기본 메서드

- `find()` 전체/조건 검색
- `findOne(options)` 한 건 검색
- `create(dto)` 엔티티 인스턴스 생성(아직 DB 저장 아님)
- `save(entity)` 생성/수정 저장(Upsert 성격)
- `delete(id | condition)` 삭제
- `count(options)` 개수 조회(페이징에 유용)

```ts
// Service 예시: 기본 사용 패턴
@Injectable()
export class BoardsService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async getAll() {
    return this.boardRepository.find();
  }

  async getById(id: number) {
    return this.boardRepository.findOne({ where: { id } });
  }

  async create(dto: { title: string; description: string }) {
    const board = this.boardRepository.create(dto); // 엔티티 인스턴스 생성
    return this.boardRepository.save(board); // DB 반영
  }

  async remove(id: number) {
    await this.boardRepository.delete(id);
  }
}
```

## 🧱 QueryBuilder 한눈에 보기

- 복잡한 조건/조인/페이징이 필요할 때 사용합니다.

```ts
const qb = this.boardRepository.createQueryBuilder('b');
qb.where('b.title ILIKE :kw', { kw: `%${keyword}%` })
  .orderBy('b.id', 'DESC')
  .skip((page - 1) * limit)
  .take(limit);
const [items, total] = await qb.getManyAndCount();
```

## 🔐 트랜잭션(선택)

- 여러 테이블/단계를 하나의 원자적 작업으로 묶고 싶을 때 사용합니다.

```ts
await this.boardRepository.manager.transaction(async (manager) => {
  const repo = manager.getRepository(Board);
  const entity = repo.create({ title, description });
  await repo.save(entity);
});
```

## 🧪 예외 처리 팁

- 조회 실패 시: `NotFoundException` 등 의미 있는 예외를 던져 컨트롤러에서 HTTP 404로 변환되게 합니다.
- 유니크 제약 위반 등 DB 오류는 캡처해 사용자 친화적 메시지로 바꿉니다.

```ts
const board = await this.boardRepository.findOne({ where: { id } });
if (!board) throw new NotFoundException('Board not found');
```

## 📦 DI 사용 패턴(요약)

- 커스텀 리포지토리(0.2): `TypeOrmModule.forFeature([BoardRepository])` 후 서비스 생성자에 주입
- 엔티티 기반(0.3): `forFeature([Board])` 후 `@InjectRepository(Board) private repo: Repository<Board>` 주입

---

Service
서비스는 실제 비즈니스 로직을 수행하는 부분입니다.

```ts
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

**레포지토리 패턴 (Repository Pattern)**

- 데이터베이스에 관련된 일은 서비스에서 하는 게 아닌 Repository에서 해주시면 됩니다. 이것을 Repository Pattern 이라고도 부릅니다.

- 서비스 로직과 데이터베이스 접근 로직을 분리하기 위해 레포지토리 계층을 사용합니다. 서비스는 레포지토리를 통해 데이터베이스와 상호작용합니다.
- Service → Repository

---

### Repository 생성

1. 리포지토리 파일 생성하기

- board.repository.ts

2. 생성한 파일에 리포지토리를 위한 클래스 생성하기

- 생성 시 Repository 클래스를 Extends 해준다.(Find, Insert, Delete) 등 엔티티를 컨트롤 할 수 있다.

@EntityRepository()

- 클래스를 사용자 정의 (CUSTOM) 저장소로 선언하는데 사용된다. 사용자 저장소는 일부 특정 엔터티를 관리하거나 일반 저장소 일 수 있다.
  board.repositorty.ts

```ts
@EntityRepository(Board)
export class BoardRepository extends Repository<Board> {}
```

3. 생성한 Repository를 다른곳에 사용할 수 있게 board.module에 import 해준다.

- board.module.ts

```ts
@Module({
  imports: [TypeOrmModule.forFeature([BoardRepository])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
```
