import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
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

  @Post('questions/:questionId/answer')
  submitAnswer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.progressService.submitAnswer(user, questionId, dto);
  }
}
