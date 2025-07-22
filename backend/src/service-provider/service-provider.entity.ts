// src/service-provider/service-provider.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Service } from '../service/service.entity';
import { ServiceRequest } from '../service-request/service-request.entity';
import { RatingReview } from '../rating-review/rating-review.entity';
import { Locality } from '../locality/locality.entity';
import { Booking } from '../booking/booking.entity';

@Entity('service_providers')
export class ServiceProvider {
  @PrimaryColumn('uuid', { name: 'user_id' })
  userId: string;

  // FIX: Removed 'primary: true' as it's not a valid RelationOptions property
  @OneToOne(() => User, (user) => user.serviceProvider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
  companyName: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0.0, nullable: false })
  averageRating: number;

  @Column({ name: 'total_ratings', type: 'integer', default: 0, nullable: false })
  totalRatings: number;

  @Column({ name: 'is_verified', type: 'boolean', default: false, nullable: false })
  isVerified: boolean;

  @OneToMany(() => Service, (service) => service.serviceProvider)
  services: Service[];

  @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.serviceProvider)
  serviceRequests: ServiceRequest[];

  @OneToMany(() => RatingReview, (ratingReview) => ratingReview.serviceProvider)
  receivedReviews: RatingReview[];

  @OneToMany(() => Booking, (booking) => booking.serviceProvider)
  providerBookings: Booking[];

  // FIX: Added the 'operationalLocalities' property as the inverse for ManyToMany with Locality
  @ManyToMany(() => Locality, (locality) => locality.serviceProviders, { cascade: true })
  @JoinTable({
    name: 'service_provider_localities',
    joinColumn: { name: 'service_provider_id', referencedColumnName: 'userId' },
    inverseJoinColumn: { name: 'locality_id', referencedColumnName: 'id' },
  })
  localities: Locality[];
  
  // New property for the inverse relation from Locality
  // Assuming this is the correct inverse property name from locality.entity.ts
  @ManyToMany(() => Locality, (locality) => locality.serviceProviders)
  operationalLocalities: Locality[];


  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
