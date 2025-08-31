import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Structure } from './structure.entity';
import { Plant } from '../plants/plant.entity';

export interface OccupancyStats {
  structureId: string;
  structureName: string;
  structureType: 'room' | 'greenhouse';
  facilityId: string;
  facilityName: string;
  
  // Total capacity
  totalBeds?: number;
  totalTents?: number;
  totalRacks?: number;
  totalRackShelves?: number;
  
  // Current occupancy
  occupiedBeds?: number;
  occupiedTents?: number;
  occupiedRacks?: number;
  occupiedRackShelves?: number;
  totalPlants: number;
  
  // Calculated metrics
  occupancyRate: number; // 0-1
  availableCapacity: number;
  isOverCapacity: boolean;
  isEmpty: boolean;
}

export interface FacilityOccupancy {
  facilityId: string;
  facilityName: string;
  facilityType: 'farm' | 'building';
  structures: OccupancyStats[];
  totalCapacity: number;
  totalOccupied: number;
  occupancyRate: number;
  emptyStructures: number;
}

@Injectable()
export class OccupancyService {
  constructor(
    @InjectRepository(Structure) private structures: Repository<Structure>,
    @InjectRepository(Plant) private plants: Repository<Plant>,
  ) {}

  async getStructureOccupancy(structureId: string): Promise<OccupancyStats | null> {
    const structure = await this.structures.findOne({
      where: { id: structureId },
      relations: ['facility'],
    });

    if (!structure) return null;

    return this.calculateStructureOccupancy(structure);
  }

  async getFacilityOccupancy(facilityId: string): Promise<FacilityOccupancy | null> {
    const structures = await this.structures.find({
      where: { facility: { id: facilityId } },
      relations: ['facility'],
    });

    if (structures.length === 0) return null;

    const facility = structures[0].facility;
    const structureStats = await Promise.all(
      structures.map(s => this.calculateStructureOccupancy(s))
    );

    const totalCapacity = structureStats.reduce((sum, stats) => {
      if (stats.structureType === 'greenhouse') {
        return sum + (stats.totalBeds || 0);
      } else {
        return sum + (stats.totalTents || 0) + (stats.totalRackShelves || 0);
      }
    }, 0);

    const totalOccupied = structureStats.reduce((sum, stats) => sum + stats.totalPlants, 0);
    const emptyStructures = structureStats.filter(s => s.isEmpty).length;

    return {
      facilityId: facility.id,
      facilityName: facility.name,
      facilityType: facility.type,
      structures: structureStats,
      totalCapacity,
      totalOccupied,
      occupancyRate: totalCapacity > 0 ? totalOccupied / totalCapacity : 0,
      emptyStructures,
    };
  }

  async getAllOccupancy(): Promise<FacilityOccupancy[]> {
    const structures = await this.structures.find({
      relations: ['facility'],
    });

    // Group by facility
    const facilityMap = new Map<string, any>();
    structures.forEach(structure => {
      const facilityId = structure.facility.id;
      if (!facilityMap.has(facilityId)) {
        facilityMap.set(facilityId, {
          facility: structure.facility,
          structures: [],
        });
      }
      facilityMap.get(facilityId).structures.push(structure);
    });

    const results: FacilityOccupancy[] = [];
    for (const { facility, structures: facilityStructures } of facilityMap.values()) {
      const structureStats = await Promise.all(
        facilityStructures.map((s: Structure) => this.calculateStructureOccupancy(s))
      );

      const totalCapacity = structureStats.reduce((sum, stats) => {
        if (stats.structureType === 'greenhouse') {
          return sum + (stats.totalBeds || 0);
        } else {
          return sum + (stats.totalTents || 0) + (stats.totalRackShelves || 0);
        }
      }, 0);

      const totalOccupied = structureStats.reduce((sum, stats) => sum + stats.totalPlants, 0);
      const emptyStructures = structureStats.filter(s => s.isEmpty).length;

      results.push({
        facilityId: facility.id,
        facilityName: facility.name,
        facilityType: facility.type,
        structures: structureStats,
        totalCapacity,
        totalOccupied,
        occupancyRate: totalCapacity > 0 ? totalOccupied / totalCapacity : 0,
        emptyStructures,
      });
    }

    return results;
  }

