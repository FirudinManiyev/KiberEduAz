import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ContentStatus, UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/auth.types';
import { RoomsService } from './rooms.service';
import { RoomQueryDto, UpsertRoomDto, UpsertTaskDto } from './dto/content.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: RoomQueryDto) {
    return this.roomsService.list(user, query);
  }

  @Get(':slug')
  findBySlug(@CurrentUser() user: AuthenticatedUser, @Param('slug') slug: string) {
    return this.roomsService.findBySlug(user, slug);
  }

  /// Returns the answer key, so it is restricted to content authors.
  @Get(':id/edit')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  findForAuthor(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.findByIdForAuthor(id);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertRoomDto) {
    return this.roomsService.create(user, dto);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertRoomDto) {
    return this.roomsService.update(id, dto);
  }

  @Post(':id/publish')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.setStatus(id, ContentStatus.PUBLISHED);
  }

  @Post(':id/unpublish')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.setStatus(id, ContentStatus.DRAFT);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.remove(id);
  }

  @Post(':id/tasks')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  createTask(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertTaskDto) {
    return this.roomsService.upsertTask(id, dto);
  }

  @Patch(':id/tasks/:taskId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpsertTaskDto,
  ) {
    return this.roomsService.upsertTask(id, dto, taskId);
  }

  @Delete(':id/tasks/:taskId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.roomsService.removeTask(taskId);
  }
}
