import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plant, PlantStage } from './plant.entity';
import { InventoryService } from '../inventory/inventory.service';
import * as crypto from 'crypto';

@Injectable()
export class PlantsService {
  constructor(
    @InjectRepository(Plant) private repo: Repository<Plant>,
    private inventoryService: InventoryService,
  ) {}

  async create(dto: { strain: string; location: string; by?: string }) {
    const plant = this.repo.create({
      strain: dto.strain,
      location: dto.location,
      plantedAt: new Date(),
      stage: PlantStage.SEED,
      stageChangedAt: new Date(),
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

  async germinateFromSeed(dto: { seedId: string; strain: string; location: string; by?: string }) {
    // First, reduce the seed quantity in inventory
    await this.inventoryService.reduceQuantity(dto.seedId, 1);

    // Create a plant starting in germination stage
    const plant = this.repo.create({
      strain: dto.strain,
      location: dto.location,
      plantedAt: new Date(),
      stage: PlantStage.GERMINATION,
      stageChangedAt: new Date(),
      harvested: false,
    });
    const saved = await this.repo.save(plant);
    
    const payload = {
      type: 'plant_from_germination',
      id: saved.id,
      strain: saved.strain,
      location: saved.location,
      plantedAt: saved.plantedAt.toISOString(),
      seedId: dto.seedId,
      by: dto.by || 'operator',
    } as const;
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    return { plant: saved, hash };
  }

  findAll() {
    return this.repo.find({ order: { plantedAt: 'DESC' } });
  }

  async relocate(plantId: string, newLocation: string) {
    const plant = await this.repo.findOne({ where: { id: plantId } });
    if (!plant) {
      throw new BadRequestException('Plant not found');
    }
    plant.location = newLocation;
    return this.repo.save(plant);
  }

  async flip(plantId: string) {
    const plant = await this.repo.findOne({ where: { id: plantId } });
    if (!plant) {
      throw new BadRequestException('Plant not found');
    }
    if (plant.stage !== PlantStage.VEGETATIVE) {
      throw new BadRequestException('Can only flip plants in vegetative stage');
    }
    if (!plant.canTransitionTo(PlantStage.FLOWERING)) {
      throw new BadRequestException('Invalid stage transition');
    }
    
    plant.stage = PlantStage.FLOWERING;
    plant.stageChangedAt = new Date();
    plant.flippedAt = new Date();
    return this.repo.save(plant);
  }

  async harvest(plantId: string) {
    const plant = await this.repo.findOne({ where: { id: plantId } });
    if (!plant) {
      throw new BadRequestException('Plant not found');
    }
    if (plant.stage !== PlantStage.FLOWERING) {
      throw new BadRequestException('Can only harvest plants in flowering stage');
    }
    if (!plant.canTransitionTo(PlantStage.HARVEST)) {
      throw new BadRequestException('Invalid stage transition');
    }
    
    plant.stage = PlantStage.HARVEST;
    plant.stageChangedAt = new Date();
    plant.harvestedAt = new Date();
    plant.harvested = true;
    return this.repo.save(plant);
  }

  async dry(plantId: string) {
    const plant = await this.repo.findOne({ where: { id: plantId } });
    if (!plant) {
      throw new BadRequestException('Plant not found');
    }
    if (plant.stage !== PlantStage.HARVEST) {
      throw new BadRequestException('Can only dry plants that have been harvested');
    }
    if (!plant.canTransitionTo(PlantStage.DRYING)) {
      throw new BadRequestException('Invalid stage transition');
    }
    
    plant.stage = PlantStage.DRYING;
    plant.stageChangedAt = new Date();
    return this.repo.save(plant);
  }

  async markDried(plantId: string) {
    const plant = await this.repo.findOne({ where: { id: plantId } });
    if (!plant) {
      throw new BadRequestException('Plant not found');
    }
    if (plant.stage !== PlantStage.DRYING) {
      throw new BadRequestException('Can only mark as dried plants that are in drying stage');
    }
    if (!plant.canTransitionTo(PlantStage.DRIED)) {
      throw new BadRequestException('Invalid stage transition');
    }
    
    plant.stage = PlantStage.DRIED;
    plant.stageChangedAt = new Date();
    plant.driedAt = new Date();
    return this.repo.save(plant);
  }

  async changeStage(plantId: string, newStage: PlantStage) {
    const plant = await this.repo.findOne({ where: { id: plantId } });
    if (!plant) {
      throw new BadRequestException('Plant not found');
    }
    if (!plant.canTransitionTo(newStage)) {
      throw new BadRequestException(`Cannot transition from ${plant.stage} to ${newStage}`);
    }
    
    plant.stage = newStage;
    plant.stageChangedAt = new Date();
    return this.repo.save(plant);
  }

  async markHarvested(plantId: string) {
    return this.harvest(plantId);
  }

  async deletePlant(plantId: string, reason: string, by = 'operator') {
    const plant = await this.repo.findOne({ where: { id: plantId } });
    if (!plant) {
      throw new BadRequestException('Plant not found');
    }
    
    // Log the deletion with reason for audit trail
    const deletionLog = {
      type: 'plant_deletion',
      plantId,
      strain: plant.strain,
      stage: plant.stage,
      location: plant.location,
      reason,
      deletedBy: by,
      deletedAt: new Date().toISOString(),
    };
    
    // In a real application, you might want to store this log in a separate audit table
    console.log('Plant deletion log:', deletionLog);
    
    await this.repo.delete(plantId);
    return { message: 'Plant deleted successfully', deletionLog };
  }
}
