
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import type { DecodedIdToken } from 'firebase-admin/auth';

import { FirebaseAuthGuard } from './guards/firebase-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  getProfile(
    @CurrentUser() user: DecodedIdToken,
  ) {
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.email_verified,
      },
    };
  }
}
