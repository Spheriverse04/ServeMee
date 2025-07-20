// src/booking/dto/create-booking.dto.ts
import { IsDateString, IsNumber, IsUUID, IsEnum, Min, IsNotEmpty } from 'class-validator';
import { BookingStatus } from '../booking.entity';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsDateString()
  startTime: string; // ISO 8601 string for easy transfer (e.g., '2025-07-20T10:00:00Z')

  @IsNotEmpty()
  @IsDateString()
  endTime: string; // ISO 8601 string

  @IsNotEmpty()
  @IsNumber()
  @Min(0) // Price should not be negative
  agreedPrice: number;

  @IsNotEmpty()
  @IsUUID()
  serviceId: string; // The ID of the service being booked

  // Note: consumerId will be extracted from the authenticated user's token, not provided by the client.
  // status will default to PENDING on creation, so it's not needed in Create DTO.
}
