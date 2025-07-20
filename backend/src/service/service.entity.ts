// src/service/service.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity'; // Import the User entity
import { Booking } from '../booking/booking.entity'; 

@Entity('services') // Table name will be 'services'
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) // Example: 10 digits total, 2 after decimal for currency
  price: number;

  @Column({ length: 50, nullable: true }) // Example: 'Plumbing', 'Electrical', 'Cleaning'
  category: string;

  @Column({ default: true }) // Is the service currently active/available?
  isActive: boolean;

  // Many-to-one relationship with User (a Service belongs to one Provider)
  @ManyToOne(() => User, user => user.services, { onDelete: 'CASCADE' }) // If user deleted, delete their services
  @JoinColumn({ name: 'providerId' }) // The foreign key column in 'services' table will be 'providerId'
  provider: User;

  @Column()
  providerId: string; // Explicitly define the foreign key column

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // One-to-Many relationship with Booking
  @OneToMany(() => Booking, booking => booking.service)
  bookings: Booking[];
}
