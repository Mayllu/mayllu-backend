import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard() {
    try {
      const leaderboard = await this.leaderboardService.getLeaderboard();
      if (!leaderboard.length) {
        throw new HttpException('No data found', HttpStatus.NOT_FOUND);
      }
      return leaderboard;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
