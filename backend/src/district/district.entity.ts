// backend/src/district/district.entity.ts
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
import { State } from '../state/state.entity'; // You will need to create this State entity as well
import { Locality } from '../locality/locality.entity';

@Entity('districts')
@Unique(['name', 'stateId']) // Applying composite unique constraint as per schema evolution
// NOTE: Your schema_dump.sql shows UQ_6a6fd6d258022e5576afbad90b4 UNIQUE (name) on districts.
// However, typically, districts would have a composite unique constraint with state_id.
// If your database enforces UNIQUE(name) only, you can remove the stateId from @Unique decorator.
// For now, I'm assuming the intent is a composite unique constraint like localities, aligning with best practices for geographical entities.
export class District {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'state_id', type: 'uuid', nullable: false })
  @Index()
  stateId: string;

  @ManyToOne(() => State, state => state.districts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'state_id' })
  state: State;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @OneToMany(() => Locality, locality => locality.district)
  localities: Locality[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
