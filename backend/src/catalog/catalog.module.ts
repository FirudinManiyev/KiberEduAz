import { Module } from '@nestjs/common';
import { ModulesController, PathsController } from './paths.controller';
import { PathsService } from './paths.service';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  controllers: [PathsController, ModulesController, RoomsController],
  providers: [PathsService, RoomsService],
  exports: [RoomsService],
})
export class CatalogModule {}
