# NestJS + TypeORM + PostgreSQL

---

## 🤔 TypeORM이란?

**TypeORM**은 Node.js 환경에서 실행되는 **TypeScript 기반의 ORM(Object-Relational Mapping) 라이브러리**입니다.

### 🎯 주요 특징

- **TypeScript 네이티브**: TypeScript로 작성되어 타입 안정성 제공
- **다양한 데이터베이스 지원**: MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server, Oracle, SAP Hana, WebSQL
- **Active Record & Data Mapper 패턴** 모두 지원
- **데코레이터 기반**: `@Entity`, `@Column` 등의 데코레이터로 간편한 설정

## 📋 ORM(Object Relational Mapping)이란?

**ORM**은 객체지향 프로그래밍 언어와 관계형 데이터베이스 간의 **호환되지 않는 데이터를 변환하는 프로그래밍 기법**입니다.

### 🔄 ORM의 작동 원리

```
JavaScript/TypeScript 객체 ↔ ORM ↔ SQL 테이블
```

### 💡 ORM의 장점

- **개발 생산성 향상**: SQL을 직접 작성하지 않아도 됨
- **데이터베이스 독립성**: 다른 DB로 쉽게 마이그레이션 가능
- **타입 안정성**: 컴파일 타임에 오류 검출
- **코드 재사용성**: 비즈니스 로직과 데이터 접근 로직 분리

---

## 🔄 TypeORM vs 순수 SQL 비교

### ❌ 순수 SQL 방식 (복잡하고 오류 발생 가능)

```javascript
// 직접 SQL 쿼리 작성 - 오타 위험, 타입 안정성 없음
db.query(
  'SELECT * FROM boards WHERE title = "Hello" AND status = "PUBLIC"',
  (err, result) => {
    if (err) {
      throw new Error('Database Error: ' + err.message);
    }
    const boards = result.rows;
    // 결과를 수동으로 객체로 변환해야 함
  },
);
```

### ✅ TypeORM 방식 (간단하고 안전)

```typescript
// 타입 안전하고 간단한 쿼리
const boards = await boardRepository.find({
  where: {
    title: 'Hello',
    status: 'PUBLIC',
  },
});
// 자동으로 Board 객체 배열로 반환
```

### 🎯 차이점 요약

| 구분            | 순수 SQL      | TypeORM                |
| --------------- | ------------- | ---------------------- |
| **타입 안정성** | ❌ 없음       | ✅ 컴파일 타임 검증    |
| **코드 길이**   | 길고 복잡     | 짧고 간결              |
| **오타 위험**   | 높음          | 낮음                   |
| **유지보수**    | 어려움        | 쉬움                   |
| **학습 곡선**   | SQL 지식 필요 | 객체지향 지식으로 충분 |

---

## 🔧 TypeORM의 핵심 기능과 이점

### 🏗️ 자동 스키마 생성

```typescript
@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;
}
// → 자동으로 boards 테이블 생성
```

### 🔄 간편한 CRUD 작업

```typescript
// 생성
const board = boardRepository.create({
  title: '새 게시물',
  description: '내용',
});
await boardRepository.save(board);

// 조회
const boards = await boardRepository.find();
const board = await boardRepository.findOne({ where: { id: 1 } });

// 수정
board.title = '수정된 제목';
await boardRepository.save(board);

// 삭제
await boardRepository.remove(board);
```

### 🔗 관계 매핑

```typescript
// 일대다 관계
@Entity()
export class User {
  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];
}

@Entity()
export class Board {
  @ManyToOne(() => User, (user) => user.boards)
  user: User;
}
```

### 🛠️ CLI 도구

```bash
# 마이그레이션 생성
typeorm migration:create -n CreateBoardTable

# 마이그레이션 실행
typeorm migration:run

# 스키마 동기화
typeorm schema:sync
```

---

## 🌍 다른 언어의 ORM과 비교

### ☕ Java - Hibernate(JPA)

```java
// Hibernate (Java)
@Entity
@Table(name = "boards")
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;
}

// 사용법
Session session = sessionFactory.openSession();
List<Board> boards = session.createQuery("FROM Board", Board.class).list();
```

**특징**:

- 가장 성숙한 ORM 중 하나
- 복잡하지만 강력한 기능
- XML 설정 또는 어노테이션 지원
- JPA 표준 기반

### 🐘 PHP - Eloquent (Laravel)

```php
// Eloquent (PHP)
class Board extends Model
{
    protected $table = 'boards';
    protected $fillable = ['title', 'description'];
}

// 사용법
$boards = Board::where('status', 'PUBLIC')->get();
$board = Board::create(['title' => '새 게시물']);
```

**특징**:

- Laravel 프레임워크의 일부
- 매우 직관적이고 간단한 문법
- Active Record 패턴
- 마이그레이션, 시더 등 풍부한 도구

---

## 🎯 TypeORM을 선택하는 이유

### ✅ 장점

1. **TypeScript 네이티브**: 타입 안정성과 개발자 경험 최적화
2. **NestJS와 완벽 통합**: 데코레이터 기반으로 일관된 개발 경험
3. **다양한 DB 지원**: PostgreSQL, MySQL, SQLite 등
4. **Active Record & Data Mapper**: 두 패턴 모두 지원
5. **풍부한 기능**: 관계 매핑, 마이그레이션, CLI 도구

### ⚠️ 주의사항

1. **성능**: 대용량 데이터 처리 시 순수 SQL보다 느릴 수 있음
2. **복잡한 쿼리**: 매우 복잡한 쿼리는 직접 SQL 작성이 필요할 수 있음
3. **러닝 커브**: ORM 개념과 TypeScript 지식 필요

---
