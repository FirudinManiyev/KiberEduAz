import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AccountDeletionService } from './account-deletion.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  // ScheduleModule drives the nightly purge in AccountDeletionService.
  imports: [ScheduleModule.forRoot()],
  controllers: [ProfilesController],
  providers: [ProfilesService, AccountDeletionService],
  exports: [ProfilesService, AccountDeletionService],
})
export class ProfilesModule {}
