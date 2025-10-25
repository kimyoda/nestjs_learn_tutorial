# 게시물 생성 할 때 유저 정보 넣어주기

- 유저와 게시물의 관계를 엔티티를 이용해서 형성해주었다.
- 실제로 게시물을 생성할 때 유저 정보를 게시물에 넣어준다.

게시물 생성 요청 -> 헤더안에 있는 토큰으로 유저 정보 -> 유저 정보와 게시물 관계 형성하며 게시물 생성

---

# boardsController(boards.controller.ts)

- 컨트롤러는 @GetUser 데코레이터를 통해 인증된 유저(user) 정보를 AuthGuard로 받아오고, @Body로 받은 게시물 정보와함께 서비스로 전달.

```ts
@Post()
@UsePipes(ValidationPipe)
createBoard(
  @Body() createBoardDto: CreateBoardDto,
  @GetUser() user: User,
): Promise<Board> {
  return this.boardsService.createBoard(createBoardDto, user);
}
```

## 📝 컨트롤러 코드 상세 설명

**@Post()**: HTTP POST 요청을 처리하는 엔드포인트를 정의합니다. 클라이언트가 게시물을 생성하려고 할 때 이 메소드가 호출됩니다.

**@UsePipes(ValidationPipe)**: 들어오는 데이터(createBoardDto)의 유효성을 검사합니다. DTO에 정의된 규칙에 맞지 않으면 자동으로 에러를 반환합니다.

**@Body() createBoardDto: CreateBoardDto**: 요청 본문에서 게시물 데이터를 추출합니다. title과 description 같은 게시물 정보가 들어있습니다.

**@GetUser() user: User**: 커스텀 데코레이터로, JWT 토큰에서 인증된 유저 정보를 자동으로 추출합니다. AuthGuard가 토큰을 검증한 후 유저 정보를 주입해줍니다.

**Promise<Board>**: 비동기 작업이므로 Promise를 반환하며, 최종적으로 생성된 Board 객체를 반환합니다.

---

# boards.service.ts

- 서비스는 컨트롤러부터 받은 데이터를 레포지토리의 createBoard 메소드로 그대로 전달

```ts
async createBoard(
  createBoardDto: CreateBoardDto,
  user: User,
): Promise<Board> {
  return this.boardRepository.createBoard(createBoardDto, user);
}
```

## 🔧 서비스 코드 상세 설명

**async createBoard()**: 비동기 메소드로, 게시물 생성 로직을 처리합니다. 서비스 레이어는 비즈니스 로직을 담당하지만, 이 경우에는 단순히 데이터를 레포지토리로 전달하는 역할을 합니다.

**createBoardDto: CreateBoardDto**: 컨트롤러에서 받은 게시물 생성 데이터입니다. title과 description 필드가 포함되어 있습니다.

**user: User**: 인증된 유저 객체입니다. 이 유저가 게시물의 작성자가 됩니다.

**this.boardRepository.createBoard()**: 실제 데이터베이스 작업은 레포지토리에서 처리하므로, 서비스는 레포지토리의 메소드를 호출하여 작업을 위임합니다.

**Promise<Board>**: 레포지토리에서 생성된 Board 객체를 그대로 반환합니다.

---

# board.repository.ts

- 레포지토리는 실제 데이터베이스 로직을 처리한다. createBoardDto에 title과 description을 추출, user 객체를 받아 Board 엔티티를 생성한다.

```ts
export class BoardRepository extends Repository<Board> {
  async createBoard(
    createBoardDto: CreateBoardDto,
    user: User,
  ): Promise<Board> {
    const { title, description } = createBoardDto;

    const board = new Board(); // (TypeORM 0.2.x 방식) 또는 this.create() (0.3.x+ 방식)
    board.title = title;
    board.description = description;
    board.status = BoardStatus.PUBLIC;
    board.user = user; // 게시물과 유저의 관계 설정
    await board.save();

    // 중요: 생성된 게시물 객체를 반환할 때,
    // 민감할 수 있는 user 정보는 제거하고 반환합니다.
    delete board.user;

    return board;
  }
}
```

## 🗄️ 레포지토리 코드 상세 설명

**export class BoardRepository extends Repository<Board>**: TypeORM의 Repository 클래스를 상속받아 Board 엔티티에 대한 데이터베이스 작업을 처리합니다.

**const { title, description } = createBoardDto**: 구조분해할당을 사용해 DTO에서 필요한 필드만 추출합니다. 이렇게 하면 코드가 더 깔끔해집니다.

**const board = new Board()**: 새로운 Board 엔티티 인스턴스를 생성합니다. 이는 TypeORM의 전통적인 방식입니다.

**board.title = title**: 게시물의 제목을 설정합니다.

**board.description = description**: 게시물의 설명을 설정합니다.

**board.status = BoardStatus.PUBLIC**: 게시물의 상태를 PUBLIC으로 기본 설정합니다. (PUBLIC, PRIVATE 등이 있을 수 있음)

**board.user = user**: 🔗 **핵심 부분!** 게시물과 유저의 관계를 설정합니다. 이렇게 하면 데이터베이스에서 외래키 관계가 형성됩니다.

**await board.save()**: 생성된 Board 객체를 데이터베이스에 저장합니다. 이때 user 정보도 함께 저장되어 관계가 형성됩니다.

**delete board.user**: 보안상의 이유로 반환할 때는 유저의 민감한 정보(비밀번호 등)를 제거합니다. 클라이언트에게는 게시물 정보만 반환하는 것이 좋습니다.

**return board**: 최종적으로 생성된 게시물 객체를 반환합니다.

## 📊 최종 결과

```json
{
  "id": 4,
  "title": "new board5",
  "description": "new description5",
  "status": "PUBLIC",
  "user": {
    "id": 8,
    "username": "logincheck",
    "password": "$2b$10$Ygmjdr2T5Mc8Hle4tyAAWekGoR/X19R4.nO.22F4TsEiCH7ZZ9Q4O",
    "boards": []
  }
}
```

## 🔍 결과 분석

**id: 4**: 데이터베이스에서 자동으로 생성된 게시물의 고유 ID입니다.

**title, description**: 클라이언트가 요청으로 보낸 게시물 내용입니다.

**status: "PUBLIC"**: 레포지토리에서 기본값으로 설정한 게시물 상태입니다.

**user 객체**: 게시물과 연결된 유저 정보입니다. 여기서 중요한 점은:

- **id: 8**: 유저의 고유 ID
- **username: "logincheck"**: 유저의 이름
- **password**: 암호화된 비밀번호 (실제로는 클라이언트에게 노출되면 안 됨)
- **boards: []**: 이 유저가 작성한 다른 게시물들의 배열
