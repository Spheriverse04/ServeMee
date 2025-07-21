// backend/src/service-request/service-request.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { ServiceType } from '../service-type/service-type.entity';
import { RatingReview } from '../rating-review/rating-review.entity';

export enum ServiceRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'consumer_id', type: 'uuid', nullable: false })
  consumerId: string;

  @ManyToOne(() => User, user => user.serviceRequestsAsConsumer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;

  @Column({ name: 'service_provider_id', type: 'uuid', nullable: true })
  serviceProviderId: string;

  @ManyToOne(() => User, user => user.serviceRequestsAsProvider, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: User;

  @Column({ name: 'service_type_id', type: 'uuid', nullable: false })
  serviceTypeId: string;

  @ManyToOne(() => ServiceType, serviceType => serviceType.services, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @Column({ 
    name: 'requested_at_location', 
    type: 'geometry', 
    spatialFeatureType: 'Point', 
    srid: 4326,
    nullable: false 
  })
  @Index({ spatial: true })
  requestedAtLocation: string; // PostGIS Point geometry

  @Column({ name: 'service_address', type: 'text', nullable: false })
  serviceAddress: string;

  @Column({ 
    type: 'enum', 
    enum: ServiceRequestStatus, 
    default: ServiceRequestStatus.PENDING 
  })
  @Index()
  status: ServiceRequestStatus;

  @Column({ name: 'otp_code', type: 'varchar', length: 6, nullable: true })
  otpCode: string;

  @Column({ name: 'total_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number;

  @Column({ 
    name: 'payment_status', 
    type: 'enum', 
    enum: PaymentStatus, 
    default: PaymentStatus.PENDING 
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod: string;

  // Request details (stored as JSON for flexibility)
  @Column({ name: 'request_details', type: 'jsonb', nullable: true })
  requestDetails: Record<string, any>;

  @Column({ name: 'requested_at', type: 'timestamp with time zone', default: () => 'NOW()' })
  requestedAt: Date;

  @Column({ name: 'accepted_at', type: 'timestamp with time zone', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp with time zone', nullable: true })
  cancelledAt: Date;

  // One-to-Many relationship with RatingReview
  @OneToMany(() => RatingReview, review => review.serviceRequest)
  reviews: RatingReview[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}