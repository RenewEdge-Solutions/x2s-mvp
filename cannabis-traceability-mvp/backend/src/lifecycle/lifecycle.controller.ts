import { Controller, Get } from '@nestjs/common';
import { PlantsService } from '../plants/plants.service';
import { HarvestsService } from '../harvests/harvests.service';

@Controller('lifecycle')
export class LifecycleController {
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
  const plantEvents = plants.map((p: any) => ({
      type: 'plant',
      id: p.id,
      strain: p.strain,
      location: p.location,
      plantedAt: p.plantedAt,
    }));
  const harvestEvents = harvests.map((h: any) => ({
      type: 'harvest',
      id: h.id,
      plantId: h.plantId,
      yieldGrams: h.yieldGrams,
      status: h.status,
      harvestedAt: h.harvestedAt,
    }));
    const all = [...plantEvents, ...harvestEvents].sort((a: any, b: any) => {
      const ta = (a.plantedAt || a.harvestedAt).getTime();
      const tb = (b.plantedAt || b.harvestedAt).getTime();
      return tb - ta;
    });
    return all;
  }
}
