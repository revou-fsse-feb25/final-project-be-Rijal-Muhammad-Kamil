import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();
  return {
    user_id: user.user_id,
    role: user.role,
    status: user.status,
  };
});
