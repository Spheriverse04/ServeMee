// backend/src/rating-review/rating-review.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingReview } from './rating-review.entity';
import { RatingReviewService } from './rating-review.service';
import { RatingReviewController } from './rating-review.controller';
import { ServiceRequest } from '../service-request/service-request.entity';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RatingReview, ServiceRequest, User]),
    AuthModule,
  ],
  controllers: [RatingReviewController],
  providers: [RatingReviewService],
  exports: [RatingReviewService],
})
export class RatingReviewModule {}