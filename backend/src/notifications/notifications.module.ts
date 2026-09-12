import { Global, Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

/// Global for the same reason AuditModule is: notifying somebody is a side
/// effect of actions that live all over the app, and threading the import
/// through every module that performs one adds noise without adding safety.
@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
