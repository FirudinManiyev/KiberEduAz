import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
