// backend/src/locality/locality.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToMany } from 'typeorm';
// THIS LINE MUST BE REMOVED: import { User } from '../user/user.entity';
import { ServiceProvider } from '../service-provider/service-provider.entity'; // THIS LINE MUST BE PRESENT

@Entity('localities')
export class Locality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  name: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    nullable: false
  })
  @Index({ spatial: true })
  polygonGeometry: string; // PostGIS geometry data

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  // Many-to-Many relationship with Service Providers
  // THIS MUST REFERENCE ServiceProvider, NOT User
  @ManyToMany(() => ServiceProvider, serviceProvider => serviceProvider.operationalLocalities)
  serviceProviders: ServiceProvider[]; // THIS MUST BE ServiceProvider[], NOT User[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
