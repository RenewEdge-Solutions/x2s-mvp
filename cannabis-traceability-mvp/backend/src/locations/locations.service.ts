import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Geolocation } from './geolocation.entity';
import { Facility, FacilityType } from './facility.entity';
import { Structure, StructureType } from './structure.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Geolocation) private geos: Repository<Geolocation>,
    @InjectRepository(Facility) private facilities: Repository<Facility>,
    @InjectRepository(Structure) private structures: Repository<Structure>,
  ) {}

  // Geolocations
  listGeos() { return this.geos.find({ order: { name: 'ASC' } }); }
  async createGeo(dto: { name: string; address?: string; lat?: number; lng?: number }) {
    const g = this.geos.create({ name: dto.name, address: dto.address ?? null, lat: dto.lat ?? null, lng: dto.lng ?? null });
    return this.geos.save(g);
  }
  async deleteGeo(id: string) { await this.geos.delete(id); }

  // Facilities
  listFacilities(geoId: string) { return this.facilities.find({ where: { geo: { id: geoId } as any }, order: { name: 'ASC' }, relations: ['geo'] }); }
  async createFacility(dto: { geoId: string; name: string; type: FacilityType }) {
    const geo = await this.geos.findOneByOrFail({ id: dto.geoId });
    const f = this.facilities.create({ name: dto.name, type: dto.type, geo });
    return this.facilities.save(f);
  }
  async deleteFacility(id: string) { await this.facilities.delete(id); }

  // Structures
  listStructures(facilityId: string) { return this.structures.find({ where: { facility: { id: facilityId } as any }, order: { name: 'ASC' }, relations: ['facility'] }); }
  async createStructure(dto: { facilityId: string; name: string; type: StructureType; size?: number }) {
    const facility = await this.facilities.findOneByOrFail({ id: dto.facilityId });
    const s = this.structures.create({ name: dto.name, type: dto.type, size: dto.size ?? null, facility });
    return this.structures.save(s);
  }
  async deleteStructure(id: string) { await this.structures.delete(id); }

  // Reset helper (for MVP)
  async resetAll() {
    await this.structures.delete({});
    await this.facilities.delete({});
    await this.geos.delete({});
  }
}
