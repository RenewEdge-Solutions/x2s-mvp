import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserRole } from '../common/types';

@Entity('users')
@Unique(['username'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 80 })
  username!: string; // e.g., "Daniel.Veselski"

  @Column({ type: 'varchar', length: 120 })
  password!: string; // demo only (plaintext)

  @Column({ type: 'varchar', length: 30 })
  role!: UserRole;

  @Column({ type: 'varchar', length: 60 })
  firstName!: string;

  @Column({ type: 'varchar', length: 80 })
  lastName!: string;

  @Column({ type: 'varchar', length: 120 })
  email!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address?: string; // single-line address for MVP

  @Column({ type: 'simple-array', nullable: true })
  modules?: string[]; // e.g., cannabis, alcohol, mushrooms, explosives
}
