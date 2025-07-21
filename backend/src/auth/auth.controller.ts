import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { FirebaseAuthGuard } from './firebase-auth/firebase-auth.guard';
import { Request } from 'express';
import { User } from '../user/user.entity';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.authService.registerUser(registerUserDto);
    return {
      message: 'User registered successfully!',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || null,
        role: user.role,
      },
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request & { user: User }) {
    return {
      message: 'Authentication successful!',
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.displayName,
        role: req.user.role,
        firebaseUid: req.user.firebaseUid,
      },
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile') // CHANGED from @Post to @Get
  @HttpCode(HttpStatus.OK)
  // No @Body() needed for GET requests for fetching data
  getProfile(@Req() req: Request & { user: User }) {
    return {
      message: 'User profile fetched successfully!',
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.displayName,
        role: req.user.role,
        firebaseUid: req.user.firebaseUid,
      },
    };
  }
}
