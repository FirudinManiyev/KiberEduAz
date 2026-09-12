import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { StreakReminderService } from './streak-reminder.service';

@Module({
  // ScheduleModule.forRoot() is idempotent across modules (NestJS dedupes
  // global dynamic modules), so registering it again here is safe even
  // though ProfilesModule already does.
  imports: [ScheduleModule.forRoot()],
  controllers: [ProgressController],
  providers: [ProgressService, StreakReminderService],
})
export class ProgressModule {}
