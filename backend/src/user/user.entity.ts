// servemee/backend/src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../auth/roles/roles.enum';
import { Service } from '../service/service.entity'; // Import the Service entity
import { Booking } from '../booking/booking.entity';
import { RatingReview } from '../rating-review/rating-review.entity';
import { ServiceRequest } from '../service-request/service-request.entity';

@Entity('users') // Map to the 'users' table
export class User {
  @PrimaryGeneratedColumn('uuid') // Automatically generates UUID
  id: string;

  @Column({ name: 'firebase_uid', type: 'varchar', length: 128, unique: true, nullable: false })
  @Index('idx_users_firebase_uid')
  firebaseUid: string;

  @Column({ nullable: true, length: 100 })
  displayName: string; // Add this column for display name

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, unique: true, nullable: true })
  @Index('idx_users_phone_number')
  phoneNumber: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  username: string;

  @Column({ name: 'profile_picture_url', type: 'text', nullable: true })
  profilePictureUrl: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Index('idx_users_role')
  role: string; // 'consumer', 'service_provider', 'admin'

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Column({ name: 'passport_photo_url', type: 'text', nullable: true })
  passportPhotoUrl: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false, nullable: false })
  isVerified: boolean;

  @Column({ name: 'average_rating', type: 'decimal', precision: 2, scale: 1, default: 0.0, nullable: false })
  averageRating: number;

  @Column({ name: 'total_ratings', type: 'integer', default: 0, nullable: false })
  totalRatings: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Add this One-to-Many relationship for Services
  @OneToMany(() => Service, service => service.provider)
  services: Service[]; // This property will hold an array of services offered by this user

  // One-to-Many relationship with Booking (as a Consumer)
  @OneToMany(() => Booking, booking => booking.consumer)
  bookingsAsConsumer: Booking[];

  // One-to-Many relationship with RatingReview (as a Consumer giving reviews)
  @OneToMany(() => RatingReview, review => review.consumer)
  reviewsGiven: RatingReview[];

  // One-to-Many relationship with RatingReview (as a Service Provider receiving reviews)
  @OneToMany(() => RatingReview, review => review.serviceProvider)
  reviewsReceived: RatingReview[];

  // One-to-Many relationship with ServiceRequest (as a Consumer)
  @OneToMany(() => ServiceRequest, request => request.consumer)
  serviceRequestsAsConsumer: ServiceRequest[];

  // One-to-Many relationship with ServiceRequest (as a Service Provider)
  @OneToMany(() => ServiceRequest, request => request.serviceProvider)
  serviceRequestsAsProvider: ServiceRequest[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
