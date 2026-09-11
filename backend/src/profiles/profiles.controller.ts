import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  ChangeRoleDto,
  RequestTeacherDto,
  UpdateProfileDto,
} from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.profilesService.me(user);
  }

  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Patch('me')
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(user, dto);
  }

  /// Any authenticated student can apply to become a teacher. Access stays
  /// locked until an admin approves the account.
  /// Escalation request: a handful a day is plenty, and a flood of them is
  /// either abuse or an attempt to bury a real application in an admin queue.
  @Throttle({ default: { ttl: 86_400_000, limit: 5 } })
  @Post('me/request-teacher')
  requestTeacher(@CurrentUser() user: AuthenticatedUser, @Body() dto: RequestTeacherDto) {
    return this.profilesService.requestTeacher(user, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  list() {
    return this.profilesService.list();
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  changeRole(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ChangeRoleDto) {
    return this.profilesService.changeRole(id, dto.role);
  }
}
