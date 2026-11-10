
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

import { FirebaseService } from '../../firebase/firebase.service.js';

type AuthenticatedRequest = Request & {
  user?: DecodedIdToken;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebase: FirebaseService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const authorization =
      request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Token de autenticación requerido',
      );
    }

    const token = authorization.substring(7);

    try {
      const decodedToken =
        await this.firebase.auth.verifyIdToken(token);

      request.user = decodedToken;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Token inválido o expirado',
      );
    }
  }
}
