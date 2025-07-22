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
import { Locality } from '../locality/locality.entity';
import { RatingReview } from '../rating-review/rating-review.entity';
import { ServiceProvider } from '../service-provider/service-provider.entity';

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

  @ManyToOne(() => ServiceType, serviceType => serviceType.serviceRequests, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @Column({ name: 'consumer_id', type: 'uuid', nullable: false })
  @Index()
  consumerId: string;

  @ManyToOne(() => User, user => user.requestedServices, { onDelete: 'RESTRICT' }) // <--- UPDATED THIS LINE
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;

  @Column({ name: 'service_provider_id', type: 'uuid', nullable: true })
  @Index()
  serviceProviderId: string | null;

  @ManyToOne(() => ServiceProvider, serviceProvider => serviceProvider.serviceRequests, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: ServiceProvider | null;

  @Column({ type: 'enum', enum: ServiceRequestStatus, default: ServiceRequestStatus.PENDING, nullable: false })
  status: ServiceRequestStatus;

  @Column({ name: 'locality_id', type: 'uuid', nullable: true })
  @Index()
  localityId: string | null;

  @ManyToOne(() => Locality, locality => locality.serviceRequests, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'locality_id' })
  locality: Locality | null;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'scheduled_time', type: 'timestamp with time zone', nullable: true })
  scheduledTime: Date | null;

  @Column({ name: 'otp_code', type: 'varchar', length: 10, nullable: true })
  otpCode: string | null;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
