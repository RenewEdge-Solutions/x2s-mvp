import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Geolocation } from './geolocation.entity';
import { Facility, FacilityType } from './facility.entity';
import { Structure, StructureType, StructureUsage } from './structure.entity';

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
  async createStructure(dto: { facilityId: string; name: string; type: StructureType; size?: number; beds?: number; usage: StructureUsage; tents?: Array<{ widthFt: number; lengthFt: number }>; racks?: Array<{ widthCm: number; lengthCm: number; shelves: number }> }) {
    const facility = await this.facilities.findOneByOrFail({ id: dto.facilityId });
    // capacity guard for combined racks/tents usage and legacy tents-only
    let tents = dto.tents ?? null;
    let racks = dto.racks ?? null;
    const isCombo = dto.usage === 'Racks/Tents';
    if (dto.usage === 'Tents' || isCombo) {
      if (dto.type !== 'room') throw new Error('Racks/Tents usage is only allowed for rooms');
      const roomM2 = dto.size ?? 0;
      if (!roomM2 || roomM2 <= 0) throw new Error('Room size (m²) is required for this usage');
      const ftToM = (ft: number) => ft * 0.3048;
      const cmToM = (cm: number) => cm / 100;
      const tentArea = (tents || []).reduce((sum, t) => sum + (ftToM(Number(t.widthFt||0)) * ftToM(Number(t.lengthFt||0))), 0);
      // For racks, area is footprint on floor (ignore shelves for footprint)
      const rackArea = (racks || []).reduce((sum, r) => sum + (cmToM(Number(r.widthCm||0)) * cmToM(Number(r.lengthCm||0))), 0);
      if (tentArea + rackArea > roomM2 + 1e-6) throw new Error('Total tents+racks area exceeds room size');
    } else {
      racks = null;
      tents = null;
    }
    const s = this.structures.create({ name: dto.name, type: dto.type, size: dto.size ?? null, beds: dto.beds ?? null, usage: dto.usage, facility, tents, racks });
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
