// src/auth/dto/register-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { UserRole } from '../roles/roles.enum';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @MaxLength(255, { message: 'Full name cannot exceed 255 characters' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'Display name must be a string' })
  @MaxLength(100, { message: 'Display name cannot exceed 100 characters' })
  displayName?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phoneNumber?: string; // Add phone number

  @IsNotEmpty({ message: 'User role cannot be empty' })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role: UserRole; // 'consumer' or 'service_provider'
}
