import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';

interface Plant {
  id: string;
  strain: string;
  location: string;
  plantedAt: string;
  stage: string;
  stageChangedAt: string | null;
  flippedAt: string | null;
  harvestedAt: string | null;
  driedAt: string | null;
  harvested: boolean;
}

interface Seed {
  id: string;
  name: string;
  strain: string;
  quantity: number;
  type: string;
}

interface Location {
  id: string;
  name: string;
  type: string;
}

// Plant stage enum to match backend
enum PlantStage {
  SEED = 'seed',
  GERMINATION = 'germination',
  SEEDLING = 'seedling',
  VEGETATIVE = 'vegetative',
  FLOWERING = 'flowering',
  HARVEST = 'harvest',
  DRYING = 'drying',
  DRIED = 'dried',
  CURED = 'cured'
}

const getStageColor = (stage: string): string => {
  const colors: { [key: string]: string } = {
    [PlantStage.SEED]: 'bg-gray-100 text-gray-800',
    [PlantStage.GERMINATION]: 'bg-yellow-100 text-yellow-800',
    [PlantStage.SEEDLING]: 'bg-green-100 text-green-800',
    [PlantStage.VEGETATIVE]: 'bg-blue-100 text-blue-800',
    [PlantStage.FLOWERING]: 'bg-purple-100 text-purple-800',
    [PlantStage.HARVEST]: 'bg-orange-100 text-orange-800',
    [PlantStage.DRYING]: 'bg-amber-100 text-amber-800',
    [PlantStage.DRIED]: 'bg-brown-100 text-brown-800',
    [PlantStage.CURED]: 'bg-indigo-100 text-indigo-800'
  };
  return colors[stage] || 'bg-gray-100 text-gray-800';
};

const getDaysInStage = (stageChangedAt: string | null, plantedAt: string): number => {
  const stageStart = stageChangedAt ? new Date(stageChangedAt) : new Date(plantedAt);
  const now = new Date();
  return Math.floor((now.getTime() - stageStart.getTime()) / (1000 * 60 * 60 * 24));
};

const getEstimatedDaysToFlip = (plant: Plant): number | null => {
  if (plant.stage !== PlantStage.VEGETATIVE) return null;
  const daysInVeg = getDaysInStage(plant.stageChangedAt, plant.plantedAt);
  return Math.max(0, 42 - daysInVeg); // 6 weeks typical veg period
};

const canPerformAction = (plant: Plant, action: string): boolean => {
  switch (action) {
    case 'toSeedling':
      return plant.stage === PlantStage.GERMINATION;
    case 'toVegetative':
      return plant.stage === PlantStage.SEEDLING;
    case 'flip':
      return plant.stage === PlantStage.VEGETATIVE;
    case 'harvest':
      return plant.stage === PlantStage.FLOWERING;
    case 'dry':
      return plant.stage === PlantStage.HARVEST;
    case 'dried':
      return plant.stage === PlantStage.DRYING;
    default:
      return true; // relocate and delete can always be done
  }
};

