// backend/src/state/state.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Country } from '../country/country.entity'; // You will need to create this Country entity next
import { District } from '../district/district.entity';

@Entity('states')
@Unique(['name', 'countryId']) // Composite unique constraint for name within a country
export class State {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'country_id', type: 'uuid', nullable: false })
  @Index()
  countryId: string;

  @ManyToOne(() => Country, country => country.states, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @OneToMany(() => District, district => district.state)
  districts: District[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
