// backend/src/country/country.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { State } from '../state/state.entity';

@Entity('countries')
@Unique(['iso2'])
@Unique(['iso3'])
@Unique(['numericCode'])
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ name: 'iso2', type: 'varchar', length: 2, nullable: true })
  iso2: string | null;

  @Column({ name: 'iso3', type: 'varchar', length: 3, nullable: true })
  iso3: string | null;

  @Column({ name: 'numeric_code', type: 'varchar', length: 3, nullable: true })
  numericCode: string | null;

  @Column({ name: 'phone_code', type: 'varchar', length: 255, nullable: true })
  phoneCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  capital: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  currency: string | null;

  @Column({ name: 'currency_name', type: 'varchar', length: 255, nullable: true })
  currencyName: string | null;

  @Column({ name: 'currency_symbol', type: 'varchar', length: 255, nullable: true })
  currencySymbol: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tld: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  native: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  region: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subregion: string | null;

  @Column({ type: 'jsonb', array: false, nullable: true }) // Using jsonb for timezones array
  timezones: { zoneName: string, gmtOffset: number, gmtOffsetName: string, abbreviation: string, tzName: string }[] | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emoji: string | null;

  @Column({ name: 'emoji_u', type: 'varchar', length: 255, nullable: true })
  emojiU: string | null;

  @Column({ type: 'boolean', default: false, nullable: false })
  flag: boolean;

  @Column({ name: 'wiki_data_id', type: 'varchar', length: 255, nullable: true })
  wikiDataId: string | null;

  @OneToMany(() => State, state => state.country)
  states: State[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
