# 비밀번호 암호화 하기 (설명 및 세팅)

## 📋 목표

- 유저를 생성할 때 비밀번호를 암호화해서 저장을 하는 부분을 구현한다.

---

## 🔄 bcryptjs

- 이 기능을 구현하기 위해 bcryptjs라는 모듈을 사용해야 한다.
- `npm install bcryptjs --save`

---

## 비밀번호를 데이터베이스에 저장하는 방법

### 1. 원본 비밀번호 저장

- 사실상 안쓰임

### 2. 비밀번호를 암호화 키(Encryption Key)와 함께 암호화(양방향)

- 원본 데이터를 암호문으로 만들고, 동일한 키를 사용해 다시 원본 데이터로 되돌릴 수 있는 방식이다.
- 암호화와 복호화가 모두 가능하다.
- 예시:
  - `1234` -> (암호화) -> `UuFwNo4zkMV+erdGtBlf5NunNgcELQuiCFJmCU4F+E=`
  - `UuFwNo4zkMV+erdGtBlf5NunNgcELQuiCFJmCU4F+E=` -> (복호화) -> `1234`
- 암호화 키가 유출되면 암호문을 쉽게 원본으로 되돌릴 수 있어 위험하다. 저장에는 부적합하다.

### 3. 단순 해시(단뱡향 암호화)

- **단방향 해시(Hash)**는 데이터를 고정된 길이의 문자열로 바꾸고, 한번 바꾸면 다시 원본 데이터로 되돌릴 수 없는 방식이다.
- 복호화가 불가능하다.
- 예시:
  - `1234` -> (해싱) -> `UuFwNo4zkMV+erdGtBlf5NunNgcELQuiCFJmCU4F+E=...`
- 미리 계산된 해시값 목록과 비교하여 원본 비밀번호를 찾아낼 수 있다.
- `1234`처럼 단순한 비밀번호는 여러 사용자가 동일한 해시값을 갖게 되어 위험하다.

### 4. 솔트(Salt)를 추가한 해시 (안전하다)

- **사용자 별로 고유한 임의의 문자열(Salt)**을 추가하는 방식이다.
  수 있는 방식이다.

- 원본 비밀번호가 같더라도 솔트값이 달라서 최종 해시 결과는 전혀 다르게 나온다.

```ts
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs'; // bcryptjs 추가

@Injectable() // ✅ 1. @Injectable() 데코레이터 사용
export class UserRepository extends Repository<User> {
  // ✅ 1. DataSource를 주입받는 생성자를 추가해야 합니다.
  constructor(private dataSource: DataSource) {
    // ✅ 2. super()를 호출해서 부모 클래스(Repository)를 초기화합니다.
    super(User, dataSource.createEntityManager());
  }
  // 유저 생성 추가
  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    // 암호화 로직 적용, Salt 생성
    const salt = await bcrypt.genSalt();
    // 비밀번호 생성
    const hashPassword = await bcrypt.hash(password, salt);
    // 해싱된 비밀번호로 유저 생성
    const user = this.create({ username, password: hashPassword });

    // try-catch 문 적용
    try {
      await this.save(user);
    } catch (error) {
      // "23505"는 PostgreSQL의 unique violation에러 코드이다.
      if (error.code === '23505') {
        throw new ConflictException('Existing username');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
#### salt 결과
{
    "username": "checksalt",
    "password": "1111"
}
-> 아래와 같이 비밀번호가 생성되는 것을 확인할 수 있다.
7	"checksalt"	"$2b$10$gYN4fn9Dpt.g4NH1wIryU.BukZTYOWej3cWvSBsnVztmkPvngU2Cq"

```

---

## 🔎 추가 설명

### Salt를 사용하는 이유

#### 1. 레인보우 테이블 공격 방지

- **레인보우 테이블**: 미리 계산된 해시값과 원본 비밀번호의 대응표
- 단순 해시만 사용하면 `1234` → `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae` 같은 고정된 결과
- Salt 없이는 해커가 미리 계산된 테이블로 쉽게 비밀번호를 찾을 수 있음

#### 2. 동일 비밀번호에 대한 다른 해시값 생성

```ts
// Salt 없이
"1234" → "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae"
"1234" → "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae" (동일)

// Salt 사용
"1234" + "randomSalt1" → "b7c8a9d2e1f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4"
"1234" + "randomSalt2" → "c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4" (다름)
```

### bcryptjs 활용 방법

#### 1. Salt 생성

```ts
// 기본 Salt 생성 (라운드 수: 10)
const salt = await bcrypt.genSalt();

// 커스텀 라운드 수로 Salt 생성
const salt = await bcrypt.genSalt(12); // 더 높은 보안, 더 느린 처리
```

#### 2. 비밀번호 해싱

```ts
// 방법 1: Salt와 비밀번호를 별도로 전달
const salt = await bcrypt.genSalt();
const hashPassword = await bcrypt.hash(password, salt);

// 방법 2: Salt 자동 생성 (권장)
const hashPassword = await bcrypt.hash(password, 10); // 라운드 수만 지정
```

#### 3. 비밀번호 검증 (로그인 시)

```ts
// 사용자 입력 비밀번호와 저장된 해시 비교
const isValidPassword = await bcrypt.compare(inputPassword, storedHashPassword);
```

### 보안 고려사항

#### 1. Salt 저장

- bcrypt는 Salt를 해시값에 포함하여 저장 (별도 저장 불필요)
- 해시값: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
  - `$2a$`: bcrypt 버전
  - `10`: 라운드 수
  - `N9qo8uLOickgx2ZMRZoMye`: Salt (22자)
  - `IjZAgcfl7p92ldGxad68LJZdL17lhWy`: 실제 해시 (31자)

#### 3. 비밀번호 정책

- 최소 길이: 8자 이상
- 복잡성: 대소문자, 숫자, 특수문자 조합
- 일반적인 비밀번호 금지 (1234, password 등)

---
