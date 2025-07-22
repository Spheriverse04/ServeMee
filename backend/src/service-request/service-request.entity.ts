// backend/src/service-request/service-request.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ServiceType } from '../service-type/service-type.entity';
import { Point } from 'geojson'; // Import Point type from geojson
import { RatingReview } from '../rating-review/rating-review.entity';
import { ServiceProvider } from '../service-provider/service-provider.entity'; // ADD this import

export enum ServiceRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_type_id', type: 'uuid', nullable: false })
  serviceTypeId: string;

  // Correct this line: Ensure ServiceType has a 'serviceRequests' property (see next section)
  @ManyToOne(() => ServiceType, serviceType => serviceType.serviceRequests, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @Column({ name: 'consumer_id', type: 'uuid', nullable: false })
  @Index()
  consumerId: string;

  @ManyToOne(() => User, user => user.requestedServices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;

  @Column({ name: 'service_provider_id', type: 'uuid', nullable: true }) // Nullable due to SET NULL on delete
  @Index()
  serviceProviderId: string | null;

  @ManyToOne(() => ServiceProvider, serviceProvider => serviceProvider.serviceRequests, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: ServiceProvider | null; // Allow null for serviceProvider relationship

  @Column({
    type: 'enum',
    enum: ServiceRequestStatus,
    default: ServiceRequestStatus.PENDING,
    nullable: false,
  })
  status: ServiceRequestStatus;

  @Column({ name: 'requested_at_location', type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  @Index({ spatial: true })
  requestedAtLocation: Point; // Use Point type from geojson

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'scheduled_time', type: 'timestamp with time zone', nullable: true })
  scheduledTime: Date | null;

  @Column({ name: 'otp_code', type: 'varchar', length: 10, nullable: true }) // Store OTP
  otpCode: string | null; // Allow null after verification

  @Column({ name: 'total_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number | null;

  @Column({ name: 'accepted_at', type: 'timestamp with time zone', nullable: true })
  acceptedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamp with time zone', nullable: true })
  cancelledAt: Date | null;

  @OneToMany(() => RatingReview, ratingReview => ratingReview.serviceRequest)
  reviews: RatingReview[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}



