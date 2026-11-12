
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import {
  MapsService,
  type MapMarker,
} from './maps.service.js';

@Controller('maps')
@UseGuards(FirebaseAuthGuard)
export class MapsController {
  constructor(
    private readonly mapsService: MapsService,
  ) {}

  @Get(':gameId/markers')
  findAll(@Param('gameId') gameId: string) {
    return this.mapsService.findAll(gameId);
  }

  @Post(':gameId/markers')
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(
    @Param('gameId') gameId: string,
    @Body() marker: MapMarker,
  ) {
    return this.mapsService.create(gameId, marker);
  }

  @Patch(':gameId/markers/:markerId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('gameId') gameId: string,
    @Param('markerId') markerId: string,
    @Body() data: Partial<MapMarker>,
  ) {
    return this.mapsService.update(gameId, markerId, data);
  }

  @Delete(':gameId/markers/:markerId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(
    @Param('gameId') gameId: string,
    @Param('markerId') markerId: string,
  ) {
    return this.mapsService.remove(gameId, markerId);
  }

  
  @Post(':gameId/markers/seed')
  @UseGuards(RolesGuard)
  @Roles('admin')
  seedInitialMarkers(
    @Param('gameId') gameId: string,
  ) {
    return this.mapsService.seedInitialMarkers(gameId);
  }
  
}
