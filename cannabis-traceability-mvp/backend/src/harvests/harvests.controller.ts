import { Body, Controller, Get, Post } from '@nestjs/common';
import { HarvestsService } from './harvests.service';

@Controller('harvests')
export class HarvestsController {
  constructor(private readonly harvestsService: HarvestsService) {}

  @Post()
  create(
    @Body()
    body: { plantId: string; yieldGrams: number; status: 'drying' | 'dried'; by?: string },
  ) {
    return this.harvestsService.create(body);
  }

  @Get()
  list() {
    return this.harvestsService.findAll();
  }
}
