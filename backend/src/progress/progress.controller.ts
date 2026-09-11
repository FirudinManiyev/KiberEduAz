import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/auth.types';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('summary')
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.summary(user);
  }

  @Get('rooms')
  myRooms(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.myRooms(user);
  }

  /// Tighter than the global 120/min: short-answer questions are graded by
  /// exact match, so the global budget alone leaves room to brute-force a
  /// dictionary answer.
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Post('questions/:questionId/answer')
  submitAnswer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.progressService.submitAnswer(user, questionId, dto);
  }

  @Post('tasks/:taskId/complete')
  completeTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.progressService.completeTask(user, taskId);
  }
}
