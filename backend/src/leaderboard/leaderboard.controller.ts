import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators';
import type { AuthenticatedUser } from '../auth/auth.types';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /// Every read scans the whole scope and ranks it in memory, so it is the
  /// cheapest way to make the API do real work.
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Get()
  forCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.leaderboardService.forCurrentUser(user, Math.min(Math.max(limit, 1), 50));
  }
}
