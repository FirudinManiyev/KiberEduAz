import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ClassesService } from './classes.service';
import { AddStudentByEmailDto, CreateClassDto } from './dto/classes.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.classesService.listForUser(user);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClassDto) {
    return this.classesService.create(user, dto);
  }

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  detail(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.detail(user, id);
  }

  @Post(':id/members')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddStudentByEmailDto,
  ) {
    return this.classesService.addStudentByEmail(user, id, dto);
  }

  @Delete(':id/members/:profileId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ) {
    return this.classesService.removeStudent(user, id, profileId);
  }
}
