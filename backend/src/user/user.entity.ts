// src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { UserRole } from '../auth/roles/roles.enum';
import { Booking } from '../booking/booking.entity';
import { RatingReview } from '../rating-review/rating-review.entity';
import { ServiceProvider } from '../service-provider/service-provider.entity';
import { ServiceRequest } from '../service-request/service-request.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'firebase_uid', unique: true, nullable: false })
  firebaseUid: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ name: 'phone_number', nullable: true, length: 20 })
  phoneNumber?: string;

  @Column({ name: 'display_name', nullable: true, length: 100 })
  displayName?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSUMER,
    nullable: false,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true, nullable: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // --- Inverse Relationships ---

  // For Bookings where this user is the consumer
  @OneToMany(() => Booking, booking => booking.consumer)
  consumerBookings: Booking[];

  // For RatingReviews where this user is the author/consumer
  // CORRECTED: Changed 'review.author' to 'review.consumer'
  @OneToMany(() => RatingReview, review => review.consumer)
  givenReviews: RatingReview[];

  // For ServiceProvider profile (one-to-one relationship)
  @OneToOne(() => ServiceProvider, (serviceProvider) => serviceProvider.user, { cascade: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'userId' })
  serviceProvider: ServiceProvider;

  // For ServiceRequests made by this user
  @OneToMany(() => ServiceRequest, serviceRequest => serviceRequest.consumer)
  requestedServices: ServiceRequest[];
}
