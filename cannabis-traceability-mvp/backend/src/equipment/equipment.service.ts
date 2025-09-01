import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Equipment } from './equipment.entity';

@Injectable()
export class EquipmentService {
  constructor(@InjectRepository(Equipment) private repo: Repository<Equipment>) {}

  async create(dto: {
    type: string;
    subtype: string;
    details: Record<string, string>;
    location: string;
    structureId?: string;
    iotDevice?: string;
  }) {
    const equipment = this.repo.create({
      type: dto.type,
      subtype: dto.subtype,
      details: dto.details,
      location: dto.location,
      structureId: dto.structureId,
      iotDevice: dto.iotDevice,
    });
    return this.repo.save(equipment);
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findByLocation(location: string) {
    // Find by location directly (for backward compatibility) and also with LIKE for partial matching
    return this.repo.find({ 
      where: [
        { location }, 
        { location: Like(`${location}%`) } 
      ],
      order: { createdAt: 'DESC' } 
    });
  }
  
  async findByStructureId(structureId: string) {
    return this.repo.find({ where: { structureId }, order: { createdAt: 'DESC' } });
  }

  async update(id: string, dto: {
    type: string;
    subtype: string;
    details: Record<string, string>;
    location: string;
    structureId?: string;
    iotDevice?: string;
  }) {
    await this.repo.update(id, {
      type: dto.type,
      subtype: dto.subtype,
      details: dto.details,
      location: dto.location,
      structureId: dto.structureId,
      iotDevice: dto.iotDevice,
    });
    return this.repo.findOneByOrFail({ id });
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }
}
