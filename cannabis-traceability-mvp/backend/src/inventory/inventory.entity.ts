import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'varchar', length: 100 })
  subcategory!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  itemType?: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'varchar', length: 50 })
  unit!: string;

  @Column({ type: 'varchar', length: 500 })
  location!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier?: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate?: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  // Category-specific fields stored as JSON
  @Column({ type: 'jsonb', nullable: true })
  specificFields?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
