import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Factory, Building2, Plus, Minus, Trash2, PlusCircle, Wifi } from 'lucide-react';
import { loadGoogleMaps } from '../lib/maps';
const DEVICE_SCHEMAS = {
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
export default function LocationWizard({ open, onClose, onCreate, initial }) {
    const [step, setStep] = React.useState(1);
    const [geolocation, setGeolocation] = React.useState(initial?.geolocation ?? '');
    const [formattedAddress, setFormattedAddress] = React.useState(initial?.formattedAddress);
    const [coords, setCoords] = React.useState(initial?.latLng);
    const [mapsReady, setMapsReady] = React.useState(false);
    const [mapsError, setMapsError] = React.useState(null);
    const [useMapPicker, setUseMapPicker] = React.useState(false);
    const autoInputRef = React.useRef(null);
    const mapRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);
    const markerRef = React.useRef(null);
    const hasEnvKey = Boolean(import.meta.env?.VITE_GOOGLE_MAPS_API_KEY);
    const forceMockMaps = !hasEnvKey || String(import.meta.env?.VITE_MOCK_MAPS).toLowerCase() === 'true' || String(import.meta.env?.VITE_MOCK_MAPS) === '1';
    const [hasFarm, setHasFarm] = React.useState(initial?.facilityKind ? initial.facilityKind === 'Farm' : true);
    const [hasBuilding, setHasBuilding] = React.useState(initial?.facilityKind ? initial.facilityKind === 'Building' : false);
    const [farmName, setFarmName] = React.useState(initial?.facilityKind === 'Farm' ? (initial.facilityName ?? 'Farm') : 'Farm');
    const [buildingName, setBuildingName] = React.useState(initial?.facilityKind === 'Building' ? (initial.facilityName ?? 'Building 1') : 'Building 1');
    const [greenhouseCount, setGreenhouseCount] = React.useState('');
    const [roomCount, setRoomCount] = React.useState('');
    const [units, setUnits] = React.useState([]);
    // UI state for IoT picker per device id
    const [iotPickerOpen, setIotPickerOpen] = React.useState({});
    const [iotSelection, setIotSelection] = React.useState({});
    const toggleIotPicker = (deviceId) => {
        setIotPickerOpen(prev => ({ ...prev, [deviceId]: !prev[deviceId] }));
    };
    const mockFoundDevices = (type, contextId) => {
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
        if (gh + rm <= 0) {
            setUnits([]);
            return;
        }
        setUnits(prev => {
            const next = [];
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
        if (!open)
            return;
        if (forceMockMaps) {
            setMapsError(null);
            setMapsReady(false);
            return;
        }
        let cancelled = false;
        loadGoogleMaps().then(() => {
            if (cancelled)
                return;
            setMapsReady(true);
        }).catch((e) => {
            console.error('Google Maps load failed', e);
            if (cancelled)
                return;
            setMapsError('Google Maps failed to load. Set VITE_GOOGLE_MAPS_API_KEY and ensure referrer restrictions allow http://localhost:5173.');
            setMapsReady(false);
        });
        return () => { cancelled = true; };
    }, [open, forceMockMaps]);
    // Initialize Places Autocomplete when ready
    React.useEffect(() => {
        if (forceMockMaps)
            return; // skip autocomplete in mock mode
        if (!mapsReady || !autoInputRef.current)
            return;
        try {
            const ac = new google.maps.places.Autocomplete(autoInputRef.current, {
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
                        markerRef.current.setPosition(ll);
                    }
                    else if (markerRef.current && 'position' in markerRef.current) {
                        markerRef.current.position = ll;
                    }
                    mapInstanceRef.current.setCenter(ll);
                    mapInstanceRef.current.setZoom(16);
                }
            });
            return () => listener.remove();
        }
        catch (e) {
            console.warn('Autocomplete init failed', e);
        }
    }, [mapsReady]);
    // Initialize Map picker when toggled on
    React.useEffect(() => {
        if (forceMockMaps)
            return; // skip real map in mock mode
        if (!mapsReady || !useMapPicker || !mapRef.current)
            return;
        // Prefer using v3 AdvancedMarker if available
        try {
            const center = coords || { lat: 15.301, lng: -61.387 }; // default somewhere generic
            const map = new google.maps.Map(mapRef.current, {
                center,
                zoom: coords ? 16 : 7,
            });
            mapInstanceRef.current = map;
            let marker;
            if (google.maps.marker?.AdvancedMarkerElement) {
                marker = new google.maps.marker.AdvancedMarkerElement({ map, position: center });
            }
            else {
                marker = new google.maps.Marker({ map, position: center, draggable: false });
            }
            markerRef.current = marker;
            map.addListener('click', async (e) => {
                if (!e.latLng)
                    return;
                const ll = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                if (marker && 'setPosition' in marker)
                    marker.setPosition(ll);
                else if (marker)
                    marker.position = ll;
                setCoords(ll);
                // Try reverse geocode to display a user-friendly address
                try {
                    const geocoder = new google.maps.Geocoder();
                    const res = await geocoder.geocode({ location: ll });
                    const best = res.results?.[0];
                    if (best?.formatted_address) {
                        setFormattedAddress(best.formatted_address);
                        setGeolocation(best.formatted_address);
                    }
                    else {
                        setFormattedAddress(undefined);
                        setGeolocation(`${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`);
                    }
                }
                catch {
                    setFormattedAddress(undefined);
                    setGeolocation(`${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`);
                }
            });
        }
        catch (e) {
            console.warn('Map init failed', e);
        }
    }, [mapsReady, useMapPicker]);
    const previewTitle = `${[hasFarm ? `Farm — ${farmName}` : null, hasBuilding ? `Building — ${buildingName}` : null].filter(Boolean).join(' | ')}${geolocation ? ` — ${geolocation}` : ''}`;
    const steps = React.useMemo(() => {
        return ['Geolocation', 'Facility', 'Structure', 'Details', 'Equipment', 'Review'];
    }, []);
    if (!open)
        return null;
    const canNext = () => {
        const current = steps[step - 1];
        if (current === 'Geolocation') {
            // If Maps loaded successfully, require either a resolved address or picked coords
            if (!mapsError && mapsReady)
                return !!coords || (!!formattedAddress && geolocation.trim().length > 0);
            // Fallback when Maps isn't available
            return geolocation.trim().length > 0;
        }
        if (current === 'Facility')
            return (hasFarm || hasBuilding) && (!hasFarm || farmName.trim().length > 0) && (!hasBuilding || buildingName.trim().length > 0);
        if (current === 'Structure') {
            if (hasFarm && !(Number(greenhouseCount) > 0))
                return false;
            if (hasBuilding && !(Number(roomCount) > 0))
                return false;
            return hasFarm || hasBuilding;
        }
        if (current === 'Details') {
            if (units.length === 0)
                return false;
            for (const u of units) {
                if (!u.name.trim())
                    return false;
                if (!u.usage)
                    return false;
                if (u.usage === 'tent') {
                    // For rooms with tents: require room area and tents list to fit
                    const room = Number(u.area);
                    if (!(room > 0))
                        return false;
                    const tentsM2 = (u.tents || []).reduce((a, t) => a + (Number(t.widthFt || 0) * Number(t.lengthFt || 0) * 0.09290304), 0);
                    if (tentsM2 <= 0)
                        return false;
                    if (tentsM2 - room > 1e-6)
                        return false; // overloaded
                }
                else {
                    const area = Number(u.area);
                    if (!(area > 0))
                        return false;
                }
            }
            return true;
        }
        return true;
    };
    const submit = () => {
        const list = units.map(u => {
            let eqList = [];
            let iot = [];
            // Map new device model into flat lists for MVP backend
            if (u.usage === 'tent') {
                const set = new Set();
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
                Object.keys(u.equipment || {}).forEach((k) => { if (u.equipment?.[k])
                    set.add(k); });
                eqList = Array.from(set);
            }
            else {
                eqList = [
                    ...(u.devices || []).map(d => d.type),
                    ...Object.keys(u.equipment || {}).filter(k => u.equipment[k]),
                ];
                // mock iot device records for new devices (only those linked)
                iot = [
                    ...((u.devices || []).filter(d => d.iotConnected).map((d) => ({ name: d.iotDeviceId || `${d.type}-${u.name.replace(/\s+/g, '')}`, connected: true }))),
                    // include legacy checked ones
                    ...((Object.keys(u.equipment || {}).filter(k => u.equipment[k])).filter((d) => Boolean(u.iot?.[d])).map((d) => ({ name: `${d}-${u.name.replace(/\s+/g, '')}`, connected: true }))),
                ];
            }
            const tentSqm = u.usage === 'tent'
                ? ((u.tents && u.tents.length)
                    ? u.tents.reduce((a, t) => a + Number(t.widthFt || 0) * Number(t.lengthFt || 0) * 0.09290304, 0)
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
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black/30", onClick: onClose, "aria-hidden": true }), _jsxs("div", { role: "dialog", "aria-modal": true, className: "relative bg-white w-full max-w-xl rounded-xl shadow-2xl border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-gray-100", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Add Location" }), _jsx("button", { onClick: onClose, className: "p-1 rounded hover:bg-gray-50", "aria-label": "Close", children: _jsx(X, { className: "h-5 w-5 text-gray-500", "aria-hidden": true }) })] }), _jsx("div", { className: "px-4 py-2 border-b border-gray-100", children: _jsx("div", { className: "overflow-x-auto", children: _jsx("ol", { className: "flex items-center gap-1.5 text-[11px]", children: steps.map((label, i) => {
                                    const state = step === (i + 1) ? 'current' : step > (i + 1) ? 'done' : 'todo';
                                    const cls = state === 'current'
                                        ? 'bg-primary text-white'
                                        : state === 'done'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200';
                                    return (_jsxs("li", { className: `px-2 py-0.5 rounded-full ${cls} whitespace-nowrap`, children: [i + 1, ". ", label] }, label));
                                }) }) }) }), _jsxs("div", { className: "px-4 py-4 space-y-4", children: [step === 1 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600 whitespace-nowrap", children: "Address or location" }), !useMapPicker && _jsx(MapPin, { className: "h-4 w-4 text-gray-400", "aria-hidden": true }), !useMapPicker && (_jsx("input", { ref: autoInputRef, value: geolocation, onChange: (e) => { setGeolocation(e.target.value); setFormattedAddress(undefined); }, placeholder: "Start typing an address or place\u2026", className: "flex-1 min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" })), _jsx("button", { type: "button", onClick: () => setUseMapPicker(v => !v), className: "ml-auto shrink-0 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border border-primary/40 text-primary hover:bg-primary/5 whitespace-nowrap", children: useMapPicker ? 'Search by address' : 'No address? Pick on map' })] }), useMapPicker && !forceMockMaps && (_jsxs("div", { children: [_jsx("div", { ref: mapRef, className: "w-full h-64 rounded-md border border-gray-200" }), _jsx("div", { className: "mt-2 text-xs text-gray-600", children: coords ? (_jsxs("span", { children: ["Selected: ", formattedAddress || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`] })) : (_jsx("span", { children: "Click on the map to choose a location." })) })] }))] })), step === 2 && (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-sm text-gray-700", children: "Facility" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { role: "button", tabIndex: 0, "aria-pressed": hasFarm, onClick: () => setHasFarm(v => !v), onKeyDown: (e) => { if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    setHasFarm(v => !v);
                                                } }, className: `text-left rounded-lg border p-3 transition cursor-pointer ${hasFarm ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-medium text-gray-900", children: [_jsx(Factory, { className: "h-4 w-4" }), " Farm"] }), _jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full ${hasFarm ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`, children: hasFarm ? 'Selected' : 'Select' })] }), hasFarm && (_jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-gray-600 whitespace-nowrap", children: "Farm name" }), _jsx("input", { value: farmName, onClick: (e) => e.stopPropagation(), onKeyDown: (e) => e.stopPropagation(), onKeyUp: (e) => e.stopPropagation(), onChange: (e) => setFarmName(e.target.value), className: "w-full min-w-0 max-w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" })] }))] }), _jsxs("div", { role: "button", tabIndex: 0, "aria-pressed": hasBuilding, onClick: () => setHasBuilding(v => !v), onKeyDown: (e) => { if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    setHasBuilding(v => !v);
                                                } }, className: `text-left rounded-lg border p-3 transition cursor-pointer ${hasBuilding ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-medium text-gray-900", children: [_jsx(Building2, { className: "h-4 w-4" }), " Building"] }), _jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full ${hasBuilding ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`, children: hasBuilding ? 'Selected' : 'Select' })] }), hasBuilding && (_jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-gray-600 whitespace-nowrap", children: "Building name" }), _jsx("input", { value: buildingName, onClick: (e) => e.stopPropagation(), onKeyDown: (e) => e.stopPropagation(), onKeyUp: (e) => e.stopPropagation(), onChange: (e) => setBuildingName(e.target.value), className: "w-full min-w-0 max-w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" })] }))] })] })] })), step === 3 && (_jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "grid grid-cols-[auto_auto_auto_auto] items-center gap-2", children: [hasFarm && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-sm text-gray-600 whitespace-nowrap", children: "How many greenhouses?" }), _jsx("button", { type: "button", className: "h-8 w-8 inline-flex items-center justify-center rounded border border-gray-200", onClick: () => setGreenhouseCount(String(Math.max(0, (Number(greenhouseCount) || 0) - 1))), "aria-label": "Decrease", children: _jsx(Minus, { className: "h-4 w-4" }) }), _jsx("input", { value: greenhouseCount, onChange: (e) => setGreenhouseCount(e.target.value), placeholder: 'e.g., 3', className: "w-20 h-8 border-gray-300 rounded-md focus:ring-primary focus:border-primary text-center", inputMode: "numeric" }), _jsx("button", { type: "button", className: "h-8 w-8 inline-flex items-center justify-center rounded border border-gray-200", onClick: () => setGreenhouseCount(String((Number(greenhouseCount) || 0) + 1)), "aria-label": "Increase", children: _jsx(Plus, { className: "h-4 w-4" }) })] })), hasBuilding && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-sm text-gray-600 whitespace-nowrap", children: "How many production rooms?" }), _jsx("button", { type: "button", className: "h-8 w-8 inline-flex items-center justify-center rounded border border-gray-200", onClick: () => setRoomCount(String(Math.max(0, (Number(roomCount) || 0) - 1))), "aria-label": "Decrease", children: _jsx(Minus, { className: "h-4 w-4" }) }), _jsx("input", { value: roomCount, onChange: (e) => setRoomCount(e.target.value), placeholder: 'e.g., 5', className: "w-20 h-8 border-gray-300 rounded-md focus:ring-primary focus:border-primary text-center", inputMode: "numeric" }), _jsx("button", { type: "button", className: "h-8 w-8 inline-flex items-center justify-center rounded border border-gray-200", onClick: () => setRoomCount(String((Number(roomCount) || 0) + 1)), "aria-label": "Increase", children: _jsx(Plus, { className: "h-4 w-4" }) })] }))] }) })), step === 4 && (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-sm text-gray-700", children: "Unit details" }), units.length === 0 && (_jsx("div", { className: "text-xs text-gray-500", children: "Set a count in the previous step." })), _jsx("div", { className: "space-y-3 max-h-80 overflow-auto pr-1", children: units.map((u, idx) => (_jsxs("div", { className: "rounded-md border border-gray-200 p-3 bg-white/60", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-6 gap-2 items-center", children: [_jsxs("div", { className: "sm:col-span-2 flex items-center gap-2 min-w-0", children: [_jsx("span", { className: "text-xs text-gray-600 whitespace-nowrap", children: "Name" }), _jsx("input", { value: u.name, onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, name: e.target.value } : x)), className: "flex-1 min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" })] }), _jsxs("div", { className: "sm:col-span-2 flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-gray-600 whitespace-nowrap", children: "Usage" }), _jsxs("select", { value: u.usage || '', onChange: (e) => setUnits(prev => prev.map((x, i) => {
                                                                        if (i !== idx)
                                                                            return x;
                                                                        const nextUsage = (e.target.value || undefined);
                                                                        if (nextUsage === 'tent') {
                                                                            return { ...x, usage: nextUsage, tentWidthFt: x.tentWidthFt || '', tentLengthFt: x.tentLengthFt || '' };
                                                                        }
                                                                        return { ...x, usage: nextUsage, tentWidthFt: undefined, tentLengthFt: undefined };
                                                                    })), className: "w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary", children: [_jsx("option", { value: "", children: "Select usage" }), u.type === 'greenhouse' ? (_jsxs(_Fragment, { children: [_jsx("option", { value: "nursing", children: "Nursing" }), _jsx("option", { value: "veg", children: "Vegetative" }), _jsx("option", { value: "fruiting", children: "Fruiting" })] })) : (_jsxs(_Fragment, { children: [_jsx("option", { value: "nursing", children: "Nursing" }), _jsx("option", { value: "veg", children: "Vegetative" }), _jsx("option", { value: "fruiting", children: "Fruiting" }), _jsx("option", { value: "drying", children: "Drying" }), _jsx("option", { value: "storage", children: "Storage" }), _jsx("option", { value: "tent", children: "Tent" })] }))] })] }), _jsxs("div", { className: "sm:col-span-2 flex items-center gap-2 justify-end", children: [_jsx("span", { className: "text-xs text-gray-600 whitespace-nowrap", children: "Area (m\u00B2)" }), _jsx("input", { value: u.area || '', onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, area: e.target.value } : x)), placeholder: u.usage === 'tent' ? 'e.g., 100' : 'e.g., 200', className: "w-24 border-gray-300 rounded-md focus:ring-primary focus:border-primary", inputMode: "numeric" })] })] }), u.usage === 'tent' && (_jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "block text-xs text-gray-600", children: "Tents in this room (ft \u00D7 ft)" }), _jsxs("button", { type: "button", className: "inline-flex items-center gap-1 px-2 py-1 rounded-md border border-primary/40 text-primary text-xs hover:bg-primary/5", onClick: () => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: [...(x.tents || []), { widthFt: '4', lengthFt: '4' }] } : x)), children: [_jsx(PlusCircle, { className: "h-3.5 w-3.5" }), " Add tent"] })] }), _jsxs("div", { className: "space-y-2", children: [(u.tents || []).map((t, ti) => (_jsxs("div", { className: "grid grid-cols-5 gap-2 items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-[11px] text-gray-600 whitespace-nowrap", children: "Width (ft)" }), _jsx("input", { value: t.widthFt, onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: (x.tents || []).map((tt, k) => k === ti ? { ...tt, widthFt: e.target.value } : tt) } : x)), className: "w-20 border-gray-300 rounded-md focus:ring-primary focus:border-primary", inputMode: "numeric" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-[11px] text-gray-600 whitespace-nowrap", children: "Length (ft)" }), _jsx("input", { value: t.lengthFt, onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: (x.tents || []).map((tt, k) => k === ti ? { ...tt, lengthFt: e.target.value } : tt) } : x)), className: "w-20 border-gray-300 rounded-md focus:ring-primary focus:border-primary", inputMode: "numeric" })] }), _jsxs("div", { className: "col-span-2 text-xs text-gray-600 self-center", children: ["\u2248 ", (Number(t.widthFt || 0) * Number(t.lengthFt || 0) * 0.09290304).toFixed(2), " m\u00B2"] }), _jsx("div", { className: "text-right", children: _jsx("button", { type: "button", "aria-label": "Remove tent", className: "inline-flex items-center justify-center p-1.5 rounded-md hover:bg-red-50", onClick: () => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: (x.tents || []).filter((_, k) => k !== ti) } : x)), children: _jsx(Trash2, { className: "h-4 w-4 text-red-600" }) }) })] }, ti))), (u.tents || []).length === 0 && (_jsx("div", { className: "text-xs text-gray-500", children: "No tents added yet." }))] }), (() => {
                                                            const roomM2 = Number(u.area || 0);
                                                            const tentsM2 = (u.tents || []).reduce((a, t) => a + (Number(t.widthFt || 0) * Number(t.lengthFt || 0) * 0.09290304), 0);
                                                            const overloaded = tentsM2 > roomM2 + 1e-6;
                                                            return overloaded ? (_jsx("div", { className: "mt-1 text-[11px] text-red-600", children: "Tents exceed room area. Reduce tent count or size." })) : null;
                                                        })()] }))] }, idx))) })] })), step === 5 && (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-sm text-gray-700", children: "Devices & attributes" }), _jsx("div", { className: "space-y-3 max-h-80 overflow-auto pr-1", children: units.map((u, idx) => (_jsxs("div", { className: "rounded-md border border-gray-200 p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: [u.name, " ", _jsxs("span", { className: "text-gray-500 font-normal", children: ["\u2014 ", u.usage || '—'] })] }), u.usage === 'tent' ? null : (_jsxs("button", { type: "button", className: "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-primary/40 text-primary hover:bg-primary/5", onClick: () => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, devices: [...(x.devices || []), { id: crypto.randomUUID(), name: '', type: 'Temp Sensor', attributes: {} }] } : x)), children: [_jsx(PlusCircle, { className: "h-3.5 w-3.5" }), " Add device"] }))] }), u.usage === 'tent' ? (_jsxs("div", { className: "space-y-3", children: [(u.tents || []).map((t, ti) => (_jsxs("div", { className: "rounded-md border border-gray-100 p-2", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "text-xs text-gray-800", children: ["Tent ", ti + 1, " \u2014 ", t.widthFt || '?', "ft \u00D7 ", t.lengthFt || '?', "ft"] }), _jsxs("button", { type: "button", className: "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-primary/40 text-primary hover:bg-primary/5", onClick: () => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: (x.tents || []).map((tt, kk) => kk === ti ? { ...tt, devices: [...(tt.devices || []), { id: crypto.randomUUID(), name: '', type: 'Temp Sensor', attributes: {} }] } : tt) } : x)), children: [_jsx(PlusCircle, { className: "h-3.5 w-3.5" }), " Add device"] })] }), _jsxs("div", { className: "space-y-2", children: [(t.devices || []).map((d, di) => (_jsxs("div", { className: "rounded border border-gray-200 p-2", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-6 gap-2 items-center", children: [_jsxs("div", { className: "sm:col-span-3 flex items-center gap-2 min-w-0", children: [_jsx("span", { className: "text-[11px] text-gray-600 whitespace-nowrap", children: "Name" }), _jsx("input", { value: d.name, onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: (x.tents || []).map((tt, kk) => kk === ti ? { ...tt, devices: (tt.devices || []).map((dd, ii) => ii === di ? { ...dd, name: e.target.value } : dd) } : tt) } : x)), className: "w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" })] }), _jsxs("div", { className: "sm:col-span-2 flex items-center gap-2", children: [_jsx("span", { className: "text-[11px] text-gray-600 whitespace-nowrap", children: "Type" }), _jsx("select", { value: d.type, onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: (x.tents || []).map((tt, kk) => kk === ti ? { ...tt, devices: (tt.devices || []).map((dd, ii) => ii === di ? { ...dd, type: e.target.value, attributes: {} } : dd) } : tt) } : x)), className: "w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary", children: Object.keys(DEVICE_SCHEMAS).map((opt) => (_jsx("option", { value: opt, children: opt }, opt))) })] }), _jsx("div", { className: "sm:col-span-1 text-right", children: _jsx("button", { type: "button", "aria-label": "Remove device", className: "inline-flex items-center justify-center p-1.5 rounded-md hover:bg-red-50", onClick: () => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: (x.tents || []).map((tt, kk) => kk === ti ? { ...tt, devices: (tt.devices || []).filter((_, ii) => ii !== di) } : tt) } : x)), children: _jsx(Trash2, { className: "h-4 w-4 text-red-600" }) }) })] }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [_jsxs("button", { type: "button", className: `inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${d.iotConnected ? 'border-green-500 text-green-600 bg-green-50' : 'border-primary/40 text-primary hover:bg-primary/5'}`, onClick: () => toggleIotPicker(d.id), children: [_jsx(Wifi, { className: "h-3.5 w-3.5" }), " ", d.iotConnected ? 'Connected' : 'Connect IoT'] }), iotPickerOpen[d.id] && (_jsxs(_Fragment, { children: [_jsxs("select", { className: "text-xs border-gray-300 rounded-md focus:ring-primary focus:border-primary", value: iotSelection[d.id] || '', onChange: (e) => setIotSelection(prev => ({ ...prev, [d.id]: e.target.value })), children: [_jsx("option", { value: "", children: "Select discovered device\u2026" }), mockFoundDevices(d.type, `${u.name.replace(/\s+/g, '')}-T${ti + 1}`).map((dev) => (_jsx("option", { value: dev, children: dev }, dev)))] }), _jsx("button", { type: "button", className: "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary text-white disabled:opacity-50", disabled: !iotSelection[d.id], onClick: () => {
                                                                                                        const chosen = iotSelection[d.id];
                                                                                                        if (!chosen)
                                                                                                            return;
                                                                                                        setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: (x.tents || []).map((tt, kk) => kk === ti ? { ...tt, devices: (tt.devices || []).map((dd, ii) => ii === di ? { ...dd, iotConnected: true, iotDeviceId: chosen } : dd) } : tt) } : x));
                                                                                                        setIotPickerOpen(prev => ({ ...prev, [d.id]: false }));
                                                                                                    }, children: "Link" })] }))] }), _jsx("div", { className: "mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2", children: DEVICE_SCHEMAS[d.type].fields.map((f) => (_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("span", { className: "text-[11px] text-gray-600 whitespace-nowrap", children: f.label }), f.input === 'select' ? (_jsxs("select", { value: d.attributes[f.key] || '', onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: (x.tents || []).map((tt, kk) => kk === ti ? { ...tt, devices: (tt.devices || []).map((dd, ii) => ii === di ? { ...dd, attributes: { ...dd.attributes, [f.key]: e.target.value } } : dd) } : tt) } : x)), className: "w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary", children: [_jsx("option", { value: "", children: "Select" }), (f.options || []).map((op) => (_jsx("option", { value: op, children: op }, op)))] })) : (_jsx("input", { type: f.input === 'number' ? 'number' : 'text', value: d.attributes[f.key] || '', onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, tents: (x.tents || []).map((tt, kk) => kk === ti ? { ...tt, devices: (tt.devices || []).map((dd, ii) => ii === di ? { ...dd, attributes: { ...dd.attributes, [f.key]: e.target.value } } : dd) } : tt) } : x)), className: "w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" }))] }, f.key))) })] }, d.id))), (t.devices || []).length === 0 && (_jsx("div", { className: "text-xs text-gray-500", children: "No devices yet." }))] })] }, ti))), (u.tents || []).length === 0 && (_jsx("div", { className: "text-xs text-gray-500", children: "No tents to equip in this room." }))] })) : (_jsxs("div", { className: "space-y-2", children: [(u.devices || []).map((d, di) => (_jsxs("div", { className: "rounded border border-gray-200 p-2", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-6 gap-2 items-center", children: [_jsxs("div", { className: "sm:col-span-3 flex items-center gap-2 min-w-0", children: [_jsx("span", { className: "text-[11px] text-gray-600 whitespace-nowrap", children: "Name" }), _jsx("input", { value: d.name, onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, devices: (x.devices || []).map((dd, ii) => ii === di ? { ...dd, name: e.target.value } : dd) } : x)), className: "w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" })] }), _jsxs("div", { className: "sm:col-span-2 flex items-center gap-2", children: [_jsx("span", { className: "text-[11px] text-gray-600 whitespace-nowrap", children: "Type" }), _jsx("select", { value: d.type, onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, devices: (x.devices || []).map((dd, ii) => ii === di ? { ...dd, type: e.target.value, attributes: {} } : dd) } : x)), className: "w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary", children: Object.keys(DEVICE_SCHEMAS).map((opt) => (_jsx("option", { value: opt, children: opt }, opt))) })] }), _jsx("div", { className: "sm:col-span-1 text-right", children: _jsx("button", { type: "button", "aria-label": "Remove device", className: "inline-flex items-center justify-center p-1.5 rounded-md hover:bg-red-50", onClick: () => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, devices: (x.devices || []).filter((_, ii) => ii !== di) } : x)), children: _jsx(Trash2, { className: "h-4 w-4 text-red-600" }) }) })] }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [_jsxs("button", { type: "button", className: `inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${d.iotConnected ? 'border-green-500 text-green-600 bg-green-50' : 'border-primary/40 text-primary hover:bg-primary/5'}`, onClick: () => toggleIotPicker(d.id), children: [_jsx(Wifi, { className: "h-3.5 w-3.5" }), " ", d.iotConnected ? 'Connected' : 'Connect IoT'] }), iotPickerOpen[d.id] && (_jsxs(_Fragment, { children: [_jsxs("select", { className: "text-xs border-gray-300 rounded-md focus:ring-primary focus:border-primary", value: iotSelection[d.id] || '', onChange: (e) => setIotSelection(prev => ({ ...prev, [d.id]: e.target.value })), children: [_jsx("option", { value: "", children: "Select discovered device\u2026" }), mockFoundDevices(d.type, u.name.replace(/\s+/g, '')).map((dev) => (_jsx("option", { value: dev, children: dev }, dev)))] }), _jsx("button", { type: "button", className: "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary text-white disabled:opacity-50", disabled: !iotSelection[d.id], onClick: () => {
                                                                                        const chosen = iotSelection[d.id];
                                                                                        if (!chosen)
                                                                                            return;
                                                                                        setUnits(prev => prev.map((x, i) => i === idx ? { ...x, devices: (x.devices || []).map((dd, ii) => ii === di ? { ...dd, iotConnected: true, iotDeviceId: chosen } : dd) } : x));
                                                                                        setIotPickerOpen(prev => ({ ...prev, [d.id]: false }));
                                                                                    }, children: "Link" })] }))] }), _jsx("div", { className: "mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2", children: DEVICE_SCHEMAS[d.type].fields.map((f) => (_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("span", { className: "text-[11px] text-gray-600 whitespace-nowrap", children: f.label }), f.input === 'select' ? (_jsxs("select", { value: d.attributes[f.key] || '', onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, devices: (x.devices || []).map((dd, ii) => ii === di ? { ...dd, attributes: { ...dd.attributes, [f.key]: e.target.value } } : dd) } : x)), className: "w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary", children: [_jsx("option", { value: "", children: "Select" }), (f.options || []).map((op) => (_jsx("option", { value: op, children: op }, op)))] })) : (_jsx("input", { type: f.input === 'number' ? 'number' : 'text', value: d.attributes[f.key] || '', onChange: (e) => setUnits(prev => prev.map((x, i) => i === idx ? { ...x, devices: (x.devices || []).map((dd, ii) => ii === di ? { ...dd, attributes: { ...dd.attributes, [f.key]: e.target.value } } : dd) } : x)), className: "w-full min-w-0 border-gray-300 rounded-md focus:ring-primary focus:border-primary" }))] }, f.key))) })] }, d.id))), (u.devices || []).length === 0 && (_jsx("div", { className: "text-xs text-gray-500", children: "No devices yet." }))] }))] }, idx))) })] })), step === (steps.length) && (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: "Review" }), _jsxs("div", { className: "rounded-lg border border-gray-200 p-3 bg-white/60", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50", children: [_jsx("div", { className: "p-1.5 rounded-md bg-primary/10 text-primary", children: _jsx(Factory, { className: "h-4 w-4", "aria-hidden": true }) }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Facility" }), _jsxs("div", { className: "mt-1 flex flex-wrap gap-1", children: [hasFarm && (_jsxs("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/20", children: ["Farm \u2014 ", farmName] })), hasBuilding && (_jsxs("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/20", children: ["Building \u2014 ", buildingName] })), !hasFarm && !hasBuilding && (_jsx("span", { className: "text-sm text-gray-800", children: "\u2014" }))] })] })] }), _jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50", children: [_jsx("div", { className: "p-1.5 rounded-md bg-primary/10 text-primary", children: _jsx(MapPin, { className: "h-4 w-4", "aria-hidden": true }) }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500", children: "Location" }), _jsx("div", { className: "mt-1 text-sm text-gray-900", children: geolocation || '—' })] })] })] }), _jsx("div", { className: "mt-3 overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-600 border-b border-gray-100", children: [_jsx("th", { className: "py-2 pr-3", children: "Unit" }), _jsx("th", { className: "py-2 pr-3", children: "Usage" }), _jsx("th", { className: "py-2 pr-3", children: "Size" }), _jsx("th", { className: "py-2 pr-3", children: "Devices" }), _jsx("th", { className: "py-2 pr-3", children: "IoT Linked" })] }) }), _jsx("tbody", { children: units.map((u, i) => {
                                                                const tentM2 = u.usage === 'tent'
                                                                    ? ((u.tents && u.tents.length)
                                                                        ? (u.tents.reduce((a, t) => a + Number(t.widthFt || 0) * Number(t.lengthFt || 0) * 0.09290304, 0))
                                                                        : (u.tentWidthFt && u.tentLengthFt
                                                                            ? (Number(u.tentWidthFt) * Number(u.tentLengthFt) * 0.09290304)
                                                                            : undefined))
                                                                    : undefined;
                                                                const deviceList = (() => {
                                                                    if (u.usage === 'tent') {
                                                                        const parts = [];
                                                                        (u.tents || []).forEach((t, ti) => {
                                                                            (t.devices || []).forEach((d) => {
                                                                                const extras = Object.entries(d.attributes || {}).filter(([_, v]) => String(v || '').length > 0).map(([k, v]) => `${k}:${v}`).join(' ');
                                                                                parts.push(`T${ti + 1}:${d.type}${d.name ? `(${d.name})` : ''}${extras ? ` [${extras}]` : ''}`);
                                                                            });
                                                                        });
                                                                        return parts;
                                                                    }
                                                                    return (u.devices || []).map((d) => {
                                                                        const extras = Object.entries(d.attributes || {}).filter(([_, v]) => String(v || '').length > 0).map(([k, v]) => `${k}:${v}`).join(' ');
                                                                        return `${d.type}${d.name ? `(${d.name})` : ''}${extras ? ` [${extras}]` : ''}`;
                                                                    });
                                                                })();
                                                                const iotCount = u.usage === 'tent'
                                                                    ? (u.tents || []).reduce((a, t) => a + (t.devices || []).filter(d => d.iotConnected).length, 0)
                                                                    : (u.devices || []).filter(d => d.iotConnected).length;
                                                                return (_jsxs("tr", { className: "border-t border-gray-100 align-top", children: [_jsx("td", { className: "py-2 pr-3 font-medium text-gray-900", children: u.name }), _jsx("td", { className: "py-2 pr-3", children: _jsx("span", { className: "inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700", children: u.usage || '—' }) }), _jsx("td", { className: "py-2 pr-3 text-gray-800", children: u.usage === 'tent' ? (_jsxs(_Fragment, { children: [(u.tents?.length || 0), " tent(s), total ", (tentM2 ?? 0).toFixed(2), " m\u00B2"] })) : (_jsxs(_Fragment, { children: [u.area || '—', " m\u00B2"] })) }), _jsx("td", { className: "py-2 pr-3", children: deviceList.length > 0 ? (_jsx("div", { className: "flex flex-wrap gap-1 max-w-[420px]", children: deviceList.map((d, di) => (_jsx("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700", children: d }, di))) })) : (_jsx("span", { className: "text-gray-400", children: "\u2014" })) }), _jsx("td", { className: "py-2 pr-3", children: iotCount })] }, i));
                                                            }) })] }) })] })] }))] }), _jsxs("div", { className: "px-4 py-3 border-t border-gray-100 flex items-center justify-between", children: [_jsxs("button", { className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 disabled:opacity-50", onClick: () => setStep((s) => Math.max(1, s - 1)), disabled: step === 1, children: [_jsx(ChevronLeft, { className: "h-4 w-4", "aria-hidden": true }), " Back"] }), step < steps.length ? (_jsxs("button", { className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-white disabled:opacity-50", onClick: () => setStep((s) => Math.min(steps.length, s + 1)), disabled: !canNext(), children: ["Next ", _jsx(ChevronRight, { className: "h-4 w-4", "aria-hidden": true })] })) : (_jsx("button", { className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-white disabled:opacity-50", onClick: submit, disabled: !canNext(), children: "Create Location" }))] })] })] }));
}
