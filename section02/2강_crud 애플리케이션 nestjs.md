### CURD 만들기

---

# Nest JS를 통해 사용할 것들(앱 구조)

- 게시글을 만드는 것이여서 **게시글에 관한 모듈**과 **게시글을 만드는 사람에 대한 인증 모듈**이 필요하다. 각 모듈을 구성하는 Controller, Service, Repository 등이 있어 이러한 용어는 NestJS에서 어떠한 용도로 사용되는 지 확인해보자.

---

# BoardModuel

- BoardController, BoardEntity, BoardService, BoardRepository, ValidationPipe

# AuthModule

- AuthController, UserEntity, AuthService, UserRepository, JWT, Passport

---

# 프로젝트 시작하기

1. 프로젝트를 시작할 폴더 생성

2. 폴더 안에서 nest 기본 구조 생성

- npm -g @nestjs/cli -> nest new ./

3. 앱 실행 -> npm start:dev

4. Nest JS 기본 구조 설명
   - eslintrc.js
   - prettierrc
   - nest-cli..json
   - tsconfig.json
   - tsconfig.build.json
   - package.json
   - src 폴더(대부분의 비즈니스 로직이 들어가는 곳)
