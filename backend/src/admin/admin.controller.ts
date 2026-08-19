import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
