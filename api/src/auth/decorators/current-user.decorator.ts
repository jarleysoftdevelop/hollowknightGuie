
import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

type AuthenticatedRequest = Request & {
  user: DecodedIdToken;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    return request.user;
  },
);
