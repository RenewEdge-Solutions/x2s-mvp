import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ReportType = 'inventory_summary' | 'harvest_yields';

@Entity('reports')
export class ReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  type!: ReportType;

  @Column({ type: 'varchar' })
  filename!: string;

  @Column({ type: 'varchar', default: 'manual' })
  source!: 'manual' | 'auto';

  @CreateDateColumn()
  createdAt!: Date;
}
