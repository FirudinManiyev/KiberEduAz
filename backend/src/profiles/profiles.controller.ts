import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ChangeRoleDto, UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.profilesService.me(user);
  }

  @Patch('me')
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(user, dto);
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
