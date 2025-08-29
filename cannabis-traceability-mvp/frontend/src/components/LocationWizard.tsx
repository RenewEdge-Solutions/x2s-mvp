import React from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Factory, Building2, Sprout, Layers, Plus, Minus, Trash2, PlusCircle, Wifi } from 'lucide-react';
import { loadGoogleMaps } from '../lib/maps';

export type RoomUsage = 'drying' | 'storage' | 'fruiting' | 'veg' | 'nursing' | 'tent';
export type GreenhouseUsage = 'nursing' | 'veg' | 'fruiting';

// Device typing for Equipment step
type DeviceType =
  | 'Light'
  | 'Fan'
  | 'Dehumidifier'
  | 'AC'
  | 'Heater'
  | 'Irrigation Controller'
  | 'Temp Sensor'
  | 'Humidity Sensor'
  | 'CO2 Sensor'
  | 'pH Sensor'
  | 'EC Sensor'
  | 'PAR Sensor'
  | 'Camera';

type DeviceField = { key: string; label: string; input: 'text' | 'number' | 'select'; options?: string[] };
type DeviceSchema = { fields: DeviceField[] };
const DEVICE_SCHEMAS: Record<DeviceType, DeviceSchema> = {
  Light: {
    fields: [
      { key: 'technology', label: 'Technology', input: 'select', options: ['LED', 'HPS', 'CMH', 'Fluorescent'] },
      { key: 'powerW', label: 'Power (W)', input: 'number' },
      { key: 'spectrum', label: 'Spectrum', input: 'select', options: ['Full', 'Veg', 'Fruiting'] },
    ],
  },
  Fan: {
    fields: [
  { key: 'diameterCm', label: 'Diameter (cm)', input: 'number' },
    ],
  },
  Dehumidifier: {
    fields: [
      { key: 'capacityLph', label: 'Capacity (L/h)', input: 'number' },
    ],
  },
  AC: {
    fields: [
  { key: 'capacityKw', label: 'Capacity (kW)', input: 'number' },
    ],
  },
  Heater: {
    fields: [
      { key: 'powerW', label: 'Power (W / equiv.)', input: 'number' },
    ],
  },
  'Irrigation Controller': {
    fields: [],
  },
  'Temp Sensor': {
    fields: [
      { key: 'accuracyC', label: 'Accuracy (±°C)', input: 'number' },
    ],
  },
  'Humidity Sensor': {
    fields: [
      { key: 'accuracyPct', label: 'Accuracy (±%RH)', input: 'number' },
    ],
  },
  'CO2 Sensor': {
    fields: [
      { key: 'accuracyPpm', label: 'Accuracy (±ppm)', input: 'number' },
    ],
  },
  'pH Sensor': {
    fields: [
  { key: 'accuracyPh', label: 'Accuracy (±pH)', input: 'number' },
    ],
  },
  'EC Sensor': {
    fields: [
  { key: 'accuracyMs', label: 'Accuracy (±mS/cm)', input: 'number' },
    ],
  },
  'PAR Sensor': {
    fields: [
      { key: 'rangeUmol', label: 'Range (µmol/m²/s)', input: 'text' },
      { key: 'accuracy', label: 'Accuracy', input: 'text' },
    ],
  },
  Camera: {
    fields: [
  { key: 'location', label: 'Location', input: 'select', options: ['Door', 'Entrance', 'Exit', 'Window 1', 'Window 2', 'Desk 1', 'Desk 2', 'Hallway', 'Aisle', 'Perimeter'] },
  { key: 'nightVision', label: 'Night Vision', input: 'select', options: ['yes', 'no'] },
    ],
  },
};
type Device = {
  id: string;
  name: string;
  type: DeviceType;
  attributes: Record<string, string>;
  // Mock IoT linking state
  iotConnected?: boolean;
  iotDeviceId?: string | null;
};

export type NewLocation = {
  geolocation: string; // e.g., Roseau, Bellevue Chopin
  formattedAddress?: string; // full address if verified
  latLng?: { lat: number; lng: number }; // optional coordinates when picked or resolved
  facilityKind: 'Farm' | 'Building';
  facilityName: string; // e.g., Farm, Building 1
  structureType: 'greenhouse' | 'room' | 'tent';
  structureName: string; // e.g., Greenhouse 4 or Room 2
  usage?: RoomUsage | GreenhouseUsage; // required when structureType = 'room' or 'greenhouse'
  roomAreaSqm?: number; // for individual rooms
  rooms?: Array<{ name: string; areaSqm: number; usage: RoomUsage }>; // for Building with multiple rooms
  // Greenhouse details
  greenhouseAreaSqm?: number; // how big is the greenhouse
  greenhouseBeds?: number; // how many beds it has
  greenhousePlantCapacity?: number; // how many plants fit inside (total)
  // Tents details
  tentCount?: number;
  plantsPerTent?: number;
  // New for MVP mock
  tentSizeSqm?: number;
  equipment?: string[];
  iotDevices?: Array<{ name: string; connected: boolean }>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (loc: NewLocation | NewLocation[]) => void;
  initial?: Partial<NewLocation>;
};

