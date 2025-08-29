import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Facility } from './facility.entity';

@Entity('geolocations')
export class Geolocation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  address?: string | null;

  @Column({ type: 'double precision', nullable: true })
  lat?: number | null;

  @Column({ type: 'double precision', nullable: true })
  lng?: number | null;

  @OneToMany(() => Facility, (f: Facility) => f.geo)
  facilities!: Facility[];
}
