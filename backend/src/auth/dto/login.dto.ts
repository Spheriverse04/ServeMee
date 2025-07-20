// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()

  idToken: string;

  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6) // Firebase requires a minimum of 6 characters for password
  password: string;

  // If you later implement phone number login, you can add:
  // @IsOptional()
  // @IsPhoneNumber('ZZ') // 'ZZ' for any country, or specific code like 'IN'
  // phoneNumber?: string;
}
