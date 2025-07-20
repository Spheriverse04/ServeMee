// src/booking/dto/update-booking.dto.ts
import { IsOptional, IsDateString, IsNumber, IsString } from 'class-validator';
// import { ApiPropertyOptional } from '@nestjs/swagger'; // REMOVED THIS LINE

export class UpdateBookingDto {
  // @ApiPropertyOptional({ description: 'New start time for the booking.' }) // REMOVED THIS DECORATOR
  @IsOptional()
  @IsDateString()
  startTime?: string;

  // @ApiPropertyOptional({ description: 'New end time for the booking.' }) // REMOVED THIS DECORATOR
  @IsOptional()
  @IsDateString()
  endTime?: string;

  // @ApiPropertyOptional({ description: 'New agreed price for the booking.' }) // REMOVED THIS DECORATOR
  @IsOptional()
  @IsNumber()
  agreedPrice?: number;

  // @ApiPropertyOptional({ description: 'Optional notes for the booking.' }) // REMOVED THIS DECORATOR
  @IsOptional()
  @IsString()
  notes?: string;
}
