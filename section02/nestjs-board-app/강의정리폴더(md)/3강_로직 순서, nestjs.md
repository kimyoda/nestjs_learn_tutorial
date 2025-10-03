### nest.js의 로직 흐름

---

# NestJS

- NestJS는 Express위에 구조화된 프레임워크이다.
- 모듈화와 DI(의존성 주입), 데코레이터 기반 구조를 제공한다.

### NestJS 로직 흐름

1. Request (GET /)
2. main.ts -> 앱 실행
3. AppModule -> Controller, Service 등록
4. AppController -> @Get() 경로 핸들링
5. AppService -> 비즈니스 로직 수행
6. Response('Hello World!')

## 📦 NestJS 구성 요소 요약

| 구성 요소       | 설명                                  |
| --------------- | ------------------------------------- |
| `main.ts`       | 앱의 시작점 (`bootstrap` 함수)        |
| `AppModule`     | 앱의 루트 모듈 (기능 묶음 단위 관리)  |
| `AppController` | 요청 처리 및 응답 반환                |
| `AppService`    | 실제 로직 수행 (데이터 처리, 가공 등) |

---

## ✨ NestJS 특징 요약

- 구조화된 설계 : `Controller` / `Service` / `Module` 분리
- 데코레이터 기반 선언식 코드 -> `@Controller`, `@Get`, `@Injectable`, `@Module`
- 강력한 타입 지원 (타입스크립트)
- 테스트 및 확장성 우수
