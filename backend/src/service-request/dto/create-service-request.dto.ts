// backend/src/service-request/dto/create-service-request.dto.ts
import { IsUUID, IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateServiceRequestDto {
  @IsUUID()
  @IsNotEmpty()
  serviceTypeId: string;

  // Removed latitude and longitude

  @IsString()
  @IsNotEmpty()
  serviceAddress: string;

  @IsOptional()
  @IsObject()
  requestDetails?: Record<string, any>;
}