export default function LocationWizard({ open, onClose, onCreate, initial }: Props) {
  const [step, setStep] = React.useState(1);
  const [geolocation, setGeolocation] = React.useState(initial?.geolocation ?? '');
  const [formattedAddress, setFormattedAddress] = React.useState<string | undefined>(initial?.formattedAddress);
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | undefined>(initial?.latLng);
  const [mapsReady, setMapsReady] = React.useState(false);
  const [mapsError, setMapsError] = React.useState<string | null>(null);
  const [useMapPicker, setUseMapPicker] = React.useState(false);
  const autoInputRef = React.useRef<HTMLInputElement | null>(null);
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<google.maps.Map | null>(null);
  const markerRef = React.useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const hasEnvKey = Boolean((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY);
  const forceMockMaps = !hasEnvKey || String((import.meta as any).env?.VITE_MOCK_MAPS).toLowerCase() === 'true' || String((import.meta as any).env?.VITE_MOCK_MAPS) === '1';
  const [hasFarm, setHasFarm] = React.useState<boolean>(initial?.facilityKind ? initial.facilityKind === 'Farm' : true);
  const [hasBuilding, setHasBuilding] = React.useState<boolean>(initial?.facilityKind ? initial.facilityKind === 'Building' : false);
  const [farmName, setFarmName] = React.useState<string>(initial?.facilityKind === 'Farm' ? (initial.facilityName ?? 'Farm') : 'Farm');
  const [buildingName, setBuildingName] = React.useState<string>(initial?.facilityKind === 'Building' ? (initial.facilityName ?? 'Building 1') : 'Building 1');
  const [greenhouseCount, setGreenhouseCount] = React.useState<string>('');
  const [roomCount, setRoomCount] = React.useState<string>('');
  type Unit = {
    type: 'greenhouse' | 'room';
    name: string;
    usage?: RoomUsage | GreenhouseUsage;
    area?: string; // numeric string in m² for non-tent
    // Tent dimensions in feet when usage === 'tent'
  tentWidthFt?: string; // legacy single-tent fields (kept to avoid losing user input)
  tentLengthFt?: string;
  tents?: Array<{ widthFt: string; lengthFt: string; equipment?: Record<string, boolean>; iot?: Record<string, boolean>; devices?: Device[] }>; // multiple tents inside a room
    // Legacy equipment/iot kept for backward compatibility
    equipment?: Record<string, boolean>;
    iot?: Record<string, boolean>;
    // New device-based model for non-tent units
    devices?: Device[];
  };
  const [units, setUnits] = React.useState<Unit[]>([]);
  // UI state for IoT picker per device id
  const [iotPickerOpen, setIotPickerOpen] = React.useState<Record<string, boolean>>({});
  const [iotSelection, setIotSelection] = React.useState<Record<string, string>>({});

  const toggleIotPicker = (deviceId: string) => {
    setIotPickerOpen(prev => ({ ...prev, [deviceId]: !prev[deviceId] }));
  };

  const mockFoundDevices = (type: DeviceType, contextId: string) => {
    // Simple mock list derived from type and context
    return [
      `${type}-${contextId}-01`,
      `${type}-${contextId}-02`,
      `${type}-${contextId}-03`,
    ];
  };

  // removed obsolete sync effect from single-kind version

  // Regenerate units list when counts change or facility kind toggles
  React.useEffect(() => {
    const gh = hasFarm ? (Number(greenhouseCount) || 0) : 0;
    const rm = hasBuilding ? (Number(roomCount) || 0) : 0;
    if (gh + rm <= 0) { setUnits([]); return; }
    setUnits(prev => {
      const next: Unit[] = [];
      // Preserve existing per-type ordering
      // First greenhouses
      for (let i = 0; i < gh; i++) {
        const name = `Greenhouse ${i + 1}`;
        const existing = prev.find(x => x.type === 'greenhouse' && x.name === name) || prev.filter(x => x.type === 'greenhouse')[i];
        next.push({
          type: 'greenhouse',
          name,
          usage: existing?.usage,
          area: existing?.area,
          tentWidthFt: existing?.tentWidthFt,
          tentLengthFt: existing?.tentLengthFt,
          tents: existing?.tents,
          equipment: existing?.equipment || {},
          iot: existing?.iot || {},
          devices: existing?.devices || [],
        });
      }
      // Then rooms
      for (let i = 0; i < rm; i++) {
        const name = `Room ${i + 1}`;
        const existing = prev.find(x => x.type === 'room' && x.name === name) || prev.filter(x => x.type === 'room')[i];
        next.push({
          type: 'room',
          name,
          usage: existing?.usage,
          area: existing?.area,
          tentWidthFt: existing?.tentWidthFt,
          tentLengthFt: existing?.tentLengthFt,
          tents: existing?.tents,
          equipment: existing?.equipment || {},
          iot: existing?.iot || {},
          devices: existing?.devices || [],
        });
      }
      return next;
    });
  }, [hasFarm, hasBuilding, greenhouseCount, roomCount]);

  React.useEffect(() => {
    if (!open) {
      setStep(1);
      setGeolocation(initial?.geolocation ?? '');
      setFormattedAddress(initial?.formattedAddress);
      setCoords(initial?.latLng);
      setUseMapPicker(false);
  setHasFarm(initial?.facilityKind ? initial.facilityKind === 'Farm' : true);
  setHasBuilding(initial?.facilityKind ? initial.facilityKind === 'Building' : false);
  setFarmName(initial?.facilityKind === 'Farm' ? (initial.facilityName ?? 'Farm') : 'Farm');
  setBuildingName(initial?.facilityKind === 'Building' ? (initial.facilityName ?? 'Building 1') : 'Building 1');
  setGreenhouseCount('');
  setRoomCount('');
  setUnits([]);
      setMapsError(null);
      setMapsReady(false);
      // don't clear refs; they will be re-initialized on open
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Load Google Maps when the wizard opens for step 1
  React.useEffect(() => {
    if (!open) return;
    if (forceMockMaps) {
      setMapsError(null);
      setMapsReady(false);
      return;
    }
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled) return;
      setMapsReady(true);
    }).catch((e) => {
      console.error('Google Maps load failed', e);
      if (cancelled) return;
      setMapsError('Google Maps failed to load. Set VITE_GOOGLE_MAPS_API_KEY and ensure referrer restrictions allow http://localhost:5173.');
      setMapsReady(false);
    });
    return () => { cancelled = true; };
  }, [open, forceMockMaps]);

  // Initialize Places Autocomplete when ready
  React.useEffect(() => {
    if (forceMockMaps) return; // skip autocomplete in mock mode
    if (!mapsReady || !autoInputRef.current) return;
    try {
      const ac = new google.maps.places.Autocomplete(autoInputRef.current!, {
        fields: ['formatted_address', 'geometry', 'name'],
        // types: ['geocode'], // allow broader places
      });
      const listener = ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        const fa = place.formatted_address || place.name || '';
        const ll = place.geometry?.location ?
          { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() } : undefined;
        setFormattedAddress(fa || undefined);
        setGeolocation(fa || geolocation);
        setCoords(ll);
        // if a map exists, sync marker
        if (ll && mapInstanceRef.current) {
          if (markerRef.current && 'setPosition' in markerRef.current) {
            (markerRef.current as google.maps.Marker).setPosition(ll);
          } else if (markerRef.current && 'position' in markerRef.current) {
            (markerRef.current as google.maps.marker.AdvancedMarkerElement).position = ll;
          }
          mapInstanceRef.current.setCenter(ll);
          mapInstanceRef.current.setZoom(16);
        }
      });
      return () => listener.remove();
    } catch (e) {
      console.warn('Autocomplete init failed', e);
    }
  }, [mapsReady]);

  // Initialize Map picker when toggled on
  React.useEffect(() => {
    if (forceMockMaps) return; // skip real map in mock mode
    if (!mapsReady || !useMapPicker || !mapRef.current) return;
    // Prefer using v3 AdvancedMarker if available
    try {
      const center: google.maps.LatLngLiteral = coords || { lat: 15.301, lng: -61.387 }; // default somewhere generic
  const map = new google.maps.Map(mapRef.current!, {
        center,
        zoom: coords ? 16 : 7,
      });
      mapInstanceRef.current = map;

      let marker: any;
      if ((google.maps as any).marker?.AdvancedMarkerElement) {
        marker = new (google.maps as any).marker.AdvancedMarkerElement({ map, position: center });
      } else {
        marker = new google.maps.Marker({ map, position: center, draggable: false });
      }
      markerRef.current = marker;

      map.addListener('click', async (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const ll = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        if (marker && 'setPosition' in marker) marker.setPosition(ll);
        else if (marker) marker.position = ll;
        setCoords(ll);
        // Try reverse geocode to display a user-friendly address
        try {
          const geocoder = new google.maps.Geocoder();
          const res = await geocoder.geocode({ location: ll });
          const best = res.results?.[0];
          if (best?.formatted_address) {
            setFormattedAddress(best.formatted_address);
            setGeolocation(best.formatted_address);
          } else {
            setFormattedAddress(undefined);
            setGeolocation(`${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`);
          }
        } catch {
          setFormattedAddress(undefined);
          setGeolocation(`${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`);
        }
      });
    } catch (e) {
      console.warn('Map init failed', e);
    }
  }, [mapsReady, useMapPicker]);

  const previewTitle = `${[hasFarm ? `Farm — ${farmName}` : null, hasBuilding ? `Building — ${buildingName}` : null].filter(Boolean).join(' | ')}${geolocation ? ` — ${geolocation}` : ''}`;
  const steps = React.useMemo(() => {
    return ['Geolocation', 'Facility', 'Structure', 'Details', 'Equipment', 'Review'];
  }, []);

  if (!open) return null;

  const canNext = () => {
    const current = steps[step - 1];
    if (current === 'Geolocation') {
      // If Maps loaded successfully, require either a resolved address or picked coords
      if (!mapsError && mapsReady) return !!coords || (!!formattedAddress && geolocation.trim().length > 0);
      // Fallback when Maps isn't available
      return geolocation.trim().length > 0;
    }
    if (current === 'Facility') return (hasFarm || hasBuilding) && (!hasFarm || farmName.trim().length > 0) && (!hasBuilding || buildingName.trim().length > 0);
    if (current === 'Structure') {
      if (hasFarm && !(Number(greenhouseCount) > 0)) return false;
      if (hasBuilding && !(Number(roomCount) > 0)) return false;
      return hasFarm || hasBuilding;
    }
    if (current === 'Details') {
      if (units.length === 0) return false;
      for (const u of units) {
        if (!u.name.trim()) return false;
        if (!u.usage) return false;
        if (u.usage === 'tent') {
          // For rooms with tents: require room area and tents list to fit
          const room = Number(u.area);
          if (!(room > 0)) return false;
          const tentsM2 = (u.tents||[]).reduce((a,t)=> a + (Number(t.widthFt||0)*Number(t.lengthFt||0)*0.09290304), 0);
          if (tentsM2 <= 0) return false;
          if (tentsM2 - room > 1e-6) return false; // overloaded
        } else {
          const area = Number(u.area);
          if (!(area > 0)) return false;
        }
      }
      return true;
    }
    return true;
  };

  const submit = () => {
    const list: NewLocation[] = units.map(u => {
  let eqList: string[] = [];
  let iot: Array<{ name: string; connected: boolean }> = [];
      // Map new device model into flat lists for MVP backend
      if (u.usage === 'tent') {
        const set = new Set<string>();
        (u.tents || []).forEach((t, ti) => {
          (t.devices || []).forEach((d) => {
            set.add(d.type);
            if (d.iotConnected) {
              const fallback = `${d.type}-Tent${ti + 1}-${u.name.replace(/\s+/g, '')}`;
              iot.push({ name: d.iotDeviceId || fallback, connected: true });
            }
          });
        });
        // include legacy toggles if present
        Object.keys(u.equipment || {}).forEach((k) => { if (u.equipment?.[k]) set.add(k); });
        eqList = Array.from(set);
      } else {
        eqList = [
          ...(u.devices || []).map(d => d.type),
          ...Object.keys(u.equipment || {}).filter(k => u.equipment![k]),
        ];
        // mock iot device records for new devices (only those linked)
        iot = [
          ...((u.devices || []).filter(d => d.iotConnected).map((d) => ({ name: d.iotDeviceId || `${d.type}-${u.name.replace(/\s+/g, '')}`, connected: true }))),
          // include legacy checked ones
          ...((Object.keys(u.equipment || {}).filter(k => u.equipment![k])).filter((d) => Boolean(u.iot?.[d])).map((d) => ({ name: `${d}-${u.name.replace(/\s+/g, '')}`, connected: true }))),
        ];
      }
      const tentSqm = u.usage === 'tent'
        ? ((u.tents && u.tents.length)
            ? u.tents.reduce((a,t)=> a + Number(t.widthFt||0) * Number(t.lengthFt||0) * 0.09290304, 0)
            : (u.tentWidthFt && u.tentLengthFt
                ? Number(u.tentWidthFt) * Number(u.tentLengthFt) * 0.09290304
                : undefined))
        : undefined;
      return {
        geolocation: geolocation.trim(),
        formattedAddress,
        latLng: coords,
        facilityKind: u.type === 'greenhouse' ? 'Farm' : 'Building',
        facilityName: (u.type === 'greenhouse' ? farmName : buildingName).trim(),
        structureType: u.type,
        structureName: u.name.trim(),
        usage: u.usage,
        roomAreaSqm: u.type === 'room' ? (Number(u.area) || undefined) : undefined,
        greenhouseAreaSqm: u.type === 'greenhouse' ? (Number(u.area) || undefined) : undefined,
        tentSizeSqm: tentSqm,
        equipment: eqList,
        iotDevices: iot,
      };
    });
    onCreate(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add Location</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-50" aria-label="Close">
            <X className="h-5 w-5 text-gray-500" aria-hidden />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-gray-100">
          <div className="overflow-x-auto">
            <ol className="flex items-center gap-1.5 text-[11px]">
              {steps.map((label, i) => {
                const state = step === (i + 1) ? 'current' : step > (i + 1) ? 'done' : 'todo';
                const cls = state === 'current'
                  ? 'bg-primary text-white'
                  : state === 'done'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-50 text-gray-600 border border-gray-200';
                return (
                  <li key={label} className={`px-2 py-0.5 rounded-full ${cls} whitespace-nowrap`}>
                    {i + 1}. {label}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Address or location</span>
                {!useMapPicker && <MapPin className="h-4 w-4 text-gray-400" aria-hidden />}
                {!useMapPicker && (
                  <input
                    ref={autoInputRef}
                    value={geolocation}
                    onChange={(e) => { setGeolocation(e.target.value); setFormattedAddress(undefined); }}
                    placeholder="Start typing an address or place…"
                    className="flex-1 min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setUseMapPicker(v => !v)}
                  className="ml-auto shrink-0 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border border-primary/40 text-primary hover:bg-primary/5 whitespace-nowrap"
                >
                  {useMapPicker ? 'Search by address' : 'No address? Pick on map'}
                </button>
              </div>
              {useMapPicker && !forceMockMaps && (
                <div>
                  <div ref={mapRef} className="w-full h-64 rounded-md border border-gray-200" />
                  <div className="mt-2 text-xs text-gray-600">
                    {coords ? (
                      <span>Selected: {formattedAddress || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`}</span>
                    ) : (
                      <span>Click on the map to choose a location.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">Facility</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={hasFarm}
                  onClick={() => setHasFarm(v => !v)}
                  onKeyDown={(e)=> { if (e.key === 'Enter') { e.preventDefault(); setHasFarm(v=>!v); } }}
                  className={`text-left rounded-lg border p-3 transition cursor-pointer ${hasFarm ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-900"><Factory className="h-4 w-4" /> Farm</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${hasFarm ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{hasFarm ? 'Selected' : 'Select'}</span>
                  </div>
                  {hasFarm && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-600 whitespace-nowrap">Farm name</span>
                      <input
                        value={farmName}
                        onClick={(e)=> e.stopPropagation()}
                        onKeyDown={(e)=> e.stopPropagation()}
                        onKeyUp={(e)=> e.stopPropagation()}
                        onChange={(e)=> setFarmName(e.target.value)}
                        className="w-full min-w-0 max-w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                  )}
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={hasBuilding}
                  onClick={() => setHasBuilding(v => !v)}
                  onKeyDown={(e)=> { if (e.key === 'Enter') { e.preventDefault(); setHasBuilding(v=>!v); } }}
                  className={`text-left rounded-lg border p-3 transition cursor-pointer ${hasBuilding ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-900"><Building2 className="h-4 w-4" /> Building</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${hasBuilding ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{hasBuilding ? 'Selected' : 'Select'}</span>
                  </div>
                  {hasBuilding && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-600 whitespace-nowrap">Building name</span>
                      <input
                        value={buildingName}
                        onClick={(e)=> e.stopPropagation()}
                        onKeyDown={(e)=> e.stopPropagation()}
                        onKeyUp={(e)=> e.stopPropagation()}
                        onChange={(e)=> setBuildingName(e.target.value)}
                        className="w-full min-w-0 max-w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_auto_auto_auto] items-center gap-2">
                {hasFarm && (
                  <>
                    <span className="text-sm text-gray-600 whitespace-nowrap">How many greenhouses?</span>
                    <button type="button" className="h-8 w-8 inline-flex items-center justify-center rounded border border-gray-200" onClick={() => setGreenhouseCount(String(Math.max(0, (Number(greenhouseCount)||0) - 1)))} aria-label="Decrease">
                      <Minus className="h-4 w-4" />
                    </button>
                    <input value={greenhouseCount} onChange={(e) => setGreenhouseCount(e.target.value)} placeholder={'e.g., 3'} className="w-20 h-8 border-gray-300 rounded-md focus:ring-primary focus:border-primary text-center" inputMode="numeric" />
                    <button type="button" className="h-8 w-8 inline-flex items-center justify-center rounded border border-gray-200" onClick={() => setGreenhouseCount(String((Number(greenhouseCount)||0) + 1))} aria-label="Increase">
                      <Plus className="h-4 w-4" />
                    </button>
                  </>
                )}
                {hasBuilding && (
                  <>
                    <span className="text-sm text-gray-600 whitespace-nowrap">How many production rooms?</span>
                    <button type="button" className="h-8 w-8 inline-flex items-center justify-center rounded border border-gray-200" onClick={() => setRoomCount(String(Math.max(0, (Number(roomCount)||0) - 1)))} aria-label="Decrease">
                      <Minus className="h-4 w-4" />
                    </button>
                    <input value={roomCount} onChange={(e) => setRoomCount(e.target.value)} placeholder={'e.g., 5'} className="w-20 h-8 border-gray-300 rounded-md focus:ring-primary focus:border-primary text-center" inputMode="numeric" />
                    <button type="button" className="h-8 w-8 inline-flex items-center justify-center rounded border border-gray-200" onClick={() => setRoomCount(String((Number(roomCount)||0) + 1))} aria-label="Increase">
                      <Plus className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">Unit details</div>
              {units.length === 0 && (<div className="text-xs text-gray-500">Set a count in the previous step.</div>)}
              <div className="space-y-3 max-h-80 overflow-auto pr-1">
                {units.map((u, idx) => (
                    <div key={idx} className="rounded-md border border-gray-200 p-3 bg-white/60">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                      <div className="sm:col-span-2 flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-600 whitespace-nowrap">Name</span>
                        <input value={u.name} onChange={(e) => setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, name: e.target.value } : x))} className="flex-1 min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <span className="text-xs text-gray-600 whitespace-nowrap">Usage</span>
                        <select
                          value={u.usage || ''}
                          onChange={(e) => setUnits(prev => prev.map((x,i)=> {
                            if (i!==idx) return x;
                            const nextUsage = (e.target.value||undefined) as any;
                            if (nextUsage === 'tent') {
                              return { ...x, usage: nextUsage, tentWidthFt: x.tentWidthFt || '', tentLengthFt: x.tentLengthFt || '' };
                            }
                            return { ...x, usage: nextUsage, tentWidthFt: undefined, tentLengthFt: undefined };
                          }))}
                          className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                          <option value="">Select usage</option>
                          {u.type === 'greenhouse' ? (
                            <>
                              <option value="nursing">Nursing</option>
                              <option value="veg">Vegetative</option>
                              <option value="fruiting">Fruiting</option>
                            </>
                          ) : (
                            <>
                              <option value="nursing">Nursing</option>
                              <option value="veg">Vegetative</option>
                              <option value="fruiting">Fruiting</option>
                              <option value="drying">Drying</option>
                              <option value="storage">Storage</option>
                              <option value="tent">Tent</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2 justify-end">
                        <span className="text-xs text-gray-600 whitespace-nowrap">Area (m²)</span>
                        <input value={u.area || ''} onChange={(e) => setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, area: e.target.value } : x))} placeholder={u.usage === 'tent' ? 'e.g., 100' : 'e.g., 200'} className="w-24 border-gray-300 rounded-md focus:ring-primary focus:border-primary" inputMode="numeric" />
                      </div>
                    </div>
                    {u.usage === 'tent' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs text-gray-600">Tents in this room (ft × ft)</label>
                          <button type="button" className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-primary/40 text-primary text-xs hover:bg-primary/5" onClick={() => setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: [...(x.tents||[]), { widthFt: '4', lengthFt: '4' }] } : x))}><PlusCircle className="h-3.5 w-3.5" /> Add tent</button>
                        </div>
                            <div className="space-y-2">
                          {(u.tents||[]).map((t, ti) => (
              <div key={ti} className="grid grid-cols-5 gap-2 items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-gray-600 whitespace-nowrap">Width (ft)</span>
                <input value={t.widthFt} onChange={(e) => setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: (x.tents||[]).map((tt,k)=> k===ti ? { ...tt, widthFt: e.target.value } : tt) } : x))} className="w-20 border-gray-300 rounded-md focus:ring-primary focus:border-primary" inputMode="numeric" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-gray-600 whitespace-nowrap">Length (ft)</span>
                <input value={t.lengthFt} onChange={(e) => setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: (x.tents||[]).map((tt,k)=> k===ti ? { ...tt, lengthFt: e.target.value } : tt) } : x))} className="w-20 border-gray-300 rounded-md focus:ring-primary focus:border-primary" inputMode="numeric" />
                              </div>
                              <div className="col-span-2 text-xs text-gray-600 self-center">≈ {(Number(t.widthFt||0)*Number(t.lengthFt||0)*0.09290304).toFixed(2)} m²</div>
                              <div className="text-right">
                                <button type="button" aria-label="Remove tent" className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-red-50" onClick={() => setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: (x.tents||[]).filter((_,k)=> k!==ti) } : x))}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {(u.tents||[]).length === 0 && (<div className="text-xs text-gray-500">No tents added yet.</div>)}
                        </div>
                        {(() => {
                          const roomM2 = Number(u.area||0);
                          const tentsM2 = (u.tents||[]).reduce((a,t)=> a + (Number(t.widthFt||0)*Number(t.lengthFt||0)*0.09290304), 0);
                          const overloaded = tentsM2 > roomM2 + 1e-6;
                          return overloaded ? (<div className="mt-1 text-[11px] text-red-600">Tents exceed room area. Reduce tent count or size.</div>) : null;
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">Devices & attributes</div>
              <div className="space-y-3 max-h-80 overflow-auto pr-1">
                {units.map((u, idx) => (
                  <div key={idx} className="rounded-md border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900">{u.name} <span className="text-gray-500 font-normal">— {u.usage || '—'}</span></div>
                      {u.usage === 'tent' ? null : (
                        <button type="button" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-primary/40 text-primary hover:bg-primary/5" onClick={() => setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, devices: [...(x.devices||[]), { id: crypto.randomUUID(), name: '', type: 'Temp Sensor', attributes: {} }] } : x))}><PlusCircle className="h-3.5 w-3.5" /> Add device</button>
                      )}
                    </div>

                    {u.usage === 'tent' ? (
                      <div className="space-y-3">
                        {(u.tents||[]).map((t, ti) => (
                          <div key={ti} className="rounded-md border border-gray-100 p-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-gray-800">Tent {ti+1} — {t.widthFt || '?'}ft × {t.lengthFt || '?'}ft</div>
                              <button type="button" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-primary/40 text-primary hover:bg-primary/5" onClick={() => setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: (x.tents||[]).map((tt,kk)=> kk===ti ? { ...tt, devices: [...(tt.devices||[]), { id: crypto.randomUUID(), name: '', type: 'Temp Sensor', attributes: {} }] } : tt) } : x))}><PlusCircle className="h-3.5 w-3.5" /> Add device</button>
                            </div>
                            <div className="space-y-2">
                              {(t.devices||[]).map((d, di) => (
                                <div key={d.id} className="rounded border border-gray-200 p-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                                    <div className="sm:col-span-3 flex items-center gap-2 min-w-0">
                                      <span className="text-[11px] text-gray-600 whitespace-nowrap">Name</span>
                                      <input value={d.name} onChange={(e)=> setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: (x.tents||[]).map((tt,kk)=> kk===ti ? { ...tt, devices: (tt.devices||[]).map((dd,ii)=> ii===di ? { ...dd, name: e.target.value } : dd) } : tt) } : x))} className="w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div className="sm:col-span-2 flex items-center gap-2">
                                      <span className="text-[11px] text-gray-600 whitespace-nowrap">Type</span>
                                      <select value={d.type} onChange={(e)=> setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: (x.tents||[]).map((tt,kk)=> kk===ti ? { ...tt, devices: (tt.devices||[]).map((dd,ii)=> ii===di ? { ...dd, type: e.target.value as DeviceType, attributes: {} } : dd) } : tt) } : x))} className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                                        {(Object.keys(DEVICE_SCHEMAS) as DeviceType[]).map((opt)=> (<option key={opt} value={opt}>{opt}</option>))}
                                      </select>
                                    </div>
                                    <div className="sm:col-span-1 text-right">
                                      <button type="button" aria-label="Remove device" className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-red-50" onClick={() => setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: (x.tents||[]).map((tt,kk)=> kk===ti ? { ...tt, devices: (tt.devices||[]).filter((_,ii)=> ii!==di) } : tt) } : x))}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <button type="button" className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${d.iotConnected ? 'border-green-500 text-green-600 bg-green-50' : 'border-primary/40 text-primary hover:bg-primary/5'}`} onClick={() => toggleIotPicker(d.id)}>
                                      <Wifi className="h-3.5 w-3.5" /> {d.iotConnected ? 'Connected' : 'Connect IoT'}
                                    </button>
                                    {iotPickerOpen[d.id] && (
                                      <>
                                        <select className="text-xs border-gray-300 rounded-md focus:ring-primary focus:border-primary" value={iotSelection[d.id] || ''} onChange={(e)=> setIotSelection(prev=> ({ ...prev, [d.id]: e.target.value }))}>
                                          <option value="">Select discovered device…</option>
                                          {mockFoundDevices(d.type, `${u.name.replace(/\s+/g,'')}-T${ti+1}`).map((dev)=> (
                                            <option key={dev} value={dev}>{dev}</option>
                                          ))}
                                        </select>
                                        <button type="button" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary text-white disabled:opacity-50" disabled={!iotSelection[d.id]} onClick={() => {
                                          const chosen = iotSelection[d.id];
                                          if (!chosen) return;
                                          setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: (x.tents||[]).map((tt,kk)=> kk===ti ? { ...tt, devices: (tt.devices||[]).map((dd,ii)=> ii===di ? { ...dd, iotConnected: true, iotDeviceId: chosen } : dd) } : tt) } : x));
                                          setIotPickerOpen(prev => ({ ...prev, [d.id]: false }));
                                        }}>
                                          Link
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {DEVICE_SCHEMAS[d.type].fields.map((f)=> (
                                      <div key={f.key} className="flex items-center gap-2 min-w-0">
                                        <span className="text-[11px] text-gray-600 whitespace-nowrap">{f.label}</span>
                                        {f.input === 'select' ? (
                                          <select value={d.attributes[f.key] || ''} onChange={(e)=> setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: (x.tents||[]).map((tt,kk)=> kk===ti ? { ...tt, devices: (tt.devices||[]).map((dd,ii)=> ii===di ? { ...dd, attributes: { ...dd.attributes, [f.key]: e.target.value } } : dd) } : tt) } : x))} className="w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                                            <option value="">Select</option>
                                            {(f.options||[]).map((op)=> (<option key={op} value={op}>{op}</option>))}
                                          </select>
                                        ) : (
                                          <input type={f.input==='number'?'number':'text'} value={d.attributes[f.key] || ''} onChange={(e)=> setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, tents: (x.tents||[]).map((tt,kk)=> kk===ti ? { ...tt, devices: (tt.devices||[]).map((dd,ii)=> ii===di ? { ...dd, attributes: { ...dd.attributes, [f.key]: e.target.value } } : dd) } : tt) } : x))} className="w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {(t.devices||[]).length === 0 && (<div className="text-xs text-gray-500">No devices yet.</div>)}
                            </div>
                          </div>
                        ))}
                        {(u.tents||[]).length === 0 && (<div className="text-xs text-gray-500">No tents to equip in this room.</div>)}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(u.devices||[]).map((d, di) => (
                          <div key={d.id} className="rounded border border-gray-200 p-2">
                            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                              <div className="sm:col-span-3 flex items-center gap-2 min-w-0">
                                <span className="text-[11px] text-gray-600 whitespace-nowrap">Name</span>
                                <input value={d.name} onChange={(e)=> setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, devices: (x.devices||[]).map((dd,ii)=> ii===di ? { ...dd, name: e.target.value } : dd) } : x))} className="w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                              </div>
                              <div className="sm:col-span-2 flex items-center gap-2">
                                <span className="text-[11px] text-gray-600 whitespace-nowrap">Type</span>
                                <select value={d.type} onChange={(e)=> setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, devices: (x.devices||[]).map((dd,ii)=> ii===di ? { ...dd, type: e.target.value as DeviceType, attributes: {} } : dd) } : x))} className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                                  {(Object.keys(DEVICE_SCHEMAS) as DeviceType[]).map((opt)=> (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                              </div>
                              <div className="sm:col-span-1 text-right">
                                <button type="button" aria-label="Remove device" className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-red-50" onClick={() => setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, devices: (x.devices||[]).filter((_,ii)=> ii!==di) } : x))}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <button type="button" className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${d.iotConnected ? 'border-green-500 text-green-600 bg-green-50' : 'border-primary/40 text-primary hover:bg-primary/5'}`} onClick={() => toggleIotPicker(d.id)}>
                                <Wifi className="h-3.5 w-3.5" /> {d.iotConnected ? 'Connected' : 'Connect IoT'}
                              </button>
                              {iotPickerOpen[d.id] && (
                                <>
                                  <select className="text-xs border-gray-300 rounded-md focus:ring-primary focus:border-primary" value={iotSelection[d.id] || ''} onChange={(e)=> setIotSelection(prev=> ({ ...prev, [d.id]: e.target.value }))}>
                                    <option value="">Select discovered device…</option>
                                    {mockFoundDevices(d.type, u.name.replace(/\s+/g,'')).map((dev)=> (
                                      <option key={dev} value={dev}>{dev}</option>
                                    ))}
                                  </select>
                                  <button type="button" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary text-white disabled:opacity-50" disabled={!iotSelection[d.id]} onClick={() => {
                                    const chosen = iotSelection[d.id];
                                    if (!chosen) return;
                                    setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, devices: (x.devices||[]).map((dd,ii)=> ii===di ? { ...dd, iotConnected: true, iotDeviceId: chosen } : dd) } : x));
                                    setIotPickerOpen(prev => ({ ...prev, [d.id]: false }));
                                  }}>
                                    Link
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {DEVICE_SCHEMAS[d.type].fields.map((f)=> (
                                <div key={f.key} className="flex items-center gap-2 min-w-0">
                                  <span className="text-[11px] text-gray-600 whitespace-nowrap">{f.label}</span>
                                  {f.input === 'select' ? (
                                    <select value={d.attributes[f.key] || ''} onChange={(e)=> setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, devices: (x.devices||[]).map((dd,ii)=> ii===di ? { ...dd, attributes: { ...dd.attributes, [f.key]: e.target.value } } : dd) } : x))} className="w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                                      <option value="">Select</option>
                                      {(f.options||[]).map((op)=> (<option key={op} value={op}>{op}</option>))}
                                    </select>
                                  ) : (
                                    <input type={f.input==='number'?'number':'text'} value={d.attributes[f.key] || ''} onChange={(e)=> setUnits(prev => prev.map((x,i)=> i===idx ? { ...x, devices: (x.devices||[]).map((dd,ii)=> ii===di ? { ...dd, attributes: { ...dd.attributes, [f.key]: e.target.value } } : dd) } : x))} className="w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {(u.devices||[]).length === 0 && (<div className="text-xs text-gray-500">No devices yet.</div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === (steps.length) && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-900">Review</div>
              <div className="rounded-lg border border-gray-200 p-3 bg-white/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <Factory className="h-4 w-4" aria-hidden />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Facility</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {hasFarm && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/20">Farm — {farmName}</span>
                        )}
                        {hasBuilding && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/20">Building — {buildingName}</span>
                        )}
                        {!hasFarm && !hasBuilding && (
                          <span className="text-sm text-gray-800">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" aria-hidden />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="mt-1 text-sm text-gray-900">{geolocation || '—'}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b border-gray-100">
                        <th className="py-2 pr-3">Unit</th>
                        <th className="py-2 pr-3">Usage</th>
                        <th className="py-2 pr-3">Size</th>
                        <th className="py-2 pr-3">Devices</th>
                        <th className="py-2 pr-3">IoT Linked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map((u, i) => {
                        const tentM2 = u.usage === 'tent'
                          ? ((u.tents && u.tents.length)
                              ? (u.tents.reduce((a,t)=> a + Number(t.widthFt||0)*Number(t.lengthFt||0)*0.09290304, 0))
                              : (u.tentWidthFt && u.tentLengthFt
                                  ? (Number(u.tentWidthFt) * Number(u.tentLengthFt) * 0.09290304)
                                  : undefined))
                          : undefined;
                        const deviceList = (() => {
                          if (u.usage === 'tent') {
                            const parts: string[] = [];
                            (u.tents||[]).forEach((t, ti) => {
                              (t.devices||[]).forEach((d) => {
                                const extras = Object.entries(d.attributes||{}).filter(([_,v])=> String(v||'').length>0).map(([k,v])=> `${k}:${v}`).join(' ');
                                parts.push(`T${ti+1}:${d.type}${d.name?`(${d.name})`:''}${extras?` [${extras}]`:''}`);
                              });
                            });
                            return parts;
                          }
                          return (u.devices||[]).map((d)=> {
                            const extras = Object.entries(d.attributes||{}).filter(([_,v])=> String(v||'').length>0).map(([k,v])=> `${k}:${v}`).join(' ');
                            return `${d.type}${d.name?`(${d.name})`:''}${extras?` [${extras}]`:''}`;
                          });
                        })();
                        const iotCount = u.usage === 'tent'
                          ? (u.tents||[]).reduce((a,t) => a + (t.devices||[]).filter(d => d.iotConnected).length, 0)
                          : (u.devices||[]).filter(d => d.iotConnected).length;
                        return (
                          <tr key={i} className="border-t border-gray-100 align-top">
                            <td className="py-2 pr-3 font-medium text-gray-900">{u.name}</td>
                            <td className="py-2 pr-3"><span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{u.usage || '—'}</span></td>
                            <td className="py-2 pr-3 text-gray-800">
                              {u.usage === 'tent' ? (
                                <>
                                  {(u.tents?.length || 0)} tent(s), total {(tentM2 ?? 0).toFixed(2)} m²
                                </>
                              ) : (
                                <>{u.area || '—'} m²</>
                              )}
                            </td>
                            <td className="py-2 pr-3">
                              {deviceList.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[420px]">
                                  {deviceList.map((d, di) => (
                                    <span key={di} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700">{d}</span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-2 pr-3">{iotCount}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 disabled:opacity-50" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4" aria-hidden /> Back
          </button>
          {step < steps.length ? (
            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-white disabled:opacity-50" onClick={() => setStep((s) => Math.min(steps.length, s + 1))} disabled={!canNext()}>
              Next <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-white disabled:opacity-50" onClick={submit} disabled={!canNext()}>
              Create Location
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
