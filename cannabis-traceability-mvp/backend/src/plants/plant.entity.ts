import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Plant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  strain!: string;

  @Column()
  location!: string;

  @Column({ type: 'timestamptz' })
  plantedAt!: Date;

  @Column({ default: false })
  harvested!: boolean;
}
