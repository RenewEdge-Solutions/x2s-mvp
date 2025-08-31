import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { OccupancyService } from './occupancy.service';

@Controller('locations')
export class LocationsController {
  constructor(
    private svc: LocationsService,
    private occupancySvc: OccupancyService,
  ) {}

  // Geolocations
  @Get('geos') listGeos() { return this.svc.listGeos(); }
  @Post('geos') createGeo(@Body() body: { name: string; address?: string; lat?: number; lng?: number }) {
    return this.svc.createGeo(body);
  }
  @Put('geos/:id') updateGeo(@Param('id') id: string, @Body() body: { name: string; address?: string; lat?: number; lng?: number }) {
    return this.svc.updateGeo(id, body);
  }
  @Delete('geos/:id') deleteGeo(@Param('id') id: string) { return this.svc.deleteGeo(id); }

  // Facilities
  @Get('facilities/:geoId') listFacilities(@Param('geoId') geoId: string) { return this.svc.listFacilities(geoId); }
  @Post('facilities') createFacility(@Body() body: { geoId: string; name: string; type: 'farm' | 'building' }) {
    return this.svc.createFacility(body);
  }
  @Put('facilities/:id') updateFacility(@Param('id') id: string, @Body() body: { name: string; type: 'farm' | 'building' }) {
    return this.svc.updateFacility(id, body);
  }
  @Delete('facilities/:id') deleteFacility(@Param('id') id: string) { return this.svc.deleteFacility(id); }

  // Structures
  @Get('structures') listAllStructures() { return this.svc.listAllStructures(); }
  @Get('structures/:facilityId') listStructures(@Param('facilityId') facilityId: string) { return this.svc.listStructures(facilityId); }
  @Post('structures') createStructure(@Body() body: { facilityId: string; name: string; type: 'room' | 'greenhouse'; size?: number; beds?: number; usage: 'Vegetative' | 'Flowering' | 'Drying' | 'Storage' | 'Tents' | 'Racks/Tents'; tents?: Array<{ widthFt: number; lengthFt: number }>; racks?: Array<{ widthCm: number; lengthCm: number; shelves: number }> }) {
    return this.svc.createStructure(body);
  }
  @Put('structures/:id') updateStructure(@Param('id') id: string, @Body() body: { name: string; type: 'room' | 'greenhouse'; size?: number; beds?: number; usage: 'Vegetative' | 'Flowering' | 'Drying' | 'Storage' | 'Tents' | 'Racks/Tents'; tents?: Array<{ widthFt: number; lengthFt: number }>; racks?: Array<{ widthCm: number; lengthCm: number; shelves: number }> }) {
    return this.svc.updateStructure(id, body);
  }
  @Delete('structures/:id') deleteStructure(@Param('id') id: string) { return this.svc.deleteStructure(id); }

  // Reset helper
  @Post('reset') resetAll() { return this.svc.resetAll(); }

  // Occupancy endpoints
  @Get('occupancy') getAllOccupancy() { return this.occupancySvc.getAllOccupancy(); }
  @Get('occupancy/facility/:facilityId') getFacilityOccupancy(@Param('facilityId') facilityId: string) { 
    return this.occupancySvc.getFacilityOccupancy(facilityId); 
  }
  @Get('occupancy/structure/:structureId') getStructureOccupancy(@Param('structureId') structureId: string) { 
    return this.occupancySvc.getStructureOccupancy(structureId); 
  }
  @Get('occupancy/alerts') getEmptyCapacityAlerts() { 
    return this.occupancySvc.getEmptyCapacityAlerts(); 
  }
}
