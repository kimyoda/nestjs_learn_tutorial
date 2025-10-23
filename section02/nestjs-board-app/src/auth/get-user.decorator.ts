import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from './user.entity';

export const GetUser = createParamDecorator(
  // 'data' unknow명시
  (data: unknown, ctx: ExecutionContext): User => {
    // req 타입 { user: User }로 명시
    const req: { user: User } = ctx.switchToHttp().getRequest();

    return req.user;
  },
);
