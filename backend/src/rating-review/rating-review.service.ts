// backend/src/rating-review/rating-review.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RatingReview } from './rating-review.entity';
import { ServiceRequest, ServiceRequestStatus } from '../service-request/service-request.entity';
import { User } from '../user/user.entity';
import { CreateRatingReviewDto } from './dto/create-rating-review.dto';
import { UpdateRatingReviewDto } from './dto/update-rating-review.dto';

@Injectable()
export class RatingReviewService {
  constructor(
    @InjectRepository(RatingReview)
    private ratingReviewRepository: Repository<RatingReview>,
    @InjectRepository(ServiceRequest)
    private serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createRatingReviewDto: CreateRatingReviewDto, consumerId: string): Promise<RatingReview> {
    // Verify the service request exists and is completed
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id: createRatingReviewDto.serviceRequestId },
      relations: ['consumer', 'serviceProvider'],
    });

    if (!serviceRequest) {
      throw new NotFoundException(`Service request with ID "${createRatingReviewDto.serviceRequestId}" not found.`);
    }

    // Verify the consumer is the one who made the request
    if (serviceRequest.consumerId !== consumerId) {
      throw new ForbiddenException('You can only review services you have requested.');
    }

    // Verify the service request is completed
    if (serviceRequest.status !== ServiceRequestStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed services.');
    }

    // Check if a review already exists for this service request
    const existingReview = await this.ratingReviewRepository.findOne({
      where: { serviceRequestId: createRatingReviewDto.serviceRequestId },
    });

    if (existingReview) {
      throw new BadRequestException('A review already exists for this service request.');
    }

    // Create the review
    const review = this.ratingReviewRepository.create({
      ...createRatingReviewDto,
      consumerId,
      serviceProviderId: serviceRequest.serviceProviderId,
    });

    const savedReview = await this.ratingReviewRepository.save(review);

    // Update service provider's average rating
    await this.updateProviderRating(serviceRequest.serviceProviderId);

    return savedReview;
  }

  async findByServiceProvider(serviceProviderId: string): Promise<RatingReview[]> {
    return this.ratingReviewRepository.find({
      where: { serviceProviderId, isVerified: true },
      relations: ['consumer', 'serviceRequest'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByConsumer(consumerId: string): Promise<RatingReview[]> {
    return this.ratingReviewRepository.find({
      where: { consumerId },
      relations: ['serviceProvider', 'serviceRequest'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<RatingReview> {
    const review = await this.ratingReviewRepository.findOne({
      where: { id },
      relations: ['consumer', 'serviceProvider', 'serviceRequest'],
    });

    if (!review) {
      throw new NotFoundException(`Rating review with ID "${id}" not found.`);
    }

    return review;
  }

  async update(id: string, updateRatingReviewDto: UpdateRatingReviewDto, consumerId: string): Promise<RatingReview> {
    const review = await this.ratingReviewRepository.findOne({
      where: { id, consumerId },
    });

    if (!review) {
      throw new NotFoundException(`Rating review with ID "${id}" not found or you don't have permission to update it.`);
    }

    Object.assign(review, updateRatingReviewDto);
    const updatedReview = await this.ratingReviewRepository.save(review);

    // Update service provider's average rating if rating changed
    if (updateRatingReviewDto.rating !== undefined) {
      await this.updateProviderRating(review.serviceProviderId);
    }

    return updatedReview;
  }

  async remove(id: string, consumerId: string): Promise<void> {
    const review = await this.ratingReviewRepository.findOne({
      where: { id, consumerId },
    });

    if (!review) {
      throw new NotFoundException(`Rating review with ID "${id}" not found or you don't have permission to delete it.`);
    }

    const serviceProviderId = review.serviceProviderId;
    await this.ratingReviewRepository.remove(review);

    // Update service provider's average rating
    await this.updateProviderRating(serviceProviderId);
  }

  private async updateProviderRating(serviceProviderId: string): Promise<void> {
    const result = await this.ratingReviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'totalRatings')
      .where('review.serviceProviderId = :serviceProviderId', { serviceProviderId })
      .andWhere('review.isVerified = :isVerified', { isVerified: true })
      .getRawOne();

    const averageRating = parseFloat(result.averageRating) || 0;
    const totalRatings = parseInt(result.totalRatings) || 0;

    await this.userRepository.update(serviceProviderId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings,
    });
  }

  async getProviderRatingStats(serviceProviderId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.ratingReviewRepository.find({
      where: { serviceProviderId, isVerified: true },
      select: ['rating'],
    });

    const totalRatings = reviews.length;
    const averageRating = totalRatings > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings 
      : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratingDistribution,
    };
  }
}