function Plants() {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [seedSearch, setSeedSearch] = useState('');
  const [plantSearch, setPlantSearch] = useState('');
  const [seedSort, setSeedSort] = useState('name');
  const [plantSort, setPlantSort] = useState('plantedAt');
  const [seedFilter, setSeedFilter] = useState('all');
  const [plantFilter, setPlantFilter] = useState('all');
  const [isGerminateModalOpen, setIsGerminateModalOpen] = useState(false);
  const [isRelocateModalOpen, setIsRelocateModalOpen] = useState(false);
  const [isFlipModalOpen, setIsFlipModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTentRack, setSelectedTentRack] = useState('');
  const [selectedShelf, setSelectedShelf] = useState('');

  const [germinateQuantity, setGerminateQuantity] = useState(1);

  // Debug: log locations when germinate modal opens
  React.useEffect(() => {
    if (isGerminateModalOpen) {
      // eslint-disable-next-line no-console
      console.log('DEBUG locations:', locations);
    }
  }, [isGerminateModalOpen, locations]);

  // Debug: log locations when germinate modal opens
  useEffect(() => {
    if (isGerminateModalOpen) {
      // eslint-disable-next-line no-console
      console.log('DEBUG locations:', locations);
    }
  }, [isGerminateModalOpen, locations]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [seedsData, plantsData, locationsData] = await Promise.all([
        api.getInventoryItems(),
        api.getPlants(),
        api.getAllStructures()
      ]);
      
      // Filter for seeds only - check multiple possible properties
      const seedItems = seedsData.filter((item: any) => 
        item.type === 'seed' || 
        item.itemType === 'seed' ||
        item.category === 'Seeds' || 
        item.subcategory === 'Seeds' ||
        item.name.toLowerCase().includes('seed')
      );
      setSeeds(seedItems);
      
  // Filter plants to exclude those still in seed stage (only show plants that have started germination)
  const activePlants = (plantsData as Plant[]).filter((plant) => plant.stage !== PlantStage.SEED);
  setPlants(activePlants);
      
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Filtered and sorted seeds
  const filteredSeeds = useMemo(() => {
    return seeds
      .filter(seed => {
        const matchesSearch = seed.name.toLowerCase().includes(seedSearch.toLowerCase()) ||
                            seed.strain.toLowerCase().includes(seedSearch.toLowerCase());
        const matchesFilter = seedFilter === 'all' || seed.strain === seedFilter;
        return matchesSearch && matchesFilter && seed.quantity > 0;
      })
      .sort((a, b) => {
        switch (seedSort) {
          case 'name': return a.name.localeCompare(b.name);
          case 'strain': return a.strain.localeCompare(b.strain);
          case 'quantity': return b.quantity - a.quantity;
          default: return 0;
        }
      });
  }, [seeds, seedSearch, seedFilter, seedSort]);

  // Filtered and sorted plants grouped by location
  const filteredPlantsGrouped = useMemo(() => {
    const filtered = plants
      .filter(plant => {
        const matchesSearch = plant.strain.toLowerCase().includes(plantSearch.toLowerCase()) ||
                            plant.location.toLowerCase().includes(plantSearch.toLowerCase());
        const matchesFilter = plantFilter === 'all' || plant.stage === plantFilter;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (plantSort) {
          case 'strain': return a.strain.localeCompare(b.strain);
          case 'location': return a.location.localeCompare(b.location);
          case 'stage': return a.stage.localeCompare(b.stage);
          case 'plantedAt': return new Date(b.plantedAt).getTime() - new Date(a.plantedAt).getTime();
          default: return 0;
        }
      });

    // Group by location
    const grouped: { [key: string]: Plant[] } = {};
    filtered.forEach(plant => {
      if (!grouped[plant.location]) {
        grouped[plant.location] = [];
      }
      grouped[plant.location].push(plant);
    });

    return grouped;
  }, [plants, plantSearch, plantFilter, plantSort]);

  const handleGerminateSeed = async () => {
    if (!selectedSeed || !selectedLocation || germinateQuantity < 1) return;
    // Compose location string
    let locationString = selectedLocation;
    if (selectedTentRack) locationString += `/${selectedTentRack}`;
    if (selectedShelf) locationString += `/${selectedShelf}`;
    try {
      // Call backend once with the total quantity
      await api.germinateFromSeed({
        seedId: selectedSeed.id,
        strain: selectedSeed.name,
        location: locationString,
        by: 'operator',
        quantity: germinateQuantity,
      });
      await loadData();
      setIsGerminateModalOpen(false);
      setSelectedSeed(null);
      setSelectedLocation('');
      setSelectedTentRack('');
      setSelectedShelf('');
      setGerminateQuantity(1);
    } catch (error) {
      console.error('Error germinating seed:', error);
      alert('Failed to germinate seed. Please try again.');
    }
  };

  const handleRelocate = async () => {
    if (!selectedPlant || !selectedLocation) return;
    
    try {
      await api.relocatePlant(selectedPlant.id, selectedLocation);
      await loadData();
      setIsRelocateModalOpen(false);
      setSelectedPlant(null);
      setSelectedLocation('');
    } catch (error) {
      console.error('Error relocating plant:', error);
    }
  };

  const handleFlip = async () => {
    if (!selectedPlant) return;
    
    try {
      await api.flipPlant(selectedPlant.id);
      await loadData();
      setIsFlipModalOpen(false);
      setSelectedPlant(null);
    } catch (error) {
      console.error('Error flipping plant:', error);
      alert('Error: ' + (error as any).message);
    }
  };

  const handleHarvest = async () => {
    if (!selectedPlant) return;
    
    try {
      await api.harvestPlant(selectedPlant.id);
      await loadData();
      setIsHarvestModalOpen(false);
      setSelectedPlant(null);
    } catch (error) {
      console.error('Error harvesting plant:', error);
      alert('Error: ' + (error as any).message);
    }
  };

  const handleToSeedling = async (plant: Plant) => {
    try {
      await api.changePlantStage(plant.id, PlantStage.SEEDLING);
      await loadData();
    } catch (error) {
      console.error('Error transitioning plant to seedling:', error);
      alert('Error: ' + (error as any).message);
    }
  };

  const handleToVegetative = async (plant: Plant) => {
    try {
      await api.changePlantStage(plant.id, PlantStage.VEGETATIVE);
      await loadData();
    } catch (error) {
      console.error('Error transitioning plant to vegetative:', error);
      alert('Error: ' + (error as any).message);
    }
  };

  const handleDeletePlant = async () => {
    if (!selectedPlant || !deleteReason.trim()) return;
    
    try {
      await api.deletePlant(selectedPlant.id, deleteReason, 'operator');
      await loadData();
      setIsDeleteModalOpen(false);
      setSelectedPlant(null);
      setDeleteReason('');
    } catch (error) {
      console.error('Error deleting plant:', error);
      alert('Error: ' + (error as any).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Plants Overview</h1>
      </div>

      {/* Available Seeds Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Available Seeds</h2>
        <div className="mb-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search seeds..."
            value={seedSearch}
            onChange={(e) => setSeedSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={seedSort}
            onChange={(e) => setSeedSort(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="strain">Sort by Strain</option>
            <option value="quantity">Sort by Quantity</option>
          </select>
          <select
            value={seedFilter}
            onChange={(e) => setSeedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Strains</option>
            {Array.from(new Set(seeds.map(s => s.strain))).map((strain, idx) => (
              <option key={strain || idx} value={strain}>{strain}</option>
            ))}
          </select>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-800">
            🌱 Available Seeds ({filteredSeeds.length} varieties)
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSeeds.map((seed) => (
                  <tr key={seed.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seed.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seed.strain}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seed.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedSeed(seed);
                          setIsGerminateModalOpen(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Germinate Seed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Active Plants Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Active Plants</h2>
        <div className="mb-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search plants..."
            value={plantSearch}
            onChange={(e) => setPlantSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={plantSort}
            onChange={(e) => setPlantSort(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="plantedAt">Sort by Planted Date</option>
            <option value="strain">Sort by Strain</option>
            <option value="location">Sort by Location</option>
            <option value="stage">Sort by Stage</option>
          </select>
          <select
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            {Object.values(PlantStage).map(stage => (
              <option key={stage} value={stage}>{stage.charAt(0).toUpperCase() + stage.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="space-y-6">
          {Object.entries(filteredPlantsGrouped).map(([location, locationPlants]) => (
            <div key={location} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-800">
                📍 {location} ({locationPlants.length} plants)
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strain</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days in Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locationPlants.map((plant) => {
                      const daysInStage = getDaysInStage(plant.stageChangedAt, plant.plantedAt);
                      const daysToFlip = getEstimatedDaysToFlip(plant);
                      
                      return (
                        <tr key={plant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plant.strain}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(plant.stage)}`}>
                              {plant.stage.charAt(0).toUpperCase() + plant.stage.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {daysInStage} days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {plant.stage === PlantStage.VEGETATIVE && daysToFlip !== null && (
                              <span className="text-blue-600">
                                ~{daysToFlip} days to flip
                              </span>
                            )}
                            {plant.flippedAt && (
                              <span className="text-purple-600">
                                Flipped {Math.floor((new Date().getTime() - new Date(plant.flippedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(plant.plantedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {/* Relocate - always available */}
                            <button
                              onClick={() => {
                                setSelectedPlant(plant);
                                setIsRelocateModalOpen(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                            >
                              Relocate
                            </button>
                            
                            {/* Stage-specific progression buttons */}
                            {canPerformAction(plant, 'toSeedling') && (
                              <button
                                onClick={() => handleToSeedling(plant)}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                              >
                                To Seedling
                              </button>
                            )}
                            
                            {canPerformAction(plant, 'toVegetative') && (
                              <button
                                onClick={() => handleToVegetative(plant)}
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                              >
                                To Vegetative
                              </button>
                            )}
                            
                            {canPerformAction(plant, 'flip') && (
                              <button
                                onClick={() => {
                                  setSelectedPlant(plant);
                                  setIsFlipModalOpen(true);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
                              >
                                Flip to Flowering
                              </button>
                            )}
                            
                            {canPerformAction(plant, 'harvest') && (
                              <button
                                onClick={() => {
                                  setSelectedPlant(plant);
                                  setIsHarvestModalOpen(true);
                                }}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
                              >
                                Harvest
                              </button>
                            )}
                            
                            {/* Delete - always available */}
                            <button
                              onClick={() => {
                                setSelectedPlant(plant);
                                setIsDeleteModalOpen(true);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Germinate Modal */}
      {isGerminateModalOpen && (
        <>
          {/* DEBUG: List all tent/rack names and their parsed parent for troubleshooting */}
          <div style={{background:'#fffbe6',color:'#b36b00',padding:'8px',marginBottom:'8px',fontSize:'12px'}}>
            <b>DEBUG tent/rack parent parse:</b>
            <ul>
              {locations.filter(l => l.type==='tent'||l.type==='rack').map(l => {
                const parts = l.name.split('/');
                return <li key={l.id}>{l.name} → parent: {parts.slice(0,-1).join('/')}</li>;
              })}
            </ul>
          </div>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Germinate Seed</h3>
            <p className="text-gray-600 mb-4">
              Germinating: {selectedSeed?.name}
              {selectedSeed?.strain ? ` (${selectedSeed.strain})` : ''}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Germinate
              </label>
              <input
                type="number"
                min="1"
                max={selectedSeed?.quantity || 1}
                value={germinateQuantity}
                onChange={(e) => setGerminateQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Available: {selectedSeed?.quantity} seeds
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Location
              </label>
              {/* First dropdown: Greenhouse/Room only */}
              <select
                value={selectedLocation}
                onChange={e => {
                  setSelectedLocation(e.target.value);
                  setSelectedTentRack('');
                  setSelectedShelf('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="">Choose a greenhouse or room...</option>
                {locations
                  .filter((location) =>
                    (location.type === 'greenhouse' || location.type === 'room') &&
                    !location.name.toLowerCase().includes('storage') &&
                    !location.name.toLowerCase().includes('drying')
                  )
                  .map((location) => (
                    <option key={location.id || location.name} value={location.name}>
                      {location.name} ({location.type})
                    </option>
                  ))}
              </select>
              {/* Third dropdown: Shelf if available under selectedTentRack */}
              {selectedLocation && selectedTentRack && (
                <select
                  value={selectedShelf}
                  onChange={e => setSelectedShelf(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{`Choose shelf in ${selectedTentRack} (optional)`}</option>
                  {locations
                    .filter((location) =>
                      location.type === 'shelf' &&
                      location.name.startsWith(selectedLocation + '/' + selectedTentRack + '/')
                    )
                    .map((location) => {
                      const value = location.name.replace(selectedLocation + '/' + selectedTentRack + '/', '');
                      return (
                        <option key={location.id || value} value={value}>
                          {value} (shelf)
                        </option>
                      );
                    })}
                </select>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleGerminateSeed}
                disabled={!selectedLocation}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-md"
              >
                Germinate
              </button>
              <button
                onClick={() => {
                  setIsGerminateModalOpen(false);
                  setSelectedSeed(null);
                  setSelectedLocation('');
                  setSelectedTentRack('');
                  setSelectedShelf('');
                  setGerminateQuantity(1);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Relocate Modal */}
      {isRelocateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Relocate Plant</h3>
            <p className="text-gray-600 mb-4">
              Relocating: {selectedPlant?.strain} from {selectedPlant?.location}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a location...</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.name}>
                    {location.name} ({location.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleRelocate}
                disabled={!selectedLocation}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-md"
              >
                Relocate
              </button>
              <button
                onClick={() => {
                  setIsRelocateModalOpen(false);
                  setSelectedPlant(null);
                  setSelectedLocation('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flip Modal */}
      {isFlipModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Flip to Flowering</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to flip {selectedPlant?.strain} to flowering stage?
            </p>
            <p className="text-sm text-gray-500 mb-4">
              This will change the light cycle to 12/12 and start the flowering period.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleFlip}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
              >
                Flip to Flowering
              </button>
              <button
                onClick={() => {
                  setIsFlipModalOpen(false);
                  setSelectedPlant(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Harvest Modal */}
      {isHarvestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Harvest Plant</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to harvest {selectedPlant?.strain}?
            </p>
            <p className="text-sm text-gray-500 mb-4">
              This will mark the plant as harvested and ready for drying.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleHarvest}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md"
              >
                Harvest
              </button>
              <button
                onClick={() => {
                  setIsHarvestModalOpen(false);
                  setSelectedPlant(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Plant Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Plant</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete {selectedPlant?.strain}?
            </p>
            <p className="text-sm text-red-500 mb-4">
              This action cannot be undone. Please provide a reason for deletion.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Deletion
              </label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a reason...</option>
                <option value="Sickness/Disease">Sickness/Disease</option>
                <option value="Dying Plant">Dying Plant</option>
                <option value="Natural Disaster">Natural Disaster</option>
                <option value="Pest Infestation">Pest Infestation</option>
                <option value="Poor Growth">Poor Growth</option>
                <option value="Contamination">Contamination</option>
                <option value="Space Management">Space Management</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleDeletePlant}
                disabled={!deleteReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-md"
              >
                Delete Plant
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedPlant(null);
                  setDeleteReason('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plants;
