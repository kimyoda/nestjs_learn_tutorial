# 게시물에 접근하는 권한 처리

---

## 유저와 게시물의 관계 형성 해주기

- 현재는 유저나 게시물에 생성할 때 그 둘의 관계에 대해 설정해준게 없다.
- 게시물을 생성할 때 어떤 유저가 생성해줬는 지 정보를 같이 넣어줘야 한다.
- 유저와 게시물 관계 부분을 처리한다.

### 📋 유저와 게시물 데이터 관계 형성

1. 관계를 형성하기 위해서 엔티티에 서로간의 필드를 넣어줘야 한다.
2.

user.entity.ts

```ts
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  // 1(User) 대 다(Board) 관계 설정
  // board.user: Board 엔티티의 'user' 속성과 연결됨
  // eager: true: 유저 정보를 가져올 때 관련 게시물도 항상 함께 로드
  @OneToMany((type) => Board, (board) => board.user, { eager: true })
  boards: Board[];

  // 비밀번호 검증 메소드
  async validatePassword(password: string): Promise<boolean> {
    let isValid = await bcrypt.compare(password, this.password);
    return isValid;
  }
}
```

board.entity.ts

```ts
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: BoardStatus;

  // 다(Board) 대 1(User) 관계 설정
  // user.boards: User 엔티티의 'boards' 속성과 연결됨
  // eager: false: 게시물 정보를 가져올 때 유저 정보를 항상 로드하지는 않음
  @ManyToOne((type) => User, (user) => user.boards, { eager: false })
  user: User;
}
```

User가 게시글1, 게시글2, 게시글3을 모두 소유하는 관계이다.

**OneToMany Relationship**(1:N, 일대다 관계)

- User 입장
- 한쪽(Entity1, user)이 여러 개의 다른쪽(Entity, board) 인스턴스를 가질 수 있으나, 다른쪽(Entity2)은 오직 하나의 Entitiy1만 가진다.
- 해당 관계에서 Entity2(board)가 관계의 주인, Entity1(User)의 ID를 자신의 칼럼에 저장한다.

**ManyToOne Relationship**(N:1, 다대일 관계)

- Board 입장
- 한쪽(Entity1, board)이 오직 하나의 다른쪽(Entity, board) 인스턴스를 가질 수 있으나, 다른쪽(Entity2)은 여러 개의 Entitiy1만 가진다.
- 해당 관계에서 Entity1(board)가 관계의 주인, Entity2(User)의 ID를 자신의 칼럼에 저장한다.

---

## 📚 TypeORM 관계형 데이터베이스 관계 상세 설명

### 🔗 OneToMany 관계 (일대다 관계)

**개념:**

- 하나의 엔티티가 여러 개의 다른 엔티티와 연결되는 관계
- 부모-자식 관계에서 부모가 여러 자식을 가질 수 있는 구조

**특징:**

- **소유자(Owner)**: 관계의 주인이 아닌 쪽 (User 엔티티)
- **외래키**: 자식 엔티티(Board)에 부모의 ID가 저장됨
- **배열 타입**: `boards: Board[]` 형태로 여러 개의 Board를 가질 수 있음
- **eager 로딩**: `{ eager: true }` 옵션으로 User를 조회할 때 관련된 모든 Board도 함께 로드

**실제 데이터베이스 구조:**

```sql
-- users 테이블
id | username | password
1  | john     | hashed_password
2  | jane     | hashed_password

-- boards 테이블 (user_id가 외래키)
id | title | description | status | user_id
1  | 제목1  | 내용1       | PUBLIC | 1
2  | 제목2  | 내용2       | PRIVATE| 1
3  | 제목3  | 내용3       | PUBLIC | 2
```

**사용 예시:**

```ts
// User 조회 시 관련된 모든 Board도 함께 로드됨 (eager: true)
const user = await userRepository.findOne({ where: { id: 1 } });
console.log(user.boards); // [Board1, Board2] - 자동으로 로드됨
```

### 🔗 ManyToOne 관계 (다대일 관계)

**개념:**

- 여러 개의 엔티티가 하나의 다른 엔티티와 연결되는 관계
- 자식-부모 관계에서 여러 자식이 하나의 부모를 참조하는 구조

**특징:**

- **소유자(Owner)**: 관계의 주인 (Board 엔티티)
- **외래키**: Board 테이블에 `user_id` 컬럼이 생성됨
- **단일 타입**: `user: User` 형태로 하나의 User만 참조
- **lazy 로딩**: `{ eager: false }` 옵션으로 Board 조회 시 User는 별도로 로드해야 함

**실제 데이터베이스 구조:**

```sql
-- boards 테이블에 user_id 외래키가 생성됨
CREATE TABLE boards (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR NOT NULL,
    user_id INTEGER REFERENCES users(id) -- 외래키
);
```

**사용 예시:**

```ts
// Board 조회 시 User는 자동으로 로드되지 않음 (eager: false)
const board = await boardRepository.findOne({ where: { id: 1 } });
console.log(board.user); // undefined - 별도로 로드해야 함

// User 정보도 함께 로드하려면
const boardWithUser = await boardRepository.findOne({
  where: { id: 1 },
  relations: ['user'],
});
console.log(boardWithUser.user); // User 객체
```

### 🔄 관계 설정의 핵심 포인트

**1. 관계의 방향성:**

- `@OneToMany`: 부모에서 자식들로 접근 (User → Board[])
- `@ManyToOne`: 자식에서 부모로 접근 (Board → User)

**2. inverseSide 설정:**

```ts
// User 엔티티에서
@OneToMany((type) => Board, (board) => board.user)
//                              ↑
//                    Board 엔티티의 user 속성을 가리킴

// Board 엔티티에서
@ManyToOne((type) => User, (user) => user.boards)
//                              ↑
//                    User 엔티티의 boards 속성을 가리킴
```

**3. Eager vs Lazy 로딩:**

- **Eager (`eager: true`)**: 부모 조회 시 자식들도 자동 로드
- **Lazy (`eager: false`)**: 필요할 때만 별도로 로드 (성능상 유리)

**4. 실제 사용 시나리오:**

```ts
// 사용자의 모든 게시물 조회
const user = await userRepository.findOne({ where: { id: 1 } });
const userBoards = user.boards; // 자동으로 로드됨

// 특정 게시물의 작성자 정보 조회
const board = await boardRepository.findOne({
  where: { id: 1 },
  relations: ['user'],
});
const author = board.user; // 작성자 정보
```

---

### 🔄 파라미터

1. Type

2. inverseSide (board에서 유저로 접근하려면 board.user로 접근해야 한다)

3. Option (eager: true일 때 user 정보를 가져올 때 board도 같이 가져온다)

```ts
typeFunctionOrTarget: string | ((type?: any) => ObjectType<User>),
inverseSide? : string | ((object: User) => any),
options?: RelationOptions
```
