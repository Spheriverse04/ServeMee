// backend/src/service-request/dto/accept-service-request.dto.ts
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class AcceptServiceRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otpCode: string;
}