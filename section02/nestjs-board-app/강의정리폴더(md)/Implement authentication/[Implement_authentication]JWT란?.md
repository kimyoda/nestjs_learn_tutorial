# JWT(JSON Web Token)이란?

## 📋 목표

- JWT는 당사자간에 정보를 JSON 개체로 안전하게 전송하기 위한 컴팩트하고 독립적인 방식을 정의하는 개방형 표준이다.
- 이 정보는 디지털 서명이 되어 있어 확인하고 신뢰할 수 있다
- 정보를 안전하게 전할 때 혹은 유저의 권한 같은 것을 체크 하기 위해 사용하는데 유용한 모듈이다.

### JWT의 구조

- JWT는 마침표로 구분되는 세 부분으로 구성된다.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InlvaGFuIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2Q4fwpMeJf36POk6yJV_adQssw5c
```

| 부분    | 이름                   | 설명                                                   |
| :------ | :--------------------- | :----------------------------------------------------- |
| `xxxxx` | **헤더 (Header)**      | 토큰의 타입과 서명에 사용된 해싱 알고리즘 정보         |
| `yyyyy` | **페이로드 (Payload)** | 전달하려는 실제 정보 (사용자 정보, 권한, 만료 시간 등) |
| `zzzzz` | **서명 (Signature)**   | 토큰의 위변조 여부를 확인하는 데 사용되는 전자 서명    |

1. Header

- 토큰에 대한 메타 데이터, 어떤 종류의 토큰이고 어떤 알고리즘으로 서명되었는지 담는다.(타입, 해싱 알고리즘, SHA256)

```json
{
  "alg": "HS256", // 서명 알고리즘 (HMAC-SHA256)
  "typ": "JWT" // 토큰 타입 (JWT)
}
```

2. Payload

- 유저 정보(issuer), 만료 기간, 주제 등
- 토큰에 담아 전달할 실제 정보 조각들, 즉 **클레임(Claim)**이 들어있다. 클레임은 등록된(Registered) 클레임, 공개(Public) 클레임, 비공개(Private) 클레임 세 종류로 나뉜다.

```json
{
  "username": "yohan",
  "role": "admin",
  "iat": 1516239022,
  "exp": 1516239999
}
```

3. Verify Signature

- 세그먼트는 토큰이 보낸 사람에 의해 서명되어 어떤식으로든 변경되지 않았는지 확인하는 사용되는 서명이다.
- 서명은 헤더 및 페이로드 세그먼트, 서명 알고리즘, 비밀 또는 공개 키를 사용하여 생성된다.

```json
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

---

### 3. JWT 사용 흐름 🔄

👤 사용자 로그인: 사용자가 아이디와 비밀번호로 로그인을 요청한다.

💻 서버 검증 및 토큰 생성: 서버는 사용자 정보를 확인하고, 정보가 맞다면 페이로드에 사용자 정보(예: username)를 담아 JWT를 생성하고 서명한다.

↩️ 클라이언트에 토큰 전달: 서버는 생성된 JWT를 클라이언트에게 전달한다.

🔒 클라이언트 토큰 보관: 클라이언트는 전달받은 JWT를 로컬 스토리지, 세션 스토리지 등에 안전하게 보관한다.

🔄 인증 요청: 이후 클라이언트는 인증이 필요한 API를 요청할 때마다 HTTP Authorization 헤더에 이 JWT를 담아 함께 보낸다. (Authorization: Bearer <token>)

✅ 서버 토큰 검증: 서버는 클라이언트로부터 받은 JWT의 서명을 검증한다.

### 4. 서버의 토큰 검증 과정 (가장 중요!) ✅

서버는 어떻게 토큰이 위조되지 않았는지 확인한다.

1. 클라이언트가 헤더, 페이로드, 서명이 모두 담긴 JWT를 보낸다.

2. 서버는 토큰에서 헤더와 페이로드를 분리한다.

3. 서버는 자신이 보관하고 있는 **비밀 키(Secret Key)**를 사용해서, 수신한 헤더와 페이로드를 다시 해싱하여 새로운 서명을 생성한다.

4. **서버가 새로 만든 서명**과 클라이언트가 보낸 **토큰에 원래 있던 서명**을 비교한다.

5. 두 서명이 일치하면, "이 토큰은 내가 발급한 것이 맞고, 중간에 변경되지 않았구나"라고 신뢰하고 요청을 처리합니다. 만약 일치하지 않으면 요청을 거부한다.

```
[클라이언트가 보낸 헤더 + 페이로드] + [서버의 비밀 키] => 서버가 재생성한 서명
|| (일치 여부 비교)
ß클라이언트가 보낸 서명
```

이 과정을 통해 서버는 매번 데이터베이스를 조회하지 않고도 사용자를 신뢰하고 인증을 처리할 수 있게 된다.

---

## 🔐 JWT의 장점과 단점

### ✅ 장점

1. **Stateless (무상태)**: 서버에 세션 정보를 저장할 필요가 없어 확장성이 좋다
2. **Cross-Domain**: 다른 도메인 간에도 토큰을 사용할 수 있다
3. **Self-Contained**: 토큰 자체에 필요한 정보가 포함되어 있어 별도 조회가 불필요
4. **표준화**: RFC 7519 표준을 따르므로 다양한 언어와 프레임워크에서 지원

### ❌ 단점

1. **토큰 크기**: 쿠키보다 크기가 클 수 있다
2. **보안 취약점**: 토큰이 탈취되면 만료 시간까지 유효하다
3. **무효화 어려움**: 토큰을 즉시 무효화하기 어렵다
4. **민감한 정보 노출**: 페이로드는 Base64로 인코딩되어 있어 쉽게 디코딩 가능

---