  async getEmptyCapacityAlerts(): Promise<{
    emptyStructures: OccupancyStats[];
    lowUtilizationStructures: OccupancyStats[];
    overCapacityStructures: OccupancyStats[];
  }> {
    const allOccupancy = await this.getAllOccupancy();
    const allStructures = allOccupancy.flatMap(f => f.structures);

    const emptyStructures = allStructures.filter(s => s.isEmpty);
    const lowUtilizationStructures = allStructures.filter(s => 
      !s.isEmpty && s.occupancyRate < 0.3 && s.totalPlants > 0
    );
    const overCapacityStructures = allStructures.filter(s => s.isOverCapacity);

    return {
      emptyStructures,
      lowUtilizationStructures,
      overCapacityStructures,
    };
  }

  private async calculateStructureOccupancy(structure: Structure): Promise<OccupancyStats> {
    // Get all active plants in this structure
    const facilityName = structure.facility.name;
    
    // Plants are stored with location like "Indoor Room 1 - Main Facility" or "Greenhouse 1 - Main Facility"
    const locationPrefix = structure.type === 'room' 
      ? `Indoor ${structure.name.replace(/^Indoor\s+/i, '')}`
      : structure.name.match(/^Greenhouse\s+/i) ? structure.name : `Greenhouse ${structure.name.replace(/^Greenhouse\s+/i, '')}`;
    
    const structureLocationKey = `${locationPrefix} - ${facilityName}`;
    
    const plantsInStructure = await this.plants.find({
      where: { harvested: false },
    });

    // Filter plants that belong to this structure
    const structurePlants = plantsInStructure.filter(plant => 
      plant.location.startsWith(structureLocationKey)
    );

    // Calculate capacity based on structure type
    let totalCapacity = 0;
    let totalBeds: number | undefined;
    let totalTents: number | undefined;
    let totalRacks: number | undefined;
    let totalRackShelves: number | undefined;

    if (structure.type === 'greenhouse') {
      totalBeds = structure.beds || 0;
      totalCapacity = totalBeds;
    } else {
      // Room type
      if (structure.tents && structure.tents.length > 0) {
        totalTents = structure.tents.length;
        totalCapacity += totalTents;
      }
      
      if (structure.racks && structure.racks.length > 0) {
        totalRacks = structure.racks.length;
        totalRackShelves = structure.racks.reduce((sum, rack) => sum + (rack.shelves || 0), 0);
        totalCapacity += totalRackShelves;
      }
      
      // If no specific tents/racks, consider the general room capacity
      if (!totalTents && !totalRacks) {
        // Estimate capacity based on room size (rough estimate: 1 plant per m²)
        totalCapacity = Math.floor(structure.size || 0);
      }
    }

    // Calculate occupancy by location specifics
    let occupiedBeds: number | undefined;
    let occupiedTents: number | undefined;
    let occupiedRacks: number | undefined;
    let occupiedRackShelves: number | undefined;

    if (structure.type === 'greenhouse') {
      // Count plants by bed
      const bedOccupancy = new Set<string>();
      structurePlants.forEach(plant => {
        const locationParts = plant.location.split(' - ');
        if (locationParts.length > 1) {
          const sublocation = locationParts[1];
          if (sublocation && sublocation.startsWith('Bed ')) {
            bedOccupancy.add(sublocation);
          }
        }
      });
      occupiedBeds = bedOccupancy.size;
    } else {
      // Room type - count by tents and racks
      const tentOccupancy = new Set<string>();
      const rackOccupancy = new Set<string>();
      
      structurePlants.forEach(plant => {
        const locationParts = plant.location.split(' - ');
        if (locationParts.length > 1) {
          const sublocation = locationParts[1];
          if (sublocation) {
            if (sublocation.startsWith('Tent ')) {
              tentOccupancy.add(sublocation);
            } else if (sublocation.startsWith('Rack ')) {
              rackOccupancy.add(sublocation);
            }
          }
        }
      });
      
      occupiedTents = tentOccupancy.size;
      occupiedRacks = rackOccupancy.size;
      occupiedRackShelves = occupiedRacks; // Simplified: assume 1 shelf per rack is occupied
    }

    const totalPlants = structurePlants.length;
    const occupancyRate = totalCapacity > 0 ? totalPlants / totalCapacity : 0;
    const availableCapacity = Math.max(0, totalCapacity - totalPlants);
    const isOverCapacity = totalPlants > totalCapacity;
    const isEmpty = totalPlants === 0;

    return {
      structureId: structure.id,
      structureName: structure.name,
      structureType: structure.type,
      facilityId: structure.facility.id,
      facilityName: structure.facility.name,
      totalBeds,
      totalTents,
      totalRacks,
      totalRackShelves,
      occupiedBeds,
      occupiedTents,
      occupiedRacks,
      occupiedRackShelves,
      totalPlants,
      occupancyRate,
      availableCapacity,
      isOverCapacity,
      isEmpty,
    };
  }
}
