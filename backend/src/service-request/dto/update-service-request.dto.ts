// backend/src/service-request/dto/update-service-request.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceRequestDto } from './create-service-request.dto';
import { IsOptional, IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { ServiceRequestStatus } from '../service-request.entity'; // Removed PaymentStatus

export class UpdateServiceRequestDto extends PartialType(CreateServiceRequestDto) {
  @IsOptional()
  @IsEnum(ServiceRequestStatus)
  status?: ServiceRequestStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCost?: number;

  // Removed paymentStatus and paymentMethod as per migration
  // @IsOptional()
  // @IsEnum(PaymentStatus)
  // paymentStatus?: PaymentStatus;

  // @IsOptional()
  // @IsString()
  // paymentMethod?: string;
}
