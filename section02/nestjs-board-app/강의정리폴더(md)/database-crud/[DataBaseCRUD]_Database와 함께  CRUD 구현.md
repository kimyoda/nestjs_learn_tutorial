### 데이터베이스와 함께 CRUD 구현 위해 정리

---

## 🤔 데이터베이스 연동을 위해 CRUD 구현을 위해 수정할 부분

1. Service와 Controller 파일에서 로직들을 다 수정해야 한다. 원래있던 부분들을 주석처리 한다.

2. 메모리에 데이터 저장이 아니니 Service에 board 배열을 지워준다.

3. 게시물 데이터를 정의할때, Entity를 이용, Board Model 파일에 Board Interace는 지워야 한다.

4. Status Enum은 필요해서, 이 부분만을 위한 파일을 생성해서 넣는다. board-status.enum.ts 생성

5. 데이터베이스 이용으로 인한 불필요한 경로 지우기 boatrd status validation pip ts. BoardStatus
