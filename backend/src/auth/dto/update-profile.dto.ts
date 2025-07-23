// src/auth/dto/update-profile.dto.ts
import { IsString, IsOptional, IsUrl, IsEmail, IsPhoneNumber, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  // REMOVED: fullName as it does not exist in the database schema.
  // @IsOptional()
  // @IsString()
  // @MaxLength(100)
  // fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50) // Adjust max length as per your design
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('IN', { message: 'Phone number must be a valid Indian number' })
  phoneNumber?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100) // Assuming displayName can be updated
  displayName?: string; // Added displayName if you want it to be updatable
}
