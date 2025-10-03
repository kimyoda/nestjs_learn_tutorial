# DTO(Data Transfer Object)

- 계층 간 데이터 교환을 위한 객체이다.
- DB에서 데이터를 얻어 Service나 Controller 등으로 보낼 때 사용하는 객체를 말한다.
- DTO는 데이터가 네트워크를 통해 전송되는 방법을 정의하는 객체이다.
- interface나 class를 이용해서 정의 될 수 있다.(다만, 클래스를 이용하는 것을 추천한다)

---

## 1. DTO (Data Transfer Object)를 쓰는 이유는?

- 데이터 유효성을 체크하는 데 효율적이다.
- 더 안정적인 코드로 만들어준다. 타입스크립트의 타입으로 사용된다.

---

# NestJS 게시물 생성 프로세스 (Controller-Service 흐름)

사용자가 새로운 게시물을 생성하기 위해 요청을 보냈을 때, 데이터가 컨트롤러와 서비스를 거쳐 최종적으로 클라이언트에게 응답으로 돌아오기까지의 과정을 나타냅니다.

---

## 🚀 전체 흐름 요약

```
Request  ->  2. Controller  ->  3. Service  ->  4. Response
(요청)          (데이터 추출 및 전달)      (비즈니스 로직 처리)      (최종 결과 응답)
```

---

## 1. 클라이언트 요청 (Client Request)

사용자는 생성할 게시물의 **`title`**과 **`description`** 정보를 `JSON` 형식의 Body에 담아 서버로 `POST` 요청을 보냅니다.

```json
{
  "title": "Hello",
  "description": "my friends"
}
```

---

## 2. 컨트롤러 (@Controller)

클라이언트의 요청은 가장 먼저 컨트롤러에 도달합니다. 컨트롤러는 요청을 받아 필요한 데이터를 추출하고, 실제 로직을 처리하는 서비스에 전달하는 문지기 역할을 합니다.

- **@Post()**: POST HTTP 메소드 요청을 처리하는 핸들러임을 나타냅니다.
- **@Body('title'), @Body('description')**: 요청의 Body 데이터에서 title과 description 값을 각각 추출하여 title, description 파라미터에 할당합니다.

```ts
// boards.controller.ts
@Controller("boards")
export class BoardsController {
  constructor(private boardService: BoardsService) {}

  @Post()
  createBoard(
    @Body("title") title: string,
    @Body("description") description: string
  ): Board {
    // 2. 서비스에 데이터를 넘겨주며 게시물 생성을 위임
    return this.boardService.createBoard(title, description);
  }
}
```

---

## 3. 서비스 (Service)

컨트롤러로부터 전달받은 데이터를 이용해 실제 비즈니스 로직을 수행합니다. 게시물 객체를 생성하고, 데이터베이스나 메모리에 저장하는 등의 작업을 처리합니다.

1. 컨트롤러에서 받은 title, description을 파라미터로 받습니다.
2. uuid를 이용해 게시물의 고유 ID를 생성합니다.
3. 게시물의 초기 상태(status)를 PUBLIC으로 설정합니다.
4. 모든 정보를 종합하여 하나의 완전한 board 객체를 생성합니다.
5. 생성된 board 객체를 배열(this.boards)에 추가(저장)합니다.
6. 생성된 board 객체를 컨트롤러에 반환(return)합니다.

```ts
createBoard(title: string, description: string): Board {
  const board: Board = {
    id: uuid(), // 1. 고유 ID 생성
    title,
    description,
    status: BoardStatus.PUBLIC, // 2. 기본 상태값 지정
  };

  this.boards.push(board); // 3. 메모리에 저장
  return board; // 4. 생성된 게시물 객체 반환
}
```

---

## 4. 최종 응답 (Response)

컨트롤러는 서비스로부터 반환받은 완성된 board 객체를 클라이언트에게 최종 응답으로 전송합니다. 이 응답 데이터에는 클라이언트가 보낸 title, description뿐만 아니라 서버에서 생성한 id와 status 값까지 모두 포함됩니다.

```json
{
  "id": "eowdkoefko2",
  "title": "Hello",
  "description": "my friends",
  "status": "PUBLIC"
}
```

---

## 5. NestJS에서 데이터 처리의 흐름

- Board를 위한 Property를 여러 곳에서 사용한다(title, description)
- 지금은 몇개의 프로퍼티만 불러주고 몇군데에서만 부르면 된다.
- 여러군데에서 이용하여 갑자기 한곳에서 Property 이름을 바꿔줘야 한다면?
- 다른곳에 똑같이 쓰인 모든 곳의 프로퍼티도 똑같이 바꿔줘야 한다.

---

## 6. Interface VS Class For DTO

### Interface의 문제점

- 런타임에서 사라진다 (컴파일 시점에만 존재)
- 유효성 검사가 어렵다

### Class의 장점

- 런타임에서도 존재한다
- 유효성 검사가 가능하다
- NestJS에서 권장하는 방식

DTO는 Inferace나 Class를 사용해서 만든다. Class가 선호되는 이유는?

- TypeScript 인터페이스를 사용, 간단한 클래스를 사용하여 DTO 스키마를 결정할 수 있다.
- 클래스는 JavaScript ES6 표준의 일부이므로 컴파일 된 JavaScript 실제 엔티티로 유지된다.
- TypeScript는 인터페이스는 트랜스 팡리 중 제거되어 Nest는 런타임에서 참조할 수 없다.
- 파이프와 같은 기능을 런타임에서 사용할 수 있어 런타임에서 사용 될 수 있는게 중요하다. 그래서 class를 이용해서 만드는게 좋다.

---
