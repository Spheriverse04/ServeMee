// servemee/backend/src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { UserRole } from '../auth/roles/roles.enum';
import { Service } from '../service/service.entity'; // Import the Service entity
import { Booking } from '../booking/booking.entity';

@Entity('users') // Map to the 'users' table
export class User {
  @PrimaryGeneratedColumn('uuid') // Automatically generates UUID
  id: string;

  @Column({ name: 'firebase_uid', type: 'varchar', length: 128, unique: true, nullable: false })
  @Index('idx_users_firebase_uid')
  firebaseUid: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, unique: true, nullable: false })
  @Index('idx_users_phone_number')
  phoneNumber: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  username: string;

  @Column({ name: 'profile_picture_url', type: 'text', nullable: true })
  profilePictureUrl: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Index('idx_users_role')
  role: string; // 'consumer', 'service_provider', 'admin'

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  // Add this One-to-Many relationship for Services
  @OneToMany(() => Service, service => service.provider)
  services: Service[]; // This property will hold an array of services offered by this user

  // One-to-Many relationship with Booking (as a Consumer)
  @OneToMany(() => Booking, booking => booking.consumer)
  bookingsAsConsumer: Booking[];

  @Column({ name: 'created_at', type: 'timestamp with time zone', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'NOW()', onUpdate: 'NOW()' })
  updatedAt: Date;
}
