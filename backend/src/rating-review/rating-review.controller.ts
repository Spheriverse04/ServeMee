// backend/src/rating-review/rating-review.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { RatingReviewService } from './rating-review.service';
import { CreateRatingReviewDto } from './dto/create-rating-review.dto';
import { UpdateRatingReviewDto } from './dto/update-rating-review.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/roles.enum';
import { Public } from '../auth/public.decorator';
import { Request } from 'express';
import { User } from '../user/user.entity';

@Controller('rating-reviews')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class RatingReviewController {
  constructor(private readonly ratingReviewService: RatingReviewService) {}

  @Post()
  @Roles(UserRole.CONSUMER)
  create(
    @Body() createRatingReviewDto: CreateRatingReviewDto,
    @Req() req: Request & { user: User },
  ) {
    return this.ratingReviewService.create(createRatingReviewDto, req.user.id);
  }

  @Get('by-provider/:providerId')
  @Public()
  findByProvider(@Param('providerId') providerId: string) {
    return this.ratingReviewService.findByServiceProvider(providerId);
  }

  @Get('by-consumer')
  @Roles(UserRole.CONSUMER)
  findByConsumer(@Req() req: Request & { user: User }) {
    return this.ratingReviewService.findByConsumer(req.user.id);
  }

  @Get('stats/:providerId')
  @Public()
  getProviderStats(@Param('providerId') providerId: string) {
    return this.ratingReviewService.getProviderRatingStats(providerId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.ratingReviewService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.CONSUMER)
  update(
    @Param('id') id: string,
    @Body() updateRatingReviewDto: UpdateRatingReviewDto,
    @Req() req: Request & { user: User },
  ) {
    return this.ratingReviewService.update(id, updateRatingReviewDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.CONSUMER)
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.ratingReviewService.remove(id, req.user.id);
  }
}