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

  /// Returns the answer key, so it is restricted to the room's own author.
  @Get(':id/edit')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  findForAuthor(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.roomsService.findByIdForAuthor(user, id);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertRoomDto) {
    return this.roomsService.create(user, dto);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertRoomDto,
  ) {
    return this.roomsService.update(user, id, dto);
  }

  /// Only admins can grant public access to a room a teacher drafted.
  @Post(':id/publish')
  @Roles(UserRole.ADMIN)
  publish(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.setStatus(user, id, ContentStatus.PUBLISHED);
  }

  @Post(':id/unpublish')
  @Roles(UserRole.ADMIN)
  unpublish(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.setStatus(user, id, ContentStatus.DRAFT);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.remove(user, id);
  }

  @Post(':id/tasks')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  createTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertTaskDto,
  ) {
    return this.roomsService.upsertTask(user, id, dto);
  }

  @Patch(':id/tasks/:taskId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  updateTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpsertTaskDto,
  ) {
    return this.roomsService.upsertTask(user, id, dto, taskId);
  }

  @Delete(':id/tasks/:taskId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.roomsService.removeTask(user, id, taskId);
  }
}
