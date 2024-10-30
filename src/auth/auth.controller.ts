import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from './guard/auth.guard';
import { Request } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  createJWT(@Body() createAuthDto: CreateAuthDto) {
    console.log('createAuthDto', createAuthDto);
    return this.authService.createJWT(createAuthDto);
  }

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
