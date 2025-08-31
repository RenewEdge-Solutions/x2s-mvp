import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  type!: string; // 'lights', 'sensors', etc.

  @Column()
  subtype!: string; // 'LED', 'Temperature', etc.

  @Column({ type: 'json' })
  details!: Record<string, string>; // Dynamic details like { 'Wattage': '500W', 'Spectrum': 'Full' }

  @Column()
  location!: string; // e.g., 'Room 1 -> Tent 1'

  @Column({ nullable: true })
  iotDevice?: string; // e.g., 'Sensor-001'

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
