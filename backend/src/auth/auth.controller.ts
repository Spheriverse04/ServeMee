// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth/firebase-auth.guard';
import { RolesGuard } from './roles/roles.guard';
import { Roles } from './roles/roles.decorator';
import { UserRole } from './roles/roles.enum';
import { Request } from 'express';
import { User } from '../user/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { LoginDto } from './dto/login.dto'; // <--- IMPORT LOGIN DTO HERE

// DTO for initial registration after phone verification (Keep this)
class RegisterAfterPhoneVerificationDto {
  phoneNumber: string;
  firebaseUid: string;
  fullName: string;
  role: string; // 'consumer' or 'service_provider'
  username?: string;
  email?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // No @UseGuards here! This endpoint takes the raw ID token from the client.
  async login(@Body() loginDto: LoginDto) { // Use LoginDto here
    // The idToken comes from the client after they authenticate with Firebase directly
    const result = await this.authService.login(loginDto.idToken);
    return {
      message: 'Login successful!',
      accessToken: result.accessToken, // This is the Firebase ID Token
      user: result.user // Your local DB user record
    };
  }


  @Post('register-after-phone')
  @HttpCode(HttpStatus.CREATED)
  async registerAfterPhoneVerification(
    @Body() registerDto: RegisterAfterPhoneVerificationDto,
  ) {
    return this.authService.registerUserAfterPhoneVerification(
      registerDto.phoneNumber,
      registerDto.firebaseUid,
      registerDto.fullName,
      registerDto.role,
      registerDto.username,
      registerDto.email,
    );
  }

  @Get('test-role-check')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(UserRole.CONSUMER, UserRole.SERVICE_PROVIDER)
testRoleCheck(@Req() req: Request & { user: User }) {
    return {
        message: `Role check successful! Your role is: ${req.user.role}`,
        userId: req.user.id
    };
}
  
  @Get('profile')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  getProfile(@Req() req: Request & { user: User; firebaseUser: any }) {
    const user = req.user;
    const firebaseUid = req.firebaseUser.uid;

    return {
      message: 'Successfully accessed protected profile!',
      user: user,
      firebaseUid: firebaseUid,
    };
  }

  @Patch('profile')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  async updateProfile(
    @Req() req: Request & { user: User; firebaseUser: any },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.id;
    const updatedUser = await this.authService.updateUserProfile(userId, updateProfileDto);

    return {
      message: 'Profile updated successfully!',
      user: updatedUser,
    };
  }


  @Get('service-provider-dashboard')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.SERVICE_PROVIDER)
  getServiceProviderDashboard(@Req() req: Request & { user: User }) {
    return {
      message: 'Welcome to the Service Provider Dashboard!',
      user: req.user,
    };
  }

  @Get('consumer-dashboard')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.CONSUMER)
  getConsumerDashboard(@Req() req: Request & { user: User }) {
    return {
      message: 'Welcome to the Consumer Dashboard!',
      user: req.user,
    };
  }
}
