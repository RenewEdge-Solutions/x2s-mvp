import { Body, Controller, Get, Post, Put, Param, Delete } from '@nestjs/common';
import { PlantsService } from './plants.service';
import { PlantStage } from './plant.entity';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post()
  create(@Body() body: { strain: string; location: string; by?: string }) {
    return this.plantsService.create(body);
  }

  @Post('germinate')
  germinate(@Body() body: { seedId: string; strain: string; location: string; by?: string }) {
    return this.plantsService.germinateFromSeed(body);
  }

  @Get()
  list() {
    return this.plantsService.findAll();
  }

  @Put(':id/relocate')
  relocate(@Param('id') id: string, @Body() body: { location: string }) {
    return this.plantsService.relocate(id, body.location);
  }

  @Put(':id/flip')
  flip(@Param('id') id: string) {
    return this.plantsService.flip(id);
  }

  @Put(':id/harvest')
  harvest(@Param('id') id: string) {
    return this.plantsService.harvest(id);
  }

  @Put(':id/dry')
  dry(@Param('id') id: string) {
    return this.plantsService.dry(id);
  }

  @Put(':id/dried')
  markDried(@Param('id') id: string) {
    return this.plantsService.markDried(id);
  }

  @Put(':id/stage')
  changeStage(@Param('id') id: string, @Body() body: { stage: PlantStage }) {
    return this.plantsService.changeStage(id, body.stage);
  }

  @Delete(':id')
  deletePlant(@Param('id') id: string, @Body() body: { reason: string; by?: string }) {
    return this.plantsService.deletePlant(id, body.reason, body.by);
  }
}
