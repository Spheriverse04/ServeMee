// backend/src/rating-review/dto/update-rating-review.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingReviewDto } from './create-rating-review.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateRatingReviewDto extends PartialType(CreateRatingReviewDto) {
  @IsOptional()
  @IsUUID()
  serviceRequestId?: string; // Make optional for updates
}