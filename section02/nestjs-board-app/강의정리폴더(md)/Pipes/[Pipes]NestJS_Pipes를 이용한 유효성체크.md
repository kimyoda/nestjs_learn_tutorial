# 🚰 NestJS Pipes를 이용한 유효성 체크

- 파이프를 이용해서 게시물을 생성할 때 유효성 체크를 한다.

---

### 📋 필요한 모듈

- `class-validator`, `class-transformer`
- 명령어 입력 `npm install class-validator class-transformer --save`
- Documentation 페이지
  - https://github.com/typestack/class-validator#manual-validation

---

## 🔄 파이프 생성하기

```ts
// class는 런타임에서 작동하여 파이프 같은 기능을 이용할 때 유용하다.
import { IsNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
```

boards.controller적용

```ts
  @Post()
  @UsePipes(ValidationPipe)
  createBoard(@Body() createBoardDto: CreateBoardDto): Board {
    return this.boardService.createBoard(createBoardDto);
  }
```

### 적용

```json
예시
{
  "title": "요한1",
  "description": ""
}
{
    "title": "",
    "description" : ""
}
```

예시 결과

```json
{
  "message": ["description should not be empty"],
  "error": "Bad Request",
  "statusCode": 400
}
{
    "message": [
        "title should not be empty",
        "description should not be empty"
    ],
    "error": "Bad Request",
    "statusCode": 400
}
```
