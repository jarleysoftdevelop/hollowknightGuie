
import { Module } from '@nestjs/common';
import { CharmsController } from './charms.controller.js';
import { CharmsService } from './charms.service.js';

@Module({
  controllers: [CharmsController],
  providers: [CharmsService],
})
export class CharmsModule {}
