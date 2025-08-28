import { Controller, Get } from '@nestjs/common';
import { PlantsService } from '../plants/plants.service';
import { HarvestsService } from '../harvests/harvests.service';
import * as crypto from 'crypto';

@Controller('integrity')
export class IntegrityController {
  constructor(
    private readonly plantsService: PlantsService,
    private readonly harvestsService: HarvestsService,
  ) {}

  @Get()
  async list() {
    const [plants, harvests] = await Promise.all([
      this.plantsService.findAll(),
      this.harvestsService.findAll(),
    ]);
  const plantEvents = plants.map((p: any) => {
      const payload = {
        type: 'plant' as const,
        id: p.id,
        strain: p.strain,
        location: p.location,
        plantedAt: p.plantedAt.toISOString(),
        by: 'operator',
      };
      const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      return { type: 'plant', id: p.id, timestamp: p.plantedAt.toISOString(), hash, payload };
    });
  const harvestEvents = harvests.map((h: any) => {
      const payload = {
        type: 'harvest' as const,
        id: h.id,
        plantId: h.plantId,
        yieldGrams: h.yieldGrams,
        status: h.status,
        harvestedAt: h.harvestedAt.toISOString(),
        by: 'operator',
      };
      const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      return { type: 'harvest', id: h.id, timestamp: h.harvestedAt.toISOString(), hash, payload };
    });
    const all = [...plantEvents, ...harvestEvents].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    return all.slice(0, 50);
  }
}
