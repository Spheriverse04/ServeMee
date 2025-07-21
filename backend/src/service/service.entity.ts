// src/service/service.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { Booking } from '../booking/booking.entity';
import { ServiceType } from '../service-type/service-type.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'service_type_id', type: 'uuid', nullable: false })
  serviceTypeId: string;

  @ManyToOne(() => ServiceType, serviceType => serviceType.services, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @Column({ name: 'base_fare', type: 'decimal', precision: 10, scale: 2, nullable: false })
  baseFare: number;

  @Column({ name: 'is_available', type: 'boolean', default: true, nullable: false })
  isAvailable: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  // Additional service-specific attributes (stored as JSON)
  @Column({ name: 'additional_attributes', type: 'jsonb', nullable: true })
  additionalAttributes: Record<string, any>;

  @Column({ name: 'average_rating', type: 'decimal', precision: 2, scale: 1, default: 0.0, nullable: false })
  averageRating: number;

  @Column({ name: 'total_ratings', type: 'integer', default: 0, nullable: false })
  totalRatings: number;

  @ManyToOne(() => User, user => user.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column({ name: 'provider_id', type: 'uuid', nullable: false })
  @Index()
  providerId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => Booking, booking => booking.service)
  bookings: Booking[];
}

