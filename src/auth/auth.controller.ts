import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { LocalGuard } from './guards/local.guard';
import { JwtGuard } from './guards/jwt.guard';

import { Request } from 'express';
@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(LocalGuard)
  login(@Req() request: Request) {
    return request.user;
  }

  @Get('status')
  @UseGuards(JwtGuard)
  status(@Req() request: Request) {
    return request.user;
  }
}
