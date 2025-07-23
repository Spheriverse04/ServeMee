import {
  Controller,
  Patch,
  Post,
  Req,
  Body,
  HttpCode,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FirebaseAuthGuard } from './firebase-auth/firebase-auth.guard';
import { Request } from 'express';
import { User } from '../user/user.entity';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@Get('profile')
@UseGuards(FirebaseAuthGuard)
async getProfile(@Req() req: Request & { user: User }) {
  console.log('🔐 Request received at /auth/profile');
  console.log('📌 Full request.user object:', req.user);

  if (!req.user?.firebaseUid) {
    throw new HttpException('Invalid user object on request', HttpStatus.UNAUTHORIZED);
  }

  try {
    const user = await this.authService.getProfile(req.user.firebaseUid);
    return {
      message: 'User profile fetched successfully!',
      user,
    };
  } catch (error) {
    console.error('❌ Failed to get user profile:', error);
    throw new HttpException('Failed to fetch profile', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}



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

@Patch('update-profile')
@UseGuards(FirebaseAuthGuard)
async updateProfile(@Req() req: Request & { user: User }, @Body() dto: UpdateProfileDto) {
  try {
    const firebaseUid = req.user.firebaseUid;
    const updatedUser = await this.authService.updateProfile(firebaseUid, dto);
    return { user: updatedUser };
  } catch (err) {
    console.error('Failed to update profile:', err);
    throw new HttpException('Failed to update profile', HttpStatus.BAD_REQUEST);
  }
}

}

