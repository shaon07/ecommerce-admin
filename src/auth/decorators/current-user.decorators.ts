import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from 'src/@types/types';

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest<RequestWithUser>();

  return user;
});
