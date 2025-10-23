# NestJS에서 Middleware들에 대해

---

## 🔄 NestJS 에는 여러 미들웨어가 있다.

- Pipes, Filters, Guards, Interceptors등의 미들웨어로 취급되는 것들이 있고 각각 다른 목적을 가지고 사용되고 있다.

### 1. Pipes

- 파이프는 요청 유효성 검사 및 페이로드 반환을 위해 만들어진다. 데이터를 예상한 대로 직렬화한다.

### 2. Filters

- 필터는 오류 처리 미들웨어이다. 특정 오류 처리기를 사용할 경로와 각 경로 주변의 복잡성을 관리하는 방법을 알 수 있다.

### 3. Guards

- 가드는 인증 미들웨어이다. 지정된 경로로 통과할 수 있는 사람과 허용되지 않는 사람을 서버에 알려준다.

### 4. Interceptors

- 인터셉터는 응답 매핑 및 캐시 관리와 함께 요청 로깅과 같은 전후 미들웨어이다. 각 요청 전후에 이를 실행하는 기능은 매우 강력하고 유용하다.

---

## 🛠️ 각각의 미들웨어가 불러지는 (called) 순서

- middleware -> guard -> interceptor (before) -> pipe -> controller -> service -> controller -> inteceptor (after) -> filter (if applicable) -> client

---

## 📋 각 미들웨어 상세 설명

### 1. Pipes (파이프)

#### 기본 개념

- **역할**: 요청 데이터의 변환, 유효성 검사, 직렬화
- **실행 시점**: Controller 메소드 실행 전
- **주요 기능**: 입력 데이터 검증 및 변환

#### 내장 파이프들

```ts
// ValidationPipe - DTO 유효성 검사
@Post('/users')
createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
  return this.userService.create(createUserDto);
}

// ParseIntPipe - 문자열을 숫자로 변환
@Get('/users/:id')
getUser(@Param('id', ParseIntPipe) id: number) {
  return this.userService.findOne(id);
}

// ParseBoolPipe - 문자열을 불린으로 변환
@Get('/users/:id/active')
getUserActive(@Param('id', ParseIntPipe) id: number, @Query('active', ParseBoolPipe) active: boolean) {
  return this.userService.findActive(id, active);
}
```

#### 커스텀 파이프 생성

```ts
@Injectable()
export class CustomValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // 커스텀 유효성 검사 로직
    if (!value || value.length < 3) {
      throw new BadRequestException('값이 너무 짧습니다.');
    }
    return value;
  }
}
```

### 2. Filters (필터)

#### 기본 개념

- **역할**: 예외 처리 및 에러 응답 관리
- **실행 시점**: 예외가 발생했을 때
- **주요 기능**: 에러 핸들링, 로깅, 사용자 정의 응답

#### 내장 예외들

```ts
// HTTP 예외들
throw new BadRequestException('잘못된 요청입니다.');
throw new UnauthorizedException('인증이 필요합니다.');
throw new ForbiddenException('접근 권한이 없습니다.');
throw new NotFoundException('리소스를 찾을 수 없습니다.');
throw new ConflictException('중복된 데이터입니다.');
throw new InternalServerErrorException('서버 내부 오류입니다.');
```

#### 커스텀 필터 생성

```ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
```

#### 필터 적용 방법

```ts
// 전역 필터
app.useGlobalFilters(new AllExceptionsFilter());

// 컨트롤러 레벨 필터
@Controller('users')
@UseFilters(AllExceptionsFilter)
export class UsersController {}

// 메소드 레벨 필터
@Post()
@UseFilters(AllExceptionsFilter)
createUser(@Body() createUserDto: CreateUserDto) {}
```

### 3. Guards (가드)

#### 기본 개념

- **역할**: 인증(Authentication) 및 인가(Authorization)
- **실행 시점**: Controller 메소드 실행 전
- **주요 기능**: 접근 권한 제어

#### JWT 인증 가드

```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    return super.canActivate(context);
  }
}
```

#### 역할 기반 가드

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

#### 가드 적용 방법

```ts
// 전역 가드
app.useGlobalGuards(new JwtAuthGuard());

// 컨트롤러 레벨 가드
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {}

// 메소드 레벨 가드
@Post()
@UseGuards(JwtAuthGuard)
@Roles(Role.USER)
createPost(@Body() createPostDto: CreatePostDto) {}
```

### 4. Interceptors (인터셉터)

#### 기본 개념

- **역할**: 요청/응답 변환, 로깅, 캐싱
- **실행 시점**: 요청 전후 (before/after)
- **주요 기능**: 부가 기능 추가

#### 로깅 인터셉터

```ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    console.log(`[${new Date().toISOString()}] ${method} ${url} - 시작`);

    return next.handle().pipe(
      tap(() => {
        console.log(
          `[${new Date().toISOString()}] ${method} ${url} - 완료 (${Date.now() - now}ms)`,
        );
      }),
    );
  }
}
```

#### 응답 변환 인터셉터

```ts
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

#### 캐싱 인터셉터

```ts
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `cache_${request.url}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data, 300); // 5분 캐시
      }),
    );
  }
}
```

#### 인터셉터 적용 방법

```ts
// 전역 인터셉터
app.useGlobalInterceptors(new LoggingInterceptor());

// 컨트롤러 레벨 인터셉터
@Controller('users')
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class UsersController {}

// 메소드 레벨 인터셉터
@Get()
@UseInterceptors(CacheInterceptor)
getUsers() {}
```

---

## 🔄 미들웨어 실행 순서 상세 분석

### 요청 처리 흐름

```
1. Middleware (전역 미들웨어)
   ↓
2. Guards (인증/인가 검사)
   ↓
3. Interceptors (before) - 요청 전 처리
   ↓
4. Pipes (데이터 변환/검증)
   ↓
5. Controller (비즈니스 로직)
   ↓
6. Service (실제 작업 수행)
   ↓
7. Controller (응답 반환)
   ↓
8. Interceptors (after) - 응답 후 처리
   ↓
9. Filters (예외 발생 시)
   ↓
10. Client (클라이언트로 응답)
```

### 각 단계별 역할

#### 1. Middleware

- **목적**: 요청의 기본적인 전처리
- **예시**: CORS 설정, 요청 로깅, 요청 ID 생성

#### 2. Guards

- **목적**: 인증 및 인가 검사
- **예시**: JWT 토큰 검증, 역할 확인

#### 3. Interceptors (Before)

- **목적**: 요청 전 부가 기능
- **예시**: 요청 로깅, 캐시 확인

#### 4. Pipes

- **목적**: 데이터 변환 및 검증
- **예시**: 문자열을 숫자로 변환, DTO 유효성 검사

#### 5-6. Controller & Service

- **목적**: 비즈니스 로직 처리
- **예시**: 데이터베이스 조작, 비즈니스 규칙 적용

#### 7. Controller (응답)

- **목적**: 응답 데이터 준비
- **예시**: 데이터 포맷팅, 상태 코드 설정

#### 8. Interceptors (After)

- **목적**: 응답 후 부가 기능
- **예시**: 응답 로깅, 캐시 저장

#### 9. Filters

- **목적**: 예외 처리 (예외 발생 시에만)
- **예시**: 에러 로깅, 사용자 친화적 에러 메시지

---

## 🛠️ 실전 활용 예시

### 완전한 미들웨어 체인 예시

```ts
@Controller('posts')
@UseGuards(JwtAuthGuard) // 인증 가드
@UseInterceptors(LoggingInterceptor) // 로깅 인터셉터
@UseFilters(AllExceptionsFilter) // 예외 필터
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(RolesGuard) // 추가 인가 가드
  @Roles(Role.USER)
  @UseInterceptors(CacheInterceptor) // 캐싱 인터셉터
  @UsePipes(ValidationPipe) // 유효성 검사 파이프
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: Request,
  ): Promise<Post> {
    return this.postsService.create(createPostDto, req.user);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @UsePipes(ParseIntPipe)
  async getPost(@Param('id') id: number): Promise<Post> {
    return this.postsService.findOne(id);
  }
}
```

### 전역 설정 예시

```ts
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 미들웨어
  app.use(cors());
  app.use(helmet());

  // 전역 가드
  app.useGlobalGuards(new JwtAuthGuard());

  // 전역 인터셉터
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 전역 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 전역 필터
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}
```

---

## 📊 미들웨어 성능 고려사항

### 1. 실행 순서 최적화

```ts
// 비효율적인 순서
@UseGuards(ExpensiveGuard) // 무거운 가드
@UseInterceptors(SimpleInterceptor) // 가벼운 인터셉터

// 효율적인 순서
@UseInterceptors(SimpleInterceptor) // 가벼운 인터셉터 먼저
@UseGuards(ExpensiveGuard) // 무거운 가드 나중에
```

### 2. 조건부 실행

```ts
@Injectable()
export class ConditionalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // 특정 조건에서만 실행
    if (request.url.includes('/api/')) {
      return this.executeLogic(next);
    }

    return next.handle();
  }
}
```

### 3. 캐싱 전략

```ts
@Injectable()
export class SmartCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // GET 요청만 캐싱
    if (request.method === 'GET') {
      return this.cacheResponse(next, request);
    }

    return next.handle();
  }
}
```

---
