import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlantsService } from './plants.service';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post()
  create(@Body() body: { strain: string; location: string; by?: string }) {
    return this.plantsService.create(body);
  }

  @Get()
  list() {
    return this.plantsService.findAll();
  }
}
