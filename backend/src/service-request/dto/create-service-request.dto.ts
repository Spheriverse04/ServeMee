// backend/src/service-request/dto/create-service-request.dto.ts
import { IsUUID, IsNotEmpty, IsString, IsOptional, IsObject, IsNumber, Min, Max } from 'class-validator';

export class CreateServiceRequestDto {
  @IsUUID()
  @IsNotEmpty()
  serviceTypeId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsString()
  @IsNotEmpty()
  serviceAddress: string;

  @IsOptional()
  @IsObject()
  requestDetails?: Record<string, any>;
}
