import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Harvest } from './harvest.entity';
import { PlantsService } from '../plants/plants.service';
import * as crypto from 'crypto';

@Injectable()
export class HarvestsService {
  constructor(
    @InjectRepository(Harvest) private repo: Repository<Harvest>,
    private readonly plantsService: PlantsService,
  ) {}

  async create(dto: {
    plantId: string;
    yieldGrams: number;
    status: 'drying' | 'dried';
    by?: string;
  }) {
    const plants = await this.plantsService.findAll();
  const plant = plants.find((p: any) => p.id === dto.plantId);
    if (!plant) throw new NotFoundException('Plant not found');

    const harvest = this.repo.create({
      plantId: dto.plantId,
      yieldGrams: dto.yieldGrams,
      status: dto.status,
      harvestedAt: new Date(),
    });
    const saved = await this.repo.save(harvest);

  await this.plantsService.markHarvested(dto.plantId);

    const payload = {
      type: 'harvest',
      id: saved.id,
      plantId: saved.plantId,
      yieldGrams: saved.yieldGrams,
      status: saved.status,
      harvestedAt: saved.harvestedAt.toISOString(),
      by: dto.by || 'operator',
    } as const;
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    return { harvest: saved, hash };
  }

  findAll() {
    return this.repo.find({ order: { harvestedAt: 'DESC' } });
  }
}
