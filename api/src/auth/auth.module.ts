
import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase/firebase.module.js';

import { AuthController } from './auth.controller.js';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard.js';

@Module({
  imports: [FirebaseModule],
  controllers: [AuthController],
  providers: [FirebaseAuthGuard],
  exports: [FirebaseAuthGuard],
})
export class AuthModule {}
