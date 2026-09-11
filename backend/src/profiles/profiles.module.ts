import { Module } from '@nestjs/common';
import { AccountDeletionService } from './account-deletion.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, AccountDeletionService],
  exports: [ProfilesService, AccountDeletionService],
})
export class ProfilesModule {}
