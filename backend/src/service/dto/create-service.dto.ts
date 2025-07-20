// src/service/dto/create-service.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer'; // Needed for @Type() when converting string to number

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0) // Price cannot be negative
  @Type(() => Number) // Ensure price is treated as a number even if from string input (e.g., JSON body)
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // Default to true, but allow provider to set if they want
}
