// backend/src/service-type/service-type.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ServiceCategory } from '../service-category/service-category.entity';
import { Service } from '../service/service.entity';

export enum BaseFareType {
  HOURLY = 'hourly',
  FIXED = 'fixed',
  PER_KM = 'per_km',
  PER_ITEM = 'per_item',
  CUSTOM = 'custom'
}

@Entity('service_types')
export class ServiceType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: false })
  categoryId: string;

  @ManyToOne(() => ServiceCategory, category => category.serviceTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    name: 'base_fare_type', 
    type: 'enum', 
    enum: BaseFareType, 
    nullable: false 
  })
  baseFareType: BaseFareType;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'integer', default: 0, nullable: false })
  sortOrder: number;

  // Additional attributes specific to service type (stored as JSON)
  @Column({ name: 'additional_attributes', type: 'jsonb', nullable: true })
  additionalAttributes: Record<string, any>;

  // One-to-Many relationship with Service
  @OneToMany(() => Service, service => service.serviceType)
  services: Service[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
