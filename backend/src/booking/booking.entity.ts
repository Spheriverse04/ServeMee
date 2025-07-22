// backend/src/booking/booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { Service } from '../service/service.entity';
import { ServiceProvider } from '../service-provider/service-provider.entity'; // ADD this import

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp with time zone' })
  startTime: Date;

  @Column({ type: 'timestamp with time zone' })
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  agreedPrice: string; // Stored as string to avoid floating point issues with money

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true })
  notes: string; // This should be present

  // Consumer who made the booking
  @Column({ name: 'consumer_id' })
  consumerId: string;

  // CHANGE this line to use consumerBookings
  @ManyToOne(() => User, user => user.consumerBookings)
  @JoinColumn({ name: 'consumer_id' })
  consumer: User;

  // Service for which the booking is made
  @Column({ name: 'service_id' })
  serviceId: string;

  @ManyToOne(() => Service, service => service.bookings)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  // Add ServiceProvider relation
  @Column({ name: 'service_provider_id', nullable: true })
  serviceProviderId: string;

  @ManyToOne(() => ServiceProvider, serviceProvider => serviceProvider.providerBookings)
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider: ServiceProvider;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
