// backend/src/user/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne, // Add OneToOne
  ManyToMany,
  JoinTable,
  JoinColumn, // Add JoinColumn for OneToOne
  Index,
} from 'typeorm';
import { Service } from '../service/service.entity';
import { Booking } from '../booking/booking.entity';
import { RatingReview } from '../rating-review/rating-review.entity';
import { ServiceRequest } from '../service-request/service-request.entity';
import { UserRole } from '../auth/roles/roles.enum';
import { Locality } from '../locality/locality.entity';
import { ServiceProvider } from '../service-provider/service-provider.entity'; // Import ServiceProvider

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'firebase_uid', type: 'varchar', length: 255, unique: true, nullable: false })
  firebaseUid: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, unique: true, nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
  displayName: string | null;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({ name: 'profile_picture_url', type: 'text', nullable: true })
  profilePictureUrl: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSUMER,
    nullable: false,
  })
  role: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  // Relationships for User
  @OneToMany(() => Booking, booking => booking.consumer)
  consumerBookings: Booking[];

  @OneToMany(() => RatingReview, ratingReview => ratingReview.consumer)
  givenReviews: RatingReview[];

  @OneToMany(() => ServiceRequest, serviceRequest => serviceRequest.consumer)
  requestedServices: ServiceRequest[];

  // One-to-One relationship with ServiceProvider
  @OneToOne(() => ServiceProvider, serviceProvider => serviceProvider.user)
  serviceProvider: ServiceProvider;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
