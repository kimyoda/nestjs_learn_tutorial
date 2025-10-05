### NestJS_Pipes

---

## 🤔 Pipe란 무엇인가?

**Pipe는 NestJS에서 데이터의 문지기 역할을 하는 특별한 클래스입니다.**

### 📋 Pipe의 기본 특징

- `@Injectable()` 데코레이터로 주석이 달린 클래스
- **Data Transformation** (데이터 변환)과 **Data Validation** (데이터 검증)을 담당
- 컨트롤러의 라우트 핸들러가 처리하는 인수에 대해 작동
- NestJS 메소드가 호출되기 **직전**에 파이프가 삽입되어 인수를 검사하고 변환

---

## 🔄 전체 요청 흐름 (Pipe의 역할)

### 1️⃣ **요청 (Request)**

클라이언트가 데이터를 담아서 요청을 보냅니다.

    ```json
    {
      "title": "hello",
      "description": "hi"
    }
    ```

### 2️⃣ **파이프 (Pipe) - 문지기 통과** 🚰

- 요청은 가장 먼저 **파이프**를 만납니다
- 파이프는 들어온 데이터에 문제가 없는지 **유효성을 검사**하고, 필요하다면 **형태를 변환**합니다

### 3️⃣ **두 갈래 길: 통과 vs 실패** 🛤️

- **✅ 통과**: 데이터에 아무런 문제가 없으면, 파이프는 요청을 그대로 **라우트 핸들러**로 전달
- **❌ 실패**: 데이터가 규칙에 어긋나면, 파이프는 요청을 막고 바로 **에러**를 발생

### 4️⃣ **핸들러와 응답 (Handler & Response)** 🎯

- 파이프를 무사히 통과한 '깨끗한' 데이터만이 핸들러에 도착
- 핸들러는 이 데이터를 받아 비즈니스 로직을 처리한 후, 성공적인 **응답**을 클라이언트에게 전송

---

## 🔧 Pipe의 두 가지 주요 기능

### 📊 Data Transformation (데이터 변환)

- **목적**: 입력 데이터를 원하는 형식으로 변환
- **예시**: 문자열 → 정수 변환
- **실제 상황**: 숫자를 받고 싶은데 문자열로 오면, 파이프에서 자동으로 숫자로 변환해줌

### ✅ Data Validation (데이터 검증)

- **목적**: 입력 데이터가 규칙에 맞는지 평가
- **통과**: 유효한 경우 → 그대로 전달
- **실패**: 유효하지 않은 경우 → 예외 발생
- **예시**: 이름 길이가 10자 이하여야 하는데, 10자 이상이면 에러 발생

---

## 🎯 Pipe 사용법 (3가지 레벨)

### 1️⃣ **Handler-level Pipes** (핸들러 레벨)

- `@UsePipes()` 데코레이터를 사용
- **해당 핸들러의 모든 파라미터**에 적용

```typescript
@Post()
@UsePipes(pipe)  // title과 description 모두에 적용
createBoard(
    @Body('title') title,
    @Body('description') description
) {
    // 핸들러 로직
}
```

### 2️⃣ **Parameter-level Pipes** (파라미터 레벨)

- **특정 파라미터에만** 적용
- 파라미터 옆에 직접 지정

```typescript
@Post()
createBoard(
    @Body('title', ParameterPipe) title,  // title에만 적용
    @Body('description') description      // description에는 적용 안됨
) {
    // 핸들러 로직
}
```

### 3️⃣ **Global-level Pipes** (글로벌 레벨)

- **애플리케이션 전체**에 적용
- `main.ts`에서 설정
- 클라이언트의 모든 요청에 자동 적용

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(GlobalPipes); // 모든 요청에 적용
  await app.listen(3000);
}
bootstrap();
```

---

## 🛠️ Built-in Pipes (내장 파이프)

NestJS에서 제공하는 **6가지 기본 파이프**:

1. **ValidationPipe** - 데이터 유효성 검사
2. **ParseIntPipe** - 문자열을 정수로 변환
3. **ParseBoolPipe** - 문자열을 불린으로 변환
4. **ParseArrayPipe** - 문자열을 배열로 변환
5. **ParseUUIDPipe** - UUID 형식 검증
6. **DefaultValuePipe** - 기본값 설정

### 💡 ParseIntPipe 예시

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.findOne(id);
}
```

**동작 방식:**

- URL에서 `id` 파라미터를 받음
- `ParseIntPipe`가 문자열을 숫자로 변환
- 만약 `abc` 같은 문자열이 오면 → **에러 발생** ❌
- `123` 같은 숫자 문자열이 오면 → `123` (number)로 변환 ✅

---

## 📚 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com/)

> **💡 Tip**: Pipe는 NestJS에서 데이터의 품질을 보장하는 중요한 역할을 합니다. 마치 건물의 보안 검색대처럼 모든 데이터가 올바른지 확인하고 필요시 변환해주는 친구라고 생각하시면 됩니다!
