import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Harvest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  plantId!: string;

  @Column('float')
  yieldGrams!: number;

  @Column({ type: 'varchar' })
  status!: 'drying' | 'dried';

  @Column({ type: 'timestamptz' })
  harvestedAt!: Date;
}
