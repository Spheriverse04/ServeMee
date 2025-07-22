// backend/src/auth/dto/register-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { UserRole } from '../roles/roles.enum';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Firebase UID cannot be empty' })
  @IsString({ message: 'Firebase UID must be a string' })
  firebaseUid: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  // REMOVED: fullName as it does not exist in the database schema.
  // @IsOptional()
  // @IsString({ message: 'Full name must be a string' })
  // @MaxLength(255, { message: 'Full name cannot exceed 255 characters' })
  // fullName?: string;

  @IsOptional()
  @IsString({ message: 'Display name must be a string' })
  @MaxLength(100, { message: 'Display name cannot exceed 100 characters' })
  displayName?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phoneNumber?: string;

  @IsNotEmpty({ message: 'User role cannot be empty' })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role: UserRole;
}
