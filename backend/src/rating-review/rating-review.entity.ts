// backend/src/rating-review/rating-review.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Check } from 'typeorm';
import { ServiceRequest } from '../service-request/service-request.entity';
import { User } from '../user/user.entity';
import { ServiceProvider } from '../service-provider/service-provider.entity'; // ADD this import

@Entity('ratings_reviews')
@Check(`rating >= 1 AND rating <= 5`)
export class RatingReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_request_id', type: 'uuid', unique: true, nullable: false })
  serviceRequestId: string;

  // Correct this line: Ensure ServiceRequest has a 'reviews' property (see next section)
  @ManyToOne(() => ServiceRequest, request => request.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_request_id' })
  serviceRequest: ServiceRequest;

  @Column({ name: 'consumer_id', type: 'uuid', nullable: false })
  consumerId: string;

  // Correct this line: Use 'givenReviews' as defined in user.entity.ts
  @ManyToOne(() => User, user => user.givenReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;

  @Column({ name: 'service_provider_id', type: 'uuid', nullable: false })
  serviceProviderId: string;

  // Correct this line: Use ServiceProvider entity and its 'receivedReviews' property
  @ManyToOne(() => ServiceProvider, serviceProvider => serviceProvider.receivedReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: ServiceProvider;

  @Column({ type: 'integer', nullable: false })
  rating: number; // 1-5 stars

  @Column({ name: 'review_text', type: 'text', nullable: true })
  reviewText: string;

  @Column({ name: 'is_verified', type: 'boolean', default: true, nullable: false })
  isVerified: boolean; // For future moderation

  @Column({ name: 'helpful_count', type: 'integer', default: 0, nullable: false })
  helpfulCount: number; // For future "helpful" voting feature

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
