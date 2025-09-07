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

export interface CapacityAlerts {
  emptyStructures: OccupancyStats[];
  lowUtilizationStructures: OccupancyStats[];
  overCapacityStructures: OccupancyStats[];
}
