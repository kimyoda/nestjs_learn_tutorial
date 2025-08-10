### 모든 게시물을 가져오는 서비스 만들기(R)

---

## 개요

- 게시물 데이터를 데이터베이스에서 가져오는 로직 **Service**에서 구현한다.

---

## 1. 로컬 데이터 저장

- `boards` 배열안에 게시물 데이터를 저장한다.
- **`private` 키워드**를 사용하는 이유:
  - `private`을 사용하지 않으면 다른 컴포넌트에서 `BoardsService`에 접근하여 `boards` 배열 값을 임의로 수정할 수 있기 때문입니다.

---

## 2. 모든 게시물 가져오기

- `boards` 배열 안의 모든 데이터를 가져오기 위해 **`getAllBoards()`** 메서드를 사용합니다.
- 이 메서드를 호출하려면 **Controller**를 통해 요청이 전달되어야 합니다.

---

## 3. 요청 처리 흐름

1. **클라이언트 요청**
   - 예: `axios.get('/boards')`
2. **Controller**
   - 요청 경로에 맞춰 해당 메서드로 라우팅
   - 예: `getAllBoards()` 메서드 호출
3. **Service**
   - 요청에 맞는 로직 처리
   - 결과값을 Controller로 반환
4. **Controller**
   - Service로부터 받은 결과를 클라이언트로 응답

---

## 4. Express 예시

```javascript
// 예시 코드 (Express 기반)
app.get("/boards", (req, res) => {
  const boards = boardsService.getAllBoards();
  res.send(boards);
});
```

---

## 5. 요청 흐름 정리

```scss
[Client]  axios.get('/boards')
   ↓
[Controller]  요청 경로 매핑 → getAllBoards() 호출
   ↓
[Service]  로직 실행 → 데이터 반환
   ↓
[Controller]  결과 응답
   ↓
[Client]  결과 수신

```

### 핵심요약

- Service: 비즈니스 로직 처리 (게시물 데이터 관리)
- Controller: 요청을 받고 알맞은 메서드 호출
- Client -> Controller -> Service -> Controller -> Client 순서로 데이터 이동
