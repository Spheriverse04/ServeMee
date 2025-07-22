// src/rating-review/rating-review.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RatingReviewService } from './rating-review.service';
import { CreateRatingReviewDto } from './dto/create-rating-review.dto';
import { UpdateRatingReviewDto } from './dto/update-rating-review.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/roles.enum';
import { User } from '../user/user.entity';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('ratings-reviews')
@ApiBearerAuth()
@Controller('ratings-reviews')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class RatingReviewController {
  constructor(private readonly ratingReviewService: RatingReviewService) {}

  @Post()
  @Roles(UserRole.CONSUMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'The review has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Service Request not found.' })
  @ApiBody({ type: CreateRatingReviewDto })
  async create(
    @Body() createRatingReviewDto: CreateRatingReviewDto,
    @Req() req: Request & { user: User },
  ) {
    const consumerId = req.user.id;
    const review = await this.ratingReviewService.create(createRatingReviewDto, consumerId);
    return {
      message: 'Review created successfully!',
      review,
    };
  }

  @Get('provider/:providerId')
  @Roles(UserRole.SERVICE_PROVIDER, UserRole.CONSUMER) // Both can view provider reviews
  @ApiResponse({ status: 200, description: 'Reviews by service provider fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Service provider not found.' })
  async findByServiceProvider(@Param('providerId') providerId: string) {
    // FIX: Renamed method in service
    return this.ratingReviewService.findReviewsByProvider(providerId);
  }

  @Get('consumer/my-reviews')
  @Roles(UserRole.CONSUMER)
  @ApiResponse({ status: 200, description: 'Reviews given by current consumer fetched successfully.' })
  async findMyReviews(@Req() req: Request & { user: User }) {
    // FIX: Renamed method in service
    return this.ratingReviewService.findReviewsByConsumer(req.user.id);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Review fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async findOne(@Param('id') id: string) {
    const review = await this.ratingReviewService.findOne(id);
    if (!review) {
      throw new NotFoundException('Review not found.');
    }
    return {
      message: 'Review fetched successfully!',
      review,
    };
  }

  @Patch(':id')
  @Roles(UserRole.CONSUMER)
  @ApiResponse({ status: 200, description: 'The review has been successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @ApiBody({ type: UpdateRatingReviewDto })
  async update(
    @Param('id') id: string,
    @Body() updateRatingReviewDto: UpdateRatingReviewDto,
    @Req() req: Request & { user: User },
  ) {
    const consumerId = req.user.id;
    const updatedReview = await this.ratingReviewService.update(id, updateRatingReviewDto, consumerId);
    return {
      message: 'Review updated successfully!',
      review: updatedReview,
    };
  }

  @Delete(':id')
  @Roles(UserRole.CONSUMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'The review has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
    const consumerId = req.user.id;
    await this.ratingReviewService.remove(id, consumerId);
  }
}
