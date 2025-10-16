# 인증 기능 구현을 위한준비

## 🎯 인증 기능 구현을 위한 준비가 왜 필요한가?

### 🔐 인증(Authentication)이란?

- **사용자 신원 확인**: "당신이 누구인지"를 확인하는 과정
- **로그인/로그아웃**: 사용자가 시스템에 접근할 수 있는 권한을 부여하거나 제거
- **보안**: 인증되지 않은 사용자가 시스템에 접근하는 것을 방지

### 🏗️ 인증 시스템 구축을 위한 필수 요소들

#### 1. **모듈 구조 분리** (왜 auth 모듈을 따로 만드는가?)

- **관심사 분리**: 인증 관련 로직을 별도 모듈로 분리하여 코드 구조를 명확하게 함
- **재사용성**: 다른 프로젝트에서도 인증 모듈을 쉽게 재사용 가능
- **유지보수**: 인증 관련 수정사항이 있을 때 한 곳에서만 관리 가능

#### 2. **사용자 데이터 관리** (왜 User Entity가 필요한가?)

- **데이터 저장**: 사용자의 정보(아이디, 비밀번호)를 데이터베이스에 저장
- **데이터 검증**: 사용자가 입력한 정보가 올바른지 확인
- **데이터 조회**: 로그인 시 사용자 정보를 찾아서 인증 처리

#### 3. **데이터베이스 연동** (왜 Repository 패턴을 사용하는가?)

- **데이터 접근 추상화**: 데이터베이스 작업을 쉽게 처리
- **쿼리 최적화**: 복잡한 데이터베이스 쿼리를 간단한 메서드로 처리
- **테스트 용이성**: 데이터베이스 없이도 테스트 가능

---

## 📋 CLI를 이용한 모듈, 컨트롤러, 서비스 생성

### 🛠️ NestJS CLI 명령어 설명

- `nest g module auth`: auth 모듈 생성
  - **모듈**: 관련된 컴포넌트들을 하나로 묶는 단위
  - **auth 모듈**: 인증과 관련된 모든 컴포넌트를 포함
- `nest g controller auth --no-spec`: auth 컨트롤러 생성
  - **컨트롤러**: HTTP 요청을 받아서 처리하는 역할
  - **--no-spec**: 테스트 파일 자동 생성하지 않음
- `nest g service auth --no-spec`: auth 서비스 생성
  - **서비스**: 비즈니스 로직을 처리하는 역할

---

## 🔄 User를 위한 Entity 생성

### 🤔 왜 User Entity가 필요한가?

#### 📊 사용자 데이터 구조 정의

- **Entity**: 데이터베이스 테이블과 매핑되는 클래스
- **사용자 정보 저장**: 아이디, 비밀번호, 추가 정보 등을 체계적으로 관리
- **데이터 무결성**: 사용자 데이터의 일관성과 정확성 보장

### 1. user.entity.ts 파일 생성

### 2. 파일 소스 코드 작성

user.entity.ts

```ts
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number; // 고유 식별자 - 자동으로 생성되는 기본키

  @Column()
  username: string; // 사용자 이름 - 로그인 시 사용할 아이디

  @Column()
  password: string; // 비밀번호 - 보안을 위해 해시화되어 저장
}
```

### 🔍 Entity 코드 상세 설명

#### **@Entity()**:

- TypeORM에게 이 클래스가 데이터베이스 테이블임을 알려줌
- 테이블명은 클래스명(User)을 소문자로 변환한 'user'가 됨

#### **extends BaseEntity**:

- TypeORM의 기본 Entity 클래스를 상속
- `save()`, `remove()`, `find()` 등의 유용한 메서드 사용 가능

#### **@PrimaryGeneratedColumn()**:

- 자동 증가하는 기본키 설정
- 데이터베이스에서 자동으로 고유한 ID 생성

#### **@Column()**:

- 일반 컬럼 정의
- 데이터베이스 컬럼과 클래스 속성을 매핑

### 3. Repository 생성

### 📦 Repository 패턴의 장점

#### **데이터 접근 추상화**:

- 데이터베이스 쿼리를 객체지향적으로 처리
- 복잡한 SQL 쿼리를 간단한 메서드 호출로 대체

#### **비즈니스 로직 분리**:

- 데이터 접근 로직과 비즈니스 로직을 명확히 분리
- 코드의 가독성과 유지보수성 향상

- User Entity를 생성, 수정, 삭제 등의 로직을 처리, Repository를 생성한다.

user.repository.ts 생성

```ts
@EntityRepository(User)
export class UserRepository extends Repository<User> {}
```

### 🔍 Repository 코드 상세 설명

#### **@EntityRepository(User)**:

- TypeORM에게 이 클래스가 User Entity의 Repository임을 알려줌
- User Entity와 관련된 데이터베이스 작업을 담당

#### **extends Repository<User>**:

- TypeORM의 기본 Repository 클래스를 상속
- `find()`, `save()`, `delete()` 등의 기본 CRUD 메서드 자동 제공

### 4. User Repository

### 🔗 모듈 연결의 중요성

#### **의존성 주입 설정**:

- NestJS의 DI(Dependency Injection) 컨테이너에 Repository 등록
- 다른 컴포넌트에서 Repository를 쉽게 사용할 수 있도록 함

#### **모듈 간 통신**:

- AuthModule에서 UserRepository를 사용할 수 있도록 설정
- 모듈 간의 의존성을 명확하게 정의

- auth.module에 imports 안에 UserRepository를 넣어준다.

```ts
@Module({
  imports: [TypeOrmModule.forFeature([UserRepository])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

### 🔍 Module 코드 상세 설명

#### **TypeOrmModule.forFeature([UserRepository])**:

- TypeORM에게 UserRepository를 등록하라고 지시
- 이 모듈에서 UserRepository를 사용할 수 있게 됨

#### **controllers: [AuthController]**:

- 이 모듈에 포함된 컨트롤러 목록
- HTTP 요청을 처리할 컨트롤러 등록

#### **providers: [AuthService]**:

- 이 모듈에서 사용할 서비스 목록
- 비즈니스 로직을 처리할 서비스 등록

### 5. Repository Injection

### 💉 의존성 주입(Dependency Injection)의 장점

#### **느슨한 결합(Loose Coupling)**:

- 클래스 간의 의존성을 최소화
- 코드 변경 시 다른 클래스에 미치는 영향 최소화

#### **테스트 용이성**:

- Mock 객체를 쉽게 주입하여 단위 테스트 가능
- 실제 데이터베이스 없이도 테스트 가능

#### **코드 재사용성**:

- Repository를 여러 서비스에서 공유 사용 가능
- 중복 코드 제거

```ts
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}
}
```
