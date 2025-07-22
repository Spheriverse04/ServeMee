// backend/src/service/dto/create-service.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, MaxLength, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255) // Increased max length to match entity definition if needed, or adjust entity.
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  baseFare: number; // Renamed from 'price' to 'baseFare'

  @IsOptional()
  @IsString()
  imageUrl?: string; // Added imageUrl as per Service entity

  @IsUUID() // Validate as UUID
  @IsNotEmpty() // Must not be empty
  serviceTypeId: string; // Added this required field

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
