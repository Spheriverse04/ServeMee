// backend/src/service-type/dto/create-service-type.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum, IsUUID, IsObject, MaxLength, Min } from 'class-validator';
import { BaseFareType } from '../service-type.entity';

export class CreateServiceTypeDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(BaseFareType)
  @IsNotEmpty()
  baseFareType: BaseFareType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  additionalAttributes?: Record<string, any>;
}
