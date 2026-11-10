
import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service.js';
import { FirebaseService } from './firebase/firebase.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebase: FirebaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Endpoint temporal para probar Firebase
  @Get('firebase-test')
  async testFirebase() {
    await this.firebase.db
      .collection('system')
      .doc('connection')
      .set({
        status: 'connected',
        updatedAt: new Date(),
      });

    return {
      success: true,
      message: 'Firebase conectado correctamente',
    };
  }
}
