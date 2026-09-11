import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators';
import { AccountDeletionService } from '../profiles/account-deletion.service';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly accountDeletion: AccountDeletionService,
  ) {}

  @Get('stats')
  stats() {
    return this.adminService.stats();
  }

  @Get('teachers/pending')
  pendingTeachers() {
    return this.adminService.pendingTeachers();
  }

  @Post('teachers/:id/approve')
  approveTeacher(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.approveTeacher(id);
  }

  @Post('teachers/:id/reject')
  rejectTeacher(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.rejectTeacher(id);
  }

  @Get('rooms/pending')
  pendingRooms() {
    return this.adminService.pendingRooms();
  }

  @Post('rooms/:id/approve')
  approveRoom(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.approveRoom(id);
  }

  @Post('rooms/:id/reject')
  rejectRoom(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.rejectRoom(id);
  }

  /// Undo a deletion request inside the restore window. It has to be an admin
  /// action: a marked account cannot sign in to undo it itself.
  @Post('profiles/:id/restore')
  restoreProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountDeletion.restore(id);
  }

  /// Hard-deletes every account whose restore window has expired. Idempotent
  /// and safe to call on a schedule; see docs/account-deletion.md for the
  /// scheduling options.
  @Post('profiles/purge-expired')
  purgeExpiredProfiles() {
    return this.accountDeletion.purgeExpired();
  }
}
