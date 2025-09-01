import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  create(@Body() body: {
    type: string;
    subtype: string;
    details: Record<string, string>;
    location: string;
    structureId?: string;
    iotDevice?: string;
  }) {
    return this.equipmentService.create(body);
  }

  @Get()
  list() {
    return this.equipmentService.findAll();
  }

  @Get('location/:location')
  findByLocation(@Param('location') location: string) {
    return this.equipmentService.findByLocation(location);
  }
  
  @Get('structure/:structureId')
  findByStructureId(@Param('structureId') structureId: string) {
    return this.equipmentService.findByStructureId(structureId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: {
    type: string;
    subtype: string;
    details: Record<string, string>;
    location: string;
    structureId?: string;
    iotDevice?: string;
  }) {
    return this.equipmentService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.equipmentService.delete(id);
  }
}
