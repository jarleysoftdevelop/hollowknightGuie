
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

import { FirebaseService } from '../../firebase/firebase.service.js';
import { ROLES_KEY, type UserRole } from '../decorators/roles.decorator.js';

type AuthenticatedRequest = Request & {
  user?: DecodedIdToken;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebase: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!user?.uid) {
      throw new UnauthorizedException(
        'Usuario no autenticado',
      );
    }

    const profile = await this.firebase.db
      .collection('users')
      .doc(user.uid)
      .get();

    if (!profile.exists) {
      throw new ForbiddenException(
        'El perfil del usuario no existe',
      );
    }

    const role = profile.data()?.role as UserRole | undefined;

    if (!role || !requiredRoles.includes(role)) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta operación',
      );
    }

    return true;
  }
}
