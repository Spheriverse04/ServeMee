// backend/src/service/dto/create-service.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, MaxLength, IsUUID, IsUrl } from 'class-validator'; // Added IsUrl
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  baseFare: number;

  @IsOptional()
  @IsUrl() // Add IsUrl validator if imageUrl is a URL
  @IsString() // Ensure it's a string
  imageUrl?: string | null; // FIX: Allow imageUrl to be null or undefined

  @IsUUID()
  @IsNotEmpty()
  serviceTypeId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