## 📝 JWT 클레임(Claims) 상세

### Registered Claims (등록된 클레임)

```json
{
  "iss": "https://your-domain.com", // 발급자 (Issuer)
  "sub": "user123", // 주제 (Subject) - 보통 사용자 ID
  "aud": "your-app", // 대상 (Audience) - 토큰을 받을 대상
  "exp": 1516239022, // 만료 시간 (Expiration Time)
  "nbf": 1516239022, // 유효 시작 시간 (Not Before)
  "iat": 1516239022, // 발급 시간 (Issued At)
  "jti": "unique-token-id" // JWT ID - 토큰의 고유 식별자
}
```

### Public Claims (공개 클레임)

```json
{
  "name": "김요한",
  "email": "yohan@example.com",
  "picture": "https://example.com/avatar.jpg"
}
```

### Private Claims (비공개 클레임)

```json
{
  "companyId": "company123",
  "department": "engineering",
  "permissions": ["read", "write", "admin"]
}
```

---

## 🔄 Access Token vs Refresh Token 패턴

### 이중 토큰 시스템

1. **Access Token**: API 요청 시 사용하는 짧은 만료 시간의 토큰
2. **Refresh Token**: Access Token을 갱신하는 긴 만료 시간의 토큰

```javascript
// 로그인 응답 예시
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600 // 1시간
}
```

### 토큰 갱신 플로우

1. Access Token이 만료됨
2. Refresh Token으로 새로운 Access Token 요청
3. 서버가 Refresh Token 검증 후 새 Access Token 발급
4. Refresh Token도 함께 갱신 (선택사항)

---

## 🛡️ JWT 보안 고려사항

### 1. 토큰 저장 방법

**❌ 피해야 할 방법:**

- `localStorage`: XSS 공격에 취약
- `sessionStorage`: 탭을 닫으면 사라짐

**✅ 권장 방법:**

- `httpOnly` 쿠키: XSS 공격으로부터 안전
- 메모리 저장: 페이지 새로고침 시 사라지지만 가장 안전

### 2. 토큰 만료 시간 설정

```javascript
// Access Token: 짧은 만료 시간 (15분~1시간)
{
  "exp": Math.floor(Date.now() / 1000) + (15 * 60) // 15분
}

// Refresh Token: 긴 만료 시간 (7일~30일)
{
  "exp": Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7일
}
```

### 3. 민감한 정보 포함 금지

```javascript
// ❌ 피해야 할 예시
{
  "password": "hashedPassword", // 절대 포함하지 말 것
  "creditCard": "1234-5678-9012-3456", // 민감한 정보
  "ssn": "123-45-6789" // 개인정보
}

// ✅ 권장 예시
{
  "userId": "12345",
  "username": "yohan",
  "role": "user",
  "iat": 1516239022,
  "exp": 1516242622
}
```

---

## 🚨 JWT 취약점 및 대응 방안

### 1. Algorithm Confusion Attack

**문제**: 공개키로 서명된 토큰을 HMAC으로 검증하려고 시도

**해결책**: 알고리즘을 명시적으로 검증

```javascript
// ❌ 위험한 코드
jwt.verify(token, secret);

// ✅ 안전한 코드
jwt.verify(token, secret, { algorithms: ['HS256'] });
```

### 2. None Algorithm Attack

**문제**: `"alg": "none"`으로 설정된 토큰

**해결책**: None 알고리즘 명시적 금지

```javascript
jwt.verify(token, secret, { algorithms: ['HS256', 'RS256'] });
```

### 3. Secret Key 노출

**문제**: 비밀키가 코드에 하드코딩되거나 환경변수로 노출

**해결책**:

- 환경변수 사용
- 키 로테이션 정책
- 적절한 키 길이 사용 (최소 256비트)

---

## 📊 JWT vs Session 비교

| 특징       | JWT               | Session                       |
| ---------- | ----------------- | ----------------------------- |
| **상태**   | Stateless         | Stateful                      |
| **확장성** | 높음              | 낮음 (서버 간 세션 공유 필요) |
| **보안**   | 토큰 탈취 시 위험 | 서버에서 즉시 무효화 가능     |
| **성능**   | DB 조회 불필요    | 매번 DB 조회 필요             |
| **크기**   | 상대적으로 큼     | 작음 (세션 ID만)              |
| **모바일** | 적합              | 부적합                        |

---

## 🔧 JWT 서명 알고리즘

### 1. HMAC (대칭키)

```json
{
  "alg": "HS256" // HMAC with SHA-256
}
```

- **장점**: 빠르고 간단
- **단점**: 서버와 클라이언트가 같은 키를 공유해야 함

### 2. RSA (비대칭키)

```json
{
  "alg": "RS256" // RSA with SHA-256
}
```

- **장점**: 공개키로 검증 가능, 키 공유 불필요
- **단점**: 서명 생성이 느림

### 3. ECDSA (타원곡선)

```json
{
  "alg": "ES256" // ECDSA with SHA-256
}
```

- **장점**: RSA보다 빠르고 작은 키로 같은 보안 수준
- **단점**: 구현이 복잡

---

## 🌐 JWT 사용 사례

### 1. 웹 애플리케이션 인증

- 사용자 로그인/로그아웃
- API 접근 제어
- 권한 기반 접근 제어

### 2. 마이크로서비스 간 통신

- 서비스 간 인증
- 사용자 컨텍스트 전달
- 분산 시스템에서의 신뢰성

### 3. 모바일 앱 인증

- 앱과 서버 간 통신
- 푸시 알림 인증
- 오프라인 모드 지원

### 4. SSO (Single Sign-On)

- 여러 애플리케이션 간 로그인 공유
- OAuth 2.0과 함께 사용
- SAML 대안으로 활용

---
