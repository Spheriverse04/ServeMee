// src/auth/dto/update-profile.dto.ts
import { IsString, IsOptional, IsUrl, IsEmail, IsPhoneNumber, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100) // Adjust max length as per your design
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50) // Adjust max length as per your design
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber() // REMOVED 'ZZ' - This will now validate any phone number format generically
  phoneNumber?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;
}
