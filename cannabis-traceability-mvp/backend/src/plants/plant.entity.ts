import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum PlantStage {
  SEED = 'seed',
  GERMINATION = 'germination',
  SEEDLING = 'seedling',
  VEGETATIVE = 'vegetative',
  FLOWERING = 'flowering',
  HARVEST = 'harvest',
  DRYING = 'drying',
  DRIED = 'dried',
  CURED = 'cured'
}

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

  @Column({
    type: 'enum',
    enum: PlantStage,
    default: PlantStage.SEED
  })
  stage!: PlantStage;

  @Column({ type: 'timestamptz', nullable: true })
  stageChangedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  flippedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  harvestedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  driedAt!: Date | null;

  @Column({ default: false })
  harvested!: boolean;

  // Calculated field for days in current stage
  getDaysInStage(): number {
    const stageStart = this.stageChangedAt || this.plantedAt;
    const now = new Date();
    return Math.floor((now.getTime() - stageStart.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Estimated days until flip (for vegetative stage)
  getEstimatedDaysToFlip(): number | null {
    if (this.stage !== PlantStage.VEGETATIVE) return null;
    // Typical vegetative period is 4-8 weeks, let's use 6 weeks (42 days) as default
    const daysInVeg = this.getDaysInStage();
    return Math.max(0, 42 - daysInVeg);
  }

  // Check if stage transition is valid
  canTransitionTo(newStage: PlantStage): boolean {
    const currentStage = this.stage;
    
    const validTransitions: { [key in PlantStage]: PlantStage[] } = {
      [PlantStage.SEED]: [PlantStage.GERMINATION],
      [PlantStage.GERMINATION]: [PlantStage.SEEDLING],
      [PlantStage.SEEDLING]: [PlantStage.VEGETATIVE],
      [PlantStage.VEGETATIVE]: [PlantStage.FLOWERING],
      [PlantStage.FLOWERING]: [PlantStage.HARVEST],
      [PlantStage.HARVEST]: [PlantStage.DRYING],
      [PlantStage.DRYING]: [PlantStage.DRIED],
      [PlantStage.DRIED]: [PlantStage.CURED],
      [PlantStage.CURED]: []
    };

    return validTransitions[currentStage].includes(newStage);
  }
}
