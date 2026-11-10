
import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';

import type { DecodedIdToken } from 'firebase-admin/auth';

import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UsersService } from './users.service.js';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post('profile')
  async createProfile(
    @CurrentUser() user: DecodedIdToken,
    @Body('username') username: string,
  ) {
    if (
      typeof username !== 'string' ||
      username.trim().length < 3 ||
      username.trim().length > 30
    ) {
      throw new BadRequestException(
        'El nombre debe tener entre 3 y 30 caracteres',
      );
    }

    if (!user.email) {
      throw new UnauthorizedException(
        'El usuario no tiene un correo verificado en su token',
      );
    }

    return this.usersService.createProfile(
      user.uid,
      user.email,
      username,
    );
  }

  @Get('profile')
  async getProfile(
    @CurrentUser() user: DecodedIdToken,
  ) {
    const profile = await this.usersService.getProfile(
      user.uid,
    );

    if (!profile) {
      throw new BadRequestException(
        'El perfil del jugador no existe',
      );
    }

    return {
      success: true,
      profile,
    };
  }
}
