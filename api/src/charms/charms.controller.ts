
import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';

import { CharmsService } from './charms.service.js';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('games/hollow-knight/charms')
export class CharmsController {
    constructor(
        private readonly charmsService: CharmsService,
    ) { }

    @Get()
    findAll() {
        return this.charmsService.findAll();
    }

    @Get('progress')
    @UseGuards(FirebaseAuthGuard)
    getProgress(
        @CurrentUser() user: { uid: string },
    ) {
        return this.charmsService.getProgress(user.uid);
    }

    @Patch(':charmId/progress')
    @UseGuards(FirebaseAuthGuard)
    updateProgress(
        @CurrentUser() user: { uid: string },
        @Param('charmId') charmId: string,
        @Body() body: { obtained: boolean },
    ) {
        if (typeof body.obtained !== 'boolean') {
            throw new BadRequestException(
                'El campo obtained debe ser booleano',
            );
        }

        return this.charmsService.updateProgress(
            user.uid,
            charmId,
            body.obtained,
        );
    }
}
