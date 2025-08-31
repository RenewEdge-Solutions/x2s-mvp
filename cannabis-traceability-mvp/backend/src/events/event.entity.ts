import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('date')
  date!: Date;

  @Column('time', { nullable: true })
  time?: string;

  @Column({ default: true })
  isCustom!: boolean;

  @Column({ nullable: true })
  type?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
