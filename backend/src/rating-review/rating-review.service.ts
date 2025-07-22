// backend/src/rating-review/rating-review.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RatingReview } from './rating-review.entity';
import { ServiceRequest, ServiceRequestStatus } from '../service-request/service-request.entity';
import { User } from '../user/user.entity';
import { ServiceProvider } from '../service-provider/service-provider.entity';
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
    @InjectRepository(ServiceProvider)
    private serviceProviderRepository: Repository<ServiceProvider>,
  ) {}

  async create(createRatingReviewDto: CreateRatingReviewDto, consumerId: string): Promise<RatingReview> {
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id: createRatingReviewDto.serviceRequestId },
      relations: ['consumer', 'serviceProvider'],
    });

    if (!serviceRequest) {
      throw new NotFoundException(`Service request with ID "${createRatingReviewDto.serviceRequestId}" not found.`);
    }

    if (serviceRequest.consumer.id !== consumerId) {
      throw new ForbiddenException('You are not authorized to review this service request.');
    }

    if (serviceRequest.status !== ServiceRequestStatus.COMPLETED) {
      throw new BadRequestException('Only completed service requests can be reviewed.');
    }

    const existingReview = await this.ratingReviewRepository.findOne({
      where: { serviceRequestId: serviceRequest.id },
    });

    if (existingReview) {
      throw new ConflictException('A review for this service request already exists.');
    }

    if (!serviceRequest.serviceProviderId) {
        throw new InternalServerErrorException('Service provider not associated with this service request.');
    }

    const review = this.ratingReviewRepository.create({
      serviceRequest: serviceRequest,
      serviceRequestId: serviceRequest.id,
      consumer: serviceRequest.consumer,
      consumerId: consumerId,
      serviceProviderId: serviceRequest.serviceProviderId,
      rating: createRatingReviewDto.rating,
      reviewText: createRatingReviewDto.reviewText,
    });

    const savedReview = await this.ratingReviewRepository.save(review);

    await this.updateProviderRating(serviceRequest.serviceProviderId);

    return savedReview;
  }

  async update(id: string, updateRatingReviewDto: UpdateRatingReviewDto, consumerId: string): Promise<RatingReview> {
    const review = await this.ratingReviewRepository.findOne({
      where: { id },
      relations: ['consumer', 'serviceRequest'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found.`);
    }

    if (review.consumer.id !== consumerId) {
      throw new ForbiddenException('You are not authorized to update this review.');
    }

    Object.assign(review, updateRatingReviewDto);
    const updatedReview = await this.ratingReviewRepository.save(review);

    if (updateRatingReviewDto.rating !== undefined && updatedReview.serviceProviderId) {
        await this.updateProviderRating(updatedReview.serviceProviderId);
    }

    return updatedReview;
  }

  async findOne(id: string): Promise<RatingReview> {
    const review = await this.ratingReviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found.`);
    }
    return review;
  }

  async findAll(): Promise<RatingReview[]> {
    return this.ratingReviewRepository.find();
  }

  async remove(id: string, consumerId: string): Promise<void> {
    const review = await this.ratingReviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found.`);
    }

    if (review.consumerId !== consumerId) {
      throw new ForbiddenException('You are not authorized to delete this review.');
    }

    const serviceProviderId = review.serviceProviderId;

    await this.ratingReviewRepository.remove(review);

    if (serviceProviderId) {
        await this.updateProviderRating(serviceProviderId);
    }
  }

  /**
   * Finds reviews given by a specific consumer.
   * @param consumerId The ID of the consumer.
   * @returns An array of RatingReview entities.
   */
  // FIX: Renamed method
  async findReviewsByConsumer(consumerId: string): Promise<RatingReview[]> {
    return this.ratingReviewRepository.find({ where: { consumerId } });
  }

  /**
   * Finds reviews received by a specific service provider.
   * @param serviceProviderId The ID of the service provider.
   * @returns An array of RatingReview entities.
   */
  // FIX: Renamed method
  async findReviewsByProvider(serviceProviderId: string): Promise<RatingReview[]> {
    return this.ratingReviewRepository.find({ where: { serviceProviderId } });
  }

  /**
   * Updates the average rating and total ratings for a service provider.
   * @param serviceProviderId The ID of the service provider.
   */
  async updateProviderRating(serviceProviderId: string): Promise<void> {
    const result = await this.ratingReviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'totalRatings')
      .where('review.serviceProviderId = :serviceProviderId', { serviceProviderId })
      .andWhere('review.isVerified = :isVerified', { isVerified: true })
      .getRawOne();

    const averageRating = parseFloat(result.averageRating) || 0;
    const totalRatings = parseInt(result.totalRatings) || 0;

    await this.serviceProviderRepository.update(serviceProviderId, {
      averageRating: Math.round(averageRating * 10) / 10,
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

    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating]++;
      }
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratingDistribution,
    };
  }
}
