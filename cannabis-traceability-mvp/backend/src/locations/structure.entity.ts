import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Facility } from './facility.entity';

export type StructureType = 'room' | 'greenhouse';
export type StructureUsage = 'Vegetative' | 'Flowering' | 'Drying' | 'Storage' | 'Tents' | 'Racks/Tents';

@Entity('structures')
export class Structure {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: StructureType;

  // Nullable to support existing rows during schema sync; frontend always provides a value for new records
  @Column({ type: 'varchar', length: 20, nullable: true })
  usage!: StructureUsage | null;

  @Column({ type: 'double precision', nullable: true })
  size?: number | null;

  // Number of beds for greenhouse structures
  @Column({ type: 'integer', nullable: true })
  beds?: number | null;

  // Array of tents for rooms when usage === 'Tents'; width/length in feet
  @Column({ type: 'jsonb', nullable: true })
  tents?: Array<{ widthFt: number; lengthFt: number }>|null;

  // Array of racks for rooms when usage === 'Racks/Tents'; width/length in centimeters, shelves count per rack
  @Column({ type: 'jsonb', nullable: true })
  racks?: Array<{ widthCm: number; lengthCm: number; shelves: number }>|null;

  @ManyToOne(() => Facility, (f) => f.structures, { onDelete: 'CASCADE' })
  facility!: Facility;
}
