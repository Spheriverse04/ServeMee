// backend/src/rating-review/dto/create-rating-review.dto.ts
import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateRatingReviewDto {
  @IsUUID()
  @IsNotEmpty()
  serviceRequestId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  reviewText?: string;
}