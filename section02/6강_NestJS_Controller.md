### NestJS Controller : 개념 및 생성

---

## 컨트롤러란? (Controller)

- **컨트롤러(Controller)**는 클라이언트로부터 **요청(Request)**를 처리하고 서버의 **응답(Response)**를 반환하는 역할을 담당한다.
- NestJS에서 클래스 위에 `@Controller()` 데코레이터를 사용하여 컨트롤러를 정의한다.
- 데코레이터는 인자로 URL **경로(path)**를 받아, 해당 경로로 들어오는 요청을 컨트롤러가 처리하도록 지정한다.
- **역할** : 라우팅(Routing),특정 경로의 요청을 어떤 함수가 처리할 지 결정한다.

---

## ⚙️ 핸들러란? (Handler)

- **핸들러(Handler)**는 컨트롤러 클래스 내부에 선언된 메서드이다. 각 핸들러는 `@Get()`, `@Post()`. `@Delete()`와 같은 **라우트 데코레이터**로 장식되어 특정 HTTP 요청 메서드(Method)와 경로에 매핑된다.

## 순서

- Reqeust(요청) -> Controller(컨트롤러) -> Handler(핸들러) -> Service(서비스) -> Response(응답) 순이다.

---

## 🛠️ Boards 컨트롤러 생성하기

NestJS CLI를 사용하면 컨트롤러를 매우 쉽게 생성할 수 있습니다. `boards` 컨트롤러를 생성하는 명령어는 다음과 같습니다.

```bash
nest g controller boards --no-spec
```

---

## 👨‍💻 CLI 명령어 실행 과정

위 명령어를 실행하면 NestJS CLI는 다음과 같은 순서로 작업을 자동 처리합니다.

1.  **`boards` 폴더 찾기**: 프로젝트의 `src` 디렉토리에서 `boards`라는 이름의 폴더를 찾습니다. (없으면 생성할 수도 있습니다.)
2.  **컨트롤러 파일 생성**: `boards` 폴더 내에 `boards.controller.ts` 파일을 생성합니다.
3.  **모듈 파일 찾기**: `boards` 폴더 내에서 이 컨트롤러를 관리할 `boards.module.ts` 파일을 찾습니다.
4.  **모듈에 컨트롤러 등록**: 찾은 `boards.module.ts` 파일을 열어 `@Module` 데코레이터의 `controllers` 배열에 방금 생성한 `BoardsController`를 자동으로 추가해 줍니다.

---
