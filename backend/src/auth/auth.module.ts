// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseService } from '../config/firebase/firebase.service'; // Import FirebaseService correctly
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity'; // Import your User entity

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Make the User entity available for this module
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseService], // Make FirebaseService available to AuthService
  exports: [AuthService, FirebaseService], // Export AuthService if other modules need to use it (e.g., to validate tokens)
})
export class AuthModule {}
