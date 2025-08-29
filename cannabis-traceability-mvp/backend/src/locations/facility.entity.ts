import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Geolocation } from './geolocation.entity';
import { Structure } from './structure.entity';

export type FacilityType = 'farm' | 'building';

@Entity('facilities')
export class Facility {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: FacilityType;

  @ManyToOne(() => Geolocation, (g) => g.facilities, { onDelete: 'CASCADE' })
  geo!: Geolocation;

  @OneToMany(() => Structure, (s: Structure) => s.facility)
  structures!: Structure[];
}
