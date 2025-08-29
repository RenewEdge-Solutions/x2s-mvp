import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Facility } from './facility.entity';

export type StructureType = 'room' | 'greenhouse';

@Entity('structures')
export class Structure {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: StructureType;

  @Column({ type: 'double precision', nullable: true })
  size?: number | null;

  @ManyToOne(() => Facility, (f) => f.structures, { onDelete: 'CASCADE' })
  facility!: Facility;
}
