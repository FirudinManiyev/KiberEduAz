import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { CurrentUser, Roles } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AccountDeletionService } from '../profiles/account-deletion.service';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly accountDeletion: AccountDeletionService,
    private readonly audit: AuditService,
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
  approveTeacher(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.approveTeacher(user, id);
  }

  @Post('teachers/:id/reject')
  rejectTeacher(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.rejectTeacher(user, id);
  }

  @Get('rooms/pending')
  pendingRooms() {
    return this.adminService.pendingRooms();
  }

  @Post('rooms/:id/approve')
  approveRoom(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.approveRoom(user, id);
  }

  @Post('rooms/:id/reject')
  rejectRoom(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.rejectRoom(user, id);
  }

  /// Undo a deletion request inside the restore window. It has to be an admin
  /// action: a marked account cannot sign in to undo it itself.
  @Post('profiles/:id/restore')
  restoreProfile(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.accountDeletion.restore(id, user.id);
  }

  /// Hard-deletes every account whose restore window has expired. Idempotent
  /// and safe to call on a schedule; see docs/account-deletion.md for the
  /// scheduling options.
  @Post('profiles/purge-expired')
  purgeExpiredProfiles(@CurrentUser() user: AuthenticatedUser) {
    return this.accountDeletion.purgeExpired(user.id);
  }

  /// Who did what to whom. Newest first, keyset-paged; see docs/audit-log.md.
  @Get('audit')
  auditLog(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.audit.list(limit, cursor);
  }
}
