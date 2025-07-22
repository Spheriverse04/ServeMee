// src/service/service.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany, // Add OneToMany import
} from 'typeorm';
import { ServiceType } from '../service-type/service-type.entity';
import { ServiceProvider } from '../service-provider/service-provider.entity';
import { Booking } from '../booking/booking.entity'; // Import Booking entity

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'base_fare', type: 'decimal', precision: 10, scale: 2, nullable: false, default: 0.0 })
  baseFare: number;

  @Column({ name: 'service_type_id', type: 'uuid', nullable: false })
  serviceTypeId: string;

  @ManyToOne(() => ServiceType, (serviceType) => serviceType.services, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @Column({ name: 'service_provider_id', type: 'uuid', nullable: false })
  providerId: string; // This is the column that holds the ID

  // This is the relation property that points back to ServiceProvider
  // The inverse side is `serviceProvider.services`
  @ManyToOne(() => ServiceProvider, (serviceProvider) => serviceProvider.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_provider_id' }) // This links to the providerId column
  serviceProvider: ServiceProvider;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  // FIX: Add inverse relationship for Bookings
  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
