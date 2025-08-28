import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plant } from './plant.entity';
import * as crypto from 'crypto';

@Injectable()
export class PlantsService {
  constructor(@InjectRepository(Plant) private repo: Repository<Plant>) {}

  async create(dto: { strain: string; location: string; by?: string }) {
    const plant = this.repo.create({
      strain: dto.strain,
      location: dto.location,
      plantedAt: new Date(),
      harvested: false,
    });
    const saved = await this.repo.save(plant);
    const payload = {
      type: 'plant',
      id: saved.id,
      strain: saved.strain,
      location: saved.location,
      plantedAt: saved.plantedAt.toISOString(),
      by: dto.by || 'operator',
    } as const;
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    return { plant: saved, hash };
  }

  findAll() {
    return this.repo.find({ order: { plantedAt: 'DESC' } });
  }

  async markHarvested(plantId: string) {
    const plant = await this.repo.findOne({ where: { id: plantId } });
    if (plant && !plant.harvested) {
      plant.harvested = true;
      await this.repo.save(plant);
    }
  }
}
