// backend/src/locality/locality.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ServiceProvider } from '../service-provider/service-provider.entity';
import { ServiceRequest } from '../service-request/service-request.entity';
import { District } from '../district/district.entity'; // <--- ADD THIS IMPORT

@Entity('localities')
export class Locality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  name: string;

  // --- ADD THESE LINES FOR DISTRICT RELATIONSHIP ---
  @Column({ name: 'district_id', type: 'uuid', nullable: true }) // Assuming it can be nullable for now, adjust as per your business logic
  districtId: string | null;

  @ManyToOne(() => District, district => district.localities, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'district_id' })
  district: District | null;
  // --- END ADDITIONS ---

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @ManyToMany(() => ServiceProvider, serviceProvider => serviceProvider.operationalLocalities)
  serviceProviders: ServiceProvider[];

  @OneToMany(() => ServiceRequest, serviceRequest => serviceRequest.locality)
  serviceRequests: ServiceRequest[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
