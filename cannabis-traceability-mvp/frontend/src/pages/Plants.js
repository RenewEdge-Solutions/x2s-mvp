import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useRef } from 'react';
import Card from '../components/Card';
import { api } from '../lib/api';
import { useModule } from '../context/ModuleContext';
import { Sprout, Map as MapIcon, Layers, ChevronRight, ChevronLeft, Info, ChevronDown, Plus, MapPin } from 'lucide-react';
function parseTopType(name) {
    if (/^Indoor Room /i.test(name))
        return 'room';
    if (/^Greenhouse /i.test(name))
        return 'greenhouse';
    return 'other';
}
function parseSubType(name) {
    const lower = name.toLowerCase();
    if (lower.startsWith('rack'))
        return 'rack';
    if (lower.startsWith('bed'))
        return 'bed';
    if (lower.startsWith('tent'))
        return 'tent';
    if (lower.includes('shelf'))
        return 'shelf';
    if (lower.includes('table'))
        return 'table';
    if (lower.includes('zone'))
        return 'zone';
    return 'other';
}
function buildLocations(plants) {
    const map = {};
    for (const p of plants) {
        const [top, sub] = p.location.split(' - ');
        const topKey = top?.trim() || 'Unknown Location';
        if (!map[topKey]) {
            map[topKey] = { key: topKey, type: parseTopType(topKey), sublocations: {}, plants: [] };
        }
        if (sub) {
            const subKey = sub.trim();
            if (!map[topKey].sublocations[subKey]) {
                map[topKey].sublocations[subKey] = { key: subKey, type: parseSubType(subKey), plants: [] };
            }
            map[topKey].sublocations[subKey].plants.push(p);
        }
        else {
            map[topKey].plants.push(p);
        }
    }
    return map;
}
function categoryTitle(t) {
    if (t === 'room')
        return 'Indoor';
    if (t === 'greenhouse')
        return 'Outdoor';
    return 'Other';
}
function subCategoryTitle(t) {
    if (t === 'room')
        return 'Room';
    if (t === 'greenhouse')
        return 'Greenhouse';
    return '';
}
function formatTopKeyDisplay(key, type) {
    const parts = key.split(' - ');
    let left = parts[0] || '';
    if (type === 'room') {
        left = left.replace(/^Indoor\s+/i, '');
    }
    // For greenhouse we keep the original left (e.g., "Greenhouse 2")
    if (parts.length >= 2)
        return `${left} - ${parts.slice(1).join(' - ')}`;
    return left || key;
}
function prettyLocationString(location) {
    const parts = location.split(' - ');
    if (parts.length === 0)
        return location;
    parts[0] = parts[0].replace(/^Indoor\s+/i, '');
    return parts.join(' - ');
}
function getFacilityName(topKey) {
    const parts = topKey.split(' - ');
    return (parts[1] || 'Unknown').trim();
}
function facilityTypeOfTop(t) {
    if (t === 'room')
        return 'building';
    if (t === 'greenhouse')
        return 'farm';
    return null;
}
function leftNameFromTop(topKey, type) {
    const left = (topKey.split(' - ')[0] || '').trim();
    return type === 'room' ? left.replace(/^Indoor\s+/i, '') : left;
}
export default function Plants() {
    const { activeModule } = useModule();
    // Ref to equipment pane for scrollIntoView
    const equipmentRef = useRef(null);
    const [plants, setPlants] = useState([]);
    const [selectedTop, setSelectedTop] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [selectedGeo, setSelectedGeo] = useState(null);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [geoList, setGeoList] = useState([]);
    const [facilityList, setFacilityList] = useState([]);
    // Cache facilities per geo to show counts without extra clicks
    const [facilitiesByGeo, setFacilitiesByGeo] = useState({});
    // Removed Add Location wizard and draft preview
    const [expandedTop, setExpandedTop] = useState({});
    const [expandedSub, setExpandedSub] = useState({});
    // Removed Unassigned from Areas UI
    // Simple error helper to surface network issues
    const showError = (e) => {
        const msg = e?.message ? String(e.message) : 'Unknown error';
        alert(`Request failed. Please ensure the API is running and reachable.\n\nDetails: ${msg}`);
    };
    useEffect(() => {
        if (activeModule === 'cannabis') {
            api.getPlants().then(setPlants);
        }
        else {
            setPlants([]);
        }
        setSelectedTop(null);
        setSelectedSub(null);
        setSelectedPlant(null);
    }, [activeModule]);
    // Load geolocations on mount/when module is cannabis
    useEffect(() => {
        if (activeModule !== 'cannabis')
            return;
        (async () => {
            try {
                const gs = await api.getGeos();
                setGeoList(gs);
            }
            catch {
                setGeoList([]);
            }
        })();
    }, [activeModule]);
    // When a geolocation is selected, load its facilities
    useEffect(() => {
        if (!selectedGeo) {
            setFacilityList([]);
            return;
        }
        (async () => {
            try {
                const fs = await api.getFacilities(selectedGeo);
                setFacilityList(fs);
                // also cache in facilitiesByGeo for counts
                setFacilitiesByGeo((prev) => ({ ...prev, [selectedGeo]: fs }));
            }
            catch {
                setFacilityList([]);
            }
        })();
    }, [selectedGeo]);
    // When a facility is selected, load its structures
    useEffect(() => {
        if (!selectedFacility)
            return;
        (async () => {
            try {
                const list = await api.getStructures(selectedFacility);
                const mapped = list.map((s) => ({ id: s.id, facility: s.facility?.id, name: s.name, type: s.type, size: s.size }));
                // Merge with any structures from other facilities
                setStructureList((prev) => {
                    const others = prev.filter((x) => x.facility !== selectedFacility);
                    return [...others, ...mapped];
                });
            }
            catch {
                // no-op
            }
        })();
    }, [selectedFacility]);
    const locations = useMemo(() => buildLocations(plants.filter((p) => !p.harvested)), [plants]);
    // Derive geolocations from the first segment before first comma in facility name if available, else use full facility name.
    // Geolocations come from local storage only (empty state supported)
    const geos = useMemo(() => geoList.sort((a, b) => a.name.localeCompare(b.name)), [geoList]);
    const facilitiesForGeo = useMemo(() => {
        if (!selectedGeo)
            return [];
        return facilityList.filter(f => f.geo?.id === selectedGeo).sort((a, b) => a.name.localeCompare(b.name));
    }, [facilityList, selectedGeo]);
    // Prefetch facilities for all geos so counters are populated
    useEffect(() => {
        if (geos.length === 0)
            return;
        (async () => {
            try {
                const entries = await Promise.all(geos.map(async (g) => {
                    try {
                        const fs = await api.getFacilities(g.id);
                        return [g.id, fs];
                    }
                    catch {
                        return [g.id, []];
                    }
                }));
                setFacilitiesByGeo((prev) => {
                    const next = { ...prev };
                    for (const [gid, fs] of entries)
                        next[gid] = fs;
                    return next;
                });
            }
            catch {
                // ignore
            }
        })();
    }, [geos]);
    // Prefetch structures for all facilities in current geolocation so facility counters show immediately
    useEffect(() => {
        if (facilitiesForGeo.length === 0)
            return;
        (async () => {
            const ids = facilitiesForGeo.map((f) => f.id);
            try {
                const lists = await Promise.all(ids.map(async (fid) => {
                    try {
                        const list = await api.getStructures(fid);
                        return list.map((s) => ({ id: s.id, facility: s.facility?.id, name: s.name, type: s.type, size: s.size }));
                    }
                    catch {
                        return [];
                    }
                }));
                const flattened = [].concat(...lists);
                setStructureList((prev) => {
                    const toExclude = new Set(ids);
                    const others = prev.filter((x) => !toExclude.has(x.facility));
                    return [...others, ...flattened];
                });
            }
            catch {
                // ignore
            }
        })();
    }, [facilitiesForGeo]);
    // Modals state
    const [geoModalOpen, setGeoModalOpen] = useState(false);
    const [geoForm, setGeoForm] = useState({ name: '', address: '' });
    const [facilityModalOpen, setFacilityModalOpen] = useState(false);
    const [facilityForm, setFacilityForm] = useState({ name: '', type: 'farm' });
    const loadStructures = () => {
        try {
            return JSON.parse(localStorage.getItem('mvp.structures') || '[]');
        }
        catch {
            return [];
        }
    };
    const [structureList, setStructureList] = useState(loadStructures);
    const persistStructures = (arr) => { setStructureList(arr); localStorage.setItem('mvp.structures', JSON.stringify(arr)); };
    const [structureModalOpen, setStructureModalOpen] = useState(false);
    // Equipment modal state
    const [equipModalOpen, setEquipModalOpen] = useState(false);
    const [structureForm, setStructureForm] = useState({ name: '', type: 'room', size: '', usage: '', tents: [], racks: [] });
    // Structures available for the currently selected facility
    const topsForFacility = useMemo(() => {
        if (!selectedFacility)
            return [];
        const local = structureList
            .filter(s => s.facility === selectedFacility)
            .map((s) => {
            const leftBase = s.type === 'room'
                ? `Indoor ${s.name.replace(/^Indoor\s+/i, '')}`
                : (s.name.match(/^Greenhouse\s+/i) ? s.name : `Greenhouse ${s.name.replace(/^Greenhouse\s+/i, '')}`);
            const facilityName = facilityList.find(f => f.id === selectedFacility)?.name || '';
            const key = `${leftBase} - ${facilityName}`;
            return { key, type: s.type, sublocations: {}, plants: [] };
        });
        return local.sort((a, b) => leftNameFromTop(a.key, a.type).localeCompare(leftNameFromTop(b.key, b.type)));
    }, [structureList, selectedFacility]);
    const topList = useMemo(() => Object.values(locations).sort((a, b) => a.key.localeCompare(b.key)), [locations]);
    const subList = useMemo(() => {
        if (!selectedTop)
            return [];
        return Object.values(locations[selectedTop]?.sublocations || {}).sort((a, b) => a.key.localeCompare(b.key));
    }, [locations, selectedTop]);
    if (activeModule !== 'cannabis') {
        return (_jsx(Card, { children: _jsxs("p", { className: "text-sm text-gray-700", children: ["Plants for ", activeModule, " are not yet implemented in this MVP."] }) }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("h1", { className: "text-2xl font-semibold text-gray-900 inline-flex items-center gap-2", children: [_jsx(MapIcon, { className: "h-6 w-6", "aria-hidden": true }), " Facilities"] }) }), _jsx("div", { className: "xl:hidden", children: _jsx(Card, { children: _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Geolocation" }), _jsxs("select", { className: "text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary", value: selectedGeo || '', onChange: (e) => { const v = e.target.value || null; setSelectedGeo(v); setSelectedFacility(null); setSelectedTop(null); setSelectedSub(null); setSelectedPlant(null); }, children: [_jsx("option", { value: "", children: "Select\u2026" }), geos.map((g) => (_jsx("option", { value: g.id, children: g.name }, g.id)))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Facility" }), _jsxs("select", { className: "text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary", value: selectedFacility || '', onChange: (e) => { const v = e.target.value || null; setSelectedFacility(v); setSelectedTop(null); setSelectedSub(null); setSelectedPlant(null); }, disabled: !selectedGeo, children: [_jsx("option", { value: "", children: "Select\u2026" }), facilitiesForGeo.map((f) => (_jsxs("option", { value: f.id, children: [f.name, " \u00B7 ", f.type] }, f.id)))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Location" }), _jsxs("select", { className: "text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary", value: selectedTop || '', onChange: (e) => { const v = e.target.value || null; setSelectedTop(v); setSelectedSub(null); setSelectedPlant(null); }, disabled: !selectedFacility, children: [_jsx("option", { value: "", children: "Select\u2026" }), topsForFacility.map((t) => (_jsx("option", { value: t.key, children: formatTopKeyDisplay(t.key, t.type) }, t.key)))] })] }), _jsxs("div", { className: "flex items-center gap-2 lg:hidden", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Area" }), _jsxs("select", { className: "text-base border-gray-300 rounded-md focus:ring-primary focus:border-primary", value: selectedSub || '', onChange: (e) => { const v = e.target.value || null; setSelectedSub(v || null); setSelectedPlant(null); }, disabled: !selectedTop, children: [_jsx("option", { value: "", children: "Select\u2026" }), selectedTop && (Object.values(locations[selectedTop]?.sublocations || {})
                                                .sort((a, b) => a.key.localeCompare(b.key))
                                                .map((s) => (_jsx("option", { value: s.key, children: s.key }, s.key))))] })] })] }) }) }), _jsxs("div", { className: "grid gap-4 items-start grid-cols-1 md:[grid-template-columns:280px_minmax(0,1fr)] lg:[grid-template-columns:280px_280px_minmax(0,1fr)] xl:[grid-template-columns:280px_280px_280px_280px_minmax(0,1fr)]", children: [!selectedPlant && (_jsx(Card, { className: "hidden xl:block", children: _jsxs("div", { className: "w-full min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h2", { className: "text-base font-medium text-gray-900", children: "Geolocations" }), _jsx("button", { className: "p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50", "aria-label": "Add geolocation", onClick: () => setGeoModalOpen(true), children: _jsx(Plus, { className: "h-4 w-4", "aria-hidden": true }) })] }), geos.length > 0 ? (_jsx("div", { children: _jsx("ul", { className: "divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden", children: geos.map((g) => (_jsx("li", { children: _jsxs("button", { className: `w-full text-left px-3 py-2 flex items-center justify-between ${selectedGeo === g.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`, onClick: () => { setSelectedGeo(g.id); setSelectedFacility(null); setSelectedTop(null); setSelectedSub(null); setSelectedPlant(null); }, children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-base text-gray-900 truncate", children: g.name }), _jsxs("div", { className: "text-sm text-gray-500", children: [(facilitiesByGeo[g.id] || []).length, " facilities"] })] }), _jsx(ChevronRight, { className: "h-4 w-4 text-gray-400 shrink-0", "aria-hidden": true })] }) }, g.id))) }) })) : (_jsx("div", { className: "border border-dashed border-gray-300 rounded-lg p-4 text-center text-base text-gray-700", children: "No geolocations" }))] }) })), selectedGeo && (_jsx(Card, { className: "hidden lg:block", children: _jsxs("div", { className: "w-full min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h2", { className: "text-base font-medium text-gray-900", children: "Facilities" }), _jsx("button", { className: "p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50", "aria-label": "Add facility", onClick: () => { setFacilityForm({ name: '', type: 'farm' }); setFacilityModalOpen(true); }, children: _jsx(Plus, { className: "h-4 w-4", "aria-hidden": true }) })] }), _jsxs("ul", { className: "divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden", children: [facilitiesForGeo.map((f) => (_jsx("li", { children: _jsxs("button", { className: `w-full text-left px-3 py-2 flex items-center justify-between ${selectedFacility === f.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`, onClick: () => { setSelectedFacility(f.id); setSelectedTop(null); setSelectedSub(null); setSelectedPlant(null); }, children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "text-base text-gray-900 truncate", children: [f.name, " ", _jsxs("span", { className: "text-sm text-gray-500", children: ["\u00B7 ", f.type] })] }), _jsxs("div", { className: "text-sm text-gray-500", children: [structureList.filter((s) => s.facility === f.id).length, " structures"] })] }), _jsx(ChevronRight, { className: "h-4 w-4 text-gray-400 shrink-0", "aria-hidden": true })] }) }, f.id))), facilitiesForGeo.length === 0 && (_jsx("li", { className: "px-3 py-2 text-base text-gray-500", children: "No facilities." }))] })] }) })), selectedFacility && (_jsx(Card, { className: "hidden lg:block", children: _jsxs("div", { className: "w-full min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h2", { className: "text-base font-medium text-gray-900", children: "Structures" }), _jsx("button", { className: "p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50", "aria-label": "Add structure", onClick: () => {
                                                const f = facilityList.find((x) => x.id === selectedFacility);
                                                const defType = (f?.type === 'building') ? 'room' : 'greenhouse';
                                                setStructureForm({ name: '', type: defType, size: '', usage: '', tents: [], racks: [] });
                                                setStructureModalOpen(true);
                                            }, children: _jsx(Plus, { className: "h-4 w-4", "aria-hidden": true }) })] }), (() => {
                                    const tops = topsForFacility;
                                    return tops.length > 0 ? (_jsx("ul", { className: "divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden", children: tops.map((loc) => {
                                            const subs = Object.values(loc.sublocations);
                                            const plantCount = subs.reduce((a, s) => a + s.plants.length, 0) + loc.plants.length;
                                            const active = selectedTop === loc.key;
                                            const subsTyped = subs.map((s) => s.type);
                                            const countBy = (t) => subsTyped.filter((x) => x === t).length;
                                            const tents = countBy('tent');
                                            const racks = countBy('rack');
                                            const beds = countBy('bed');
                                            const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
                                            const summary = (() => {
                                                if (loc.type === 'room') {
                                                    const parts = [];
                                                    if (tents > 0)
                                                        parts.push(plural(tents, 'tent'));
                                                    if (racks > 0)
                                                        parts.push(plural(racks, 'rack'));
                                                    parts.push(plural(plantCount, 'plant'));
                                                    return parts.join(' . ');
                                                }
                                                if (loc.type === 'greenhouse') {
                                                    const parts = [];
                                                    if (beds > 0)
                                                        parts.push(plural(beds, 'bed'));
                                                    parts.push(plural(plantCount, 'plant'));
                                                    return parts.join(' . ');
                                                }
                                                return `${subs.length} areas . ${plural(plantCount, 'plant')}`;
                                            })();
                                            return (_jsx("li", { children: _jsxs("button", { className: `w-full text-left px-3 py-2 flex items-center justify-between ${active ? 'bg-primary/5' : 'hover:bg-gray-50'}`, onClick: () => {
                                                        setSelectedTop(loc.key);
                                                        setSelectedSub(null);
                                                        setSelectedPlant(null);
                                                        // Scroll to equipment column
                                                        setTimeout(() => {
                                                            equipmentRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
                                                        }, 50);
                                                    }, children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-base text-gray-900 truncate", children: leftNameFromTop(loc.key, loc.type) }), _jsx("div", { className: "text-sm text-gray-500", children: summary })] }), _jsx(ChevronRight, { className: "h-4 w-4 text-gray-400 shrink-0", "aria-hidden": true })] }) }, loc.key));
                                        }) })) : (_jsx("div", { className: "border border-dashed border-gray-300 rounded-lg p-4 text-center text-base text-gray-700", children: "No structures." }));
                                })()] }) })), selectedTop && (_jsx("div", { ref: equipmentRef, className: "hidden lg:block", children: _jsx(Card, { children: _jsxs("div", { className: "w-full min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h2", { className: "text-base font-medium text-gray-900", children: "Equipment" }), _jsx("button", { className: "p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50", "aria-label": "Add equipment", onClick: () => setEquipModalOpen(true), children: _jsx(Plus, { className: "h-4 w-4", "aria-hidden": true }) })] }), _jsx("div", { className: "border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500", children: "No equipment" })] }) }) })), selectedPlant && (_jsx("div", { className: "w-full min-w-0", children: _jsx(PlantDetailsView, { plant: selectedPlant, onBack: () => setSelectedPlant(null) }) }))] }), geoModalOpen && (_jsx("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl w-[520px] max-w-[95vw] p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(MapPin, { className: "h-5 w-5 text-primary", "aria-hidden": true }), _jsx("h3", { className: "text-base font-semibold text-gray-900", children: "Add geolocation" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Name" }), _jsx("input", { className: "w-full border border-gray-300 rounded-md px-2 py-1.5 text-base", value: geoForm.name, onChange: (e) => setGeoForm(v => ({ ...v, name: e.target.value })), placeholder: "e.g., Munich HQ" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Address" }), _jsx("input", { className: "w-full border border-gray-300 rounded-md px-2 py-1.5 text-base", value: geoForm.address, onChange: (e) => setGeoForm(v => ({ ...v, address: e.target.value })), placeholder: "Street, City\u2026" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Pick on map (mock)" }), _jsx("div", { className: "h-48 rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center text-sm text-gray-500", children: "Map mock" })] })] }), _jsxs("div", { className: "mt-4 flex items-center justify-end gap-2", children: [_jsx("button", { className: "px-3 py-1.5 text-sm text-gray-700", onClick: () => setGeoModalOpen(false), children: "Cancel" }), _jsx("button", { className: "inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-50", disabled: !geoForm.name.trim(), onClick: async () => {
                                        try {
                                            const created = await api.createGeo({ name: geoForm.name.trim(), address: geoForm.address.trim() });
                                            const gs = await api.getGeos();
                                            setGeoList(gs);
                                            setSelectedGeo(created.id);
                                            setGeoModalOpen(false);
                                            setGeoForm({ name: '', address: '' });
                                        }
                                        catch (e) {
                                            showError(e);
                                        }
                                    }, children: "Confirm" })] })] }) })), facilityModalOpen && (_jsx("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl w-[520px] max-w-[95vw] p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Layers, { className: "h-5 w-5 text-primary", "aria-hidden": true }), _jsx("h3", { className: "text-base font-semibold text-gray-900", children: "Add facility" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Type" }), _jsxs("select", { className: "w-full border border-gray-300 rounded-md px-2 py-1.5 text-base", value: facilityForm.type, onChange: (e) => setFacilityForm(v => ({ ...v, type: e.target.value })), children: [_jsx("option", { value: "farm", children: "Farm" }), _jsx("option", { value: "building", children: "Building" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Name" }), _jsx("input", { className: "w-full border border-gray-300 rounded-md px-2 py-1.5 text-base", value: facilityForm.name, onChange: (e) => setFacilityForm(v => ({ ...v, name: e.target.value })), placeholder: "e.g., North Farm or Building A" })] })] }), _jsxs("div", { className: "mt-4 flex items-center justify-end gap-2", children: [_jsx("button", { className: "px-3 py-1.5 text-sm text-gray-700", onClick: () => setFacilityModalOpen(false), children: "Cancel" }), _jsx("button", { className: "inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-50", disabled: !selectedGeo || !facilityForm.name.trim(), onClick: async () => {
                                        if (!selectedGeo)
                                            return;
                                        try {
                                            const created = await api.createFacility({ geoId: selectedGeo, name: facilityForm.name.trim(), type: facilityForm.type });
                                            const fs = await api.getFacilities(selectedGeo);
                                            setFacilityList(fs);
                                            setSelectedFacility(created.id);
                                            setFacilityModalOpen(false);
                                            setFacilityForm({ name: '', type: 'farm' });
                                        }
                                        catch (e) {
                                            showError(e);
                                        }
                                    }, children: "Confirm" })] })] }) })), structureModalOpen && selectedFacility && (_jsx("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl shadow-xl w-[520px] max-w-[95vw] p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Layers, { className: "h-5 w-5 text-primary", "aria-hidden": true }), _jsx("h3", { className: "text-base font-semibold text-gray-900", children: "Add structure" })] }), _jsxs("div", { className: "space-y-3", children: [(() => {
                                    // selectedFacility holds the facility id; match by id
                                    const f = facilityList.find((x) => x.id === selectedFacility);
                                    const allowed = (f?.type === 'building') ? 'room' : 'greenhouse';
                                    // Ensure form type always matches allowed
                                    if (structureForm.type !== allowed) {
                                        setStructureForm((v) => ({ ...v, type: allowed }));
                                    }
                                    return (_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Type" }), _jsx("select", { className: "w-full border border-gray-300 rounded-md px-2 py-1.5 text-base bg-gray-50", value: allowed, disabled: true, children: _jsx("option", { value: allowed, children: allowed === 'room' ? 'Room' : 'Greenhouse' }) })] }));
                                })(), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Name" }), (() => {
                                            const f = facilityList.find((x) => x.id === selectedFacility);
                                            const allowed = (f?.type === 'building') ? 'room' : 'greenhouse';
                                            const ph = allowed === 'room' ? 'e.g., Room 1' : 'e.g., Greenhouse 2';
                                            return (_jsx("input", { className: "w-full border border-gray-300 rounded-md px-2 py-1.5 text-base", value: structureForm.name, onChange: (e) => setStructureForm((v) => ({ ...v, name: e.target.value })), placeholder: ph }));
                                        })()] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Size (m\u00B2)" }), _jsx("input", { type: "number", min: "0", step: "0.1", className: "w-full border border-gray-300 rounded-md px-2 py-1.5 text-base", value: structureForm.size, onChange: (e) => setStructureForm((v) => ({ ...v, size: e.target.value })), placeholder: "e.g., 120" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Usage" }), (() => {
                                            const f = facilityList.find((x) => x.id === selectedFacility);
                                            const allowed = (f?.type === 'building') ? 'room' : 'greenhouse';
                                            const options = allowed === 'greenhouse' ? ['Vegetative', 'Flowering'] : ['Vegetative', 'Flowering', 'Drying', 'Storage', 'Racks/Tents'];
                                            // Ensure selection remains valid when allowed changes
                                            if (structureForm.usage && !options.includes(structureForm.usage)) {
                                                setStructureForm((v) => ({ ...v, usage: '', tents: [], racks: [] }));
                                            }
                                            return (_jsxs("select", { className: "w-full border border-gray-300 rounded-md px-2 py-1.5 text-base", value: structureForm.usage, onChange: (e) => {
                                                    const next = e.target.value;
                                                    setStructureForm((v) => ({ ...v, usage: next, tents: next === 'Racks/Tents' ? (v.tents?.length ? v.tents : [{ widthFt: '', lengthFt: '' }]) : [], racks: next === 'Racks/Tents' ? (v.racks?.length ? v.racks : [{ widthCm: '', lengthCm: '', shelves: '' }]) : [] }));
                                                }, children: [_jsx("option", { value: "", children: "Select\u2026" }), options.map(o => (_jsx("option", { value: o, children: o }, o)))] }));
                                        })()] }), (() => {
                                    const f = facilityList.find((x) => x.id === selectedFacility);
                                    const allowed = (f?.type === 'building') ? 'room' : 'greenhouse';
                                    if (allowed !== 'room' || structureForm.usage !== 'Racks/Tents')
                                        return null;
                                    // Helper to compute total tent+rack area in m^2
                                    const ft2m = (ft) => ft * 0.3048;
                                    const tentAreaM2 = (w, l) => ft2m(w) * ft2m(l);
                                    const totalTentM2 = (structureForm.tents || []).reduce((sum, t) => sum + (tentAreaM2(Number(t.widthFt || 0), Number(t.lengthFt || 0)) || 0), 0);
                                    const cm2m = (cm) => cm / 100;
                                    const rackAreaM2 = (wcm, lcm) => cm2m(wcm) * cm2m(lcm);
                                    const totalRackM2 = (structureForm.racks || []).reduce((sum, r) => sum + (rackAreaM2(Number(r.widthCm || 0), Number(r.lengthCm || 0)) || 0), 0);
                                    const roomM2 = Number(structureForm.size || '0') || 0;
                                    const over = (totalTentM2 + totalRackM2) > roomM2 + 1e-6;
                                    return (_jsxs("div", { className: "rounded-md border border-gray-200 p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("label", { className: "block text-sm text-gray-700", children: "Racks/Tents for this room" }), _jsx("button", { type: "button", className: "inline-flex items-center gap-1 px-2 py-1 rounded-md border border-primary/40 text-primary text-xs hover:bg-primary/5", onClick: () => setStructureForm(v => ({ ...v, tents: [...(v.tents || []), { widthFt: '', lengthFt: '' }] })), children: "Add tent (ft \u00D7 ft)" })] }), _jsx("div", { className: "space-y-2", children: (structureForm.tents || []).map((t, ti) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs text-gray-600", children: ["Tent ", ti + 1] }), _jsx("input", { className: "w-20 border-gray-300 rounded-md focus:ring-primary focus:border-primary", placeholder: "Width ft", inputMode: "numeric", value: t.widthFt, onChange: (e) => setStructureForm(v => ({ ...v, tents: v.tents.map((x, i) => i === ti ? { ...x, widthFt: e.target.value } : x) })) }), _jsx("span", { className: "text-gray-500", children: "\u00D7" }), _jsx("input", { className: "w-20 border-gray-300 rounded-md focus:ring-primary focus:border-primary", placeholder: "Length ft", inputMode: "numeric", value: t.lengthFt, onChange: (e) => setStructureForm(v => ({ ...v, tents: v.tents.map((x, i) => i === ti ? { ...x, lengthFt: e.target.value } : x) })) }), _jsx("button", { type: "button", className: "ml-auto text-xs text-red-600 hover:underline", onClick: () => setStructureForm(v => ({ ...v, tents: v.tents.filter((_, i) => i !== ti) })), children: "Remove" })] }, ti))) }), _jsxs("div", { className: "flex items-center justify-between mt-3 mb-2", children: [_jsx("label", { className: "block text-sm text-gray-700", children: "Add rack (cm \u00D7 cm + shelves)" }), _jsx("button", { type: "button", className: "inline-flex items-center gap-1 px-2 py-1 rounded-md border border-primary/40 text-primary text-xs hover:bg-primary/5", onClick: () => setStructureForm(v => ({ ...v, racks: [...(v.racks || []), { widthCm: '', lengthCm: '', shelves: '' }] })), children: "Add rack" })] }), _jsx("div", { className: "space-y-2", children: (structureForm.racks || []).map((r, ri) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs text-gray-600", children: ["Rack ", ri + 1] }), _jsx("input", { className: "w-24 border-gray-300 rounded-md focus:ring-primary focus:border-primary", placeholder: "Width cm", inputMode: "numeric", value: r.widthCm, onChange: (e) => setStructureForm(v => ({ ...v, racks: v.racks.map((x, i) => i === ri ? { ...x, widthCm: e.target.value } : x) })) }), _jsx("span", { className: "text-gray-500", children: "\u00D7" }), _jsx("input", { className: "w-24 border-gray-300 rounded-md focus:ring-primary focus:border-primary", placeholder: "Length cm", inputMode: "numeric", value: r.lengthCm, onChange: (e) => setStructureForm(v => ({ ...v, racks: v.racks.map((x, i) => i === ri ? { ...x, lengthCm: e.target.value } : x) })) }), _jsx("span", { className: "text-gray-500", children: "\u00B7" }), _jsx("input", { className: "w-24 border-gray-300 rounded-md focus:ring-primary focus:border-primary", placeholder: "# Shelves", inputMode: "numeric", value: r.shelves, onChange: (e) => setStructureForm(v => ({ ...v, racks: v.racks.map((x, i) => i === ri ? { ...x, shelves: e.target.value } : x) })) }), _jsx("button", { type: "button", className: "ml-auto text-xs text-red-600 hover:underline", onClick: () => setStructureForm(v => ({ ...v, racks: v.racks.filter((_, i) => i !== ri) })), children: "Remove" })] }, ri))) }), _jsxs("div", { className: `mt-2 text-xs ${over ? 'text-red-600' : 'text-gray-600'}`, children: ["Total area (tents+racks): ", (totalTentM2 + totalRackM2).toFixed(2), " m\u00B2 ", roomM2 ? `(room: ${roomM2.toFixed(2)} m²)` : '', over && _jsx("span", { className: "ml-2", children: "Exceeds room size" })] })] }));
                                })()] }), _jsxs("div", { className: "mt-4 flex items-center justify-end gap-2", children: [_jsx("button", { className: "px-3 py-1.5 text-sm text-gray-700", onClick: () => setStructureModalOpen(false), children: "Cancel" }), _jsx("button", { className: "inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm hover:opacity-90 disabled:opacity-50", disabled: !structureForm.name.trim() || structureForm.size.trim() === '' || !structureForm.usage || (structureForm.usage === 'Racks/Tents' && (() => {
                                        const ft2m = (ft) => ft * 0.3048;
                                        const areaT = (w, l) => ft2m(w) * ft2m(l);
                                        const totalT = (structureForm.tents || []).reduce((s, t) => s + areaT(Number(t.widthFt || 0), Number(t.lengthFt || 0)), 0);
                                        const cm2m = (cm) => cm / 100;
                                        const areaR = (w, l) => cm2m(w) * cm2m(l);
                                        const totalR = (structureForm.racks || []).reduce((s, r) => s + areaR(Number(r.widthCm || 0), Number(r.lengthCm || 0)), 0);
                                        const room = Number(structureForm.size || '0') || 0;
                                        return totalT + totalR > room + 1e-6;
                                    })()), onClick: async () => {
                                        if (!selectedFacility)
                                            return;
                                        try {
                                            const name = structureForm.name.trim();
                                            // Enforce allowed type based on facility kind
                                            const f = facilityList.find((x) => x.id === selectedFacility);
                                            const allowedType = (f?.type === 'building') ? 'room' : 'greenhouse';
                                            const type = allowedType;
                                            const sizeNum = Number(structureForm.size);
                                            const tents = structureForm.usage === 'Racks/Tents' ? (structureForm.tents || []).map(t => ({ widthFt: Number(t.widthFt || 0), lengthFt: Number(t.lengthFt || 0) })) : undefined;
                                            const racks = structureForm.usage === 'Racks/Tents' ? (structureForm.racks || []).map(r => ({ widthCm: Number(r.widthCm || 0), lengthCm: Number(r.lengthCm || 0), shelves: Number(r.shelves || 0) })) : undefined;
                                            await api.createStructure({ facilityId: selectedFacility, name, type, size: isNaN(sizeNum) ? 0 : sizeNum, usage: structureForm.usage, tents, racks });
                                            const list = await api.getStructures(selectedFacility);
                                            setStructureList(list.map((s) => ({ id: s.id, facility: s.facility?.id, name: s.name, type: s.type, size: s.size, usage: s.usage, tents: s.tents, racks: s.racks })));
                                            setStructureModalOpen(false);
                                            setStructureForm({ name: '', type: 'room', size: '', usage: '', tents: [], racks: [] });
                                        }
                                        catch (e) {
                                            showError(e);
                                        }
                                    }, children: "Confirm" })] })] }) }))] }));
}
function TreeView({ items, expandedTop, expandedSub, onToggleTop, onToggleSub, onSelectPlant, }) {
    const grouped = { Indoor: [], Outdoor: [] };
    items.forEach((i) => {
        const cat = categoryTitle(i.type);
        if (cat === 'Indoor')
            grouped.Indoor.push(i);
        else if (cat === 'Outdoor')
            grouped.Outdoor.push(i);
    });
    const sections = [
        { title: 'Indoor', list: grouped.Indoor },
        { title: 'Outdoor', list: grouped.Outdoor },
    ].filter((s) => s.list.length > 0);
    return (_jsx("div", { className: "text-sm", children: sections.map((sec) => (_jsxs("div", { className: "mb-3", children: [_jsx("div", { className: "px-2 py-1 text-xs uppercase tracking-wide text-gray-500", children: sec.title }), _jsx("ul", { className: "space-y-1", children: sec.list.map((loc) => {
                        const isOpen = !!expandedTop[loc.key];
                        const subs = Object.values(loc.sublocations).sort((a, b) => a.key.localeCompare(b.key));
                        const plantCount = subs.reduce((a, s) => a + s.plants.length, 0) + loc.plants.length;
                        return (_jsxs("li", { children: [_jsxs("div", { className: "flex items-start gap-2 px-2 py-1.5 rounded hover:bg-gray-50", children: [_jsx("button", { className: "shrink-0 p-1 rounded border border-gray-200 hover:bg-white", onClick: () => onToggleTop(loc.key), "aria-label": isOpen ? 'Collapse' : 'Expand', children: isOpen ? _jsx(ChevronDown, { className: "h-4 w-4", "aria-hidden": true }) : _jsx(ChevronRight, { className: "h-4 w-4", "aria-hidden": true }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "font-medium text-gray-900", children: loc.key }), _jsxs("div", { className: "text-xs text-gray-500", children: [plantCount, " plants"] })] }), _jsx("div", { className: "text-[11px] text-gray-500", children: subCategoryTitle(loc.type) })] })] }), isOpen && (_jsxs("div", { className: "ml-6 mt-1", children: [loc.plants.length > 0 && (_jsxs("div", { className: "mb-1", children: [_jsx("div", { className: "text-[11px] text-gray-500 px-2", children: "Unassigned" }), _jsx("ul", { className: "mt-1 space-y-1", children: loc.plants.map((p) => (_jsx("li", { children: _jsxs("button", { className: "w-full text-left flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50", onClick: () => onSelectPlant(p), children: [_jsx(Sprout, { className: "h-3.5 w-3.5 text-emerald-600", "aria-hidden": true }), _jsx("span", { className: "text-gray-800", children: p.strain }), _jsx("span", { className: "ml-auto text-[11px] text-gray-500", children: p.id.slice(0, 6) })] }) }, p.id))) })] })), _jsx("ul", { className: "space-y-1", children: subs.map((s) => {
                                                const key = `${loc.key}::${s.key}`;
                                                const open = !!expandedSub[key];
                                                return (_jsxs("li", { children: [_jsxs("div", { className: "flex items-start gap-2 px-2 py-1.5 rounded hover:bg-gray-50", children: [_jsx("button", { className: "shrink-0 p-1 rounded border border-gray-200 hover:bg-white", onClick: () => onToggleSub(loc.key, s.key), "aria-label": open ? 'Collapse area' : 'Expand area', children: open ? _jsx(ChevronDown, { className: "h-4 w-4", "aria-hidden": true }) : _jsx(ChevronRight, { className: "h-4 w-4", "aria-hidden": true }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-gray-800", children: s.key }), _jsxs("div", { className: "text-[11px] text-gray-500", children: [s.plants.length, " plants"] })] }), _jsx("div", { className: "text-[11px] text-gray-500 capitalize", children: s.type })] })] }), open && (_jsx("ul", { className: "ml-6 mt-1 space-y-1", children: s.plants.map((p) => (_jsx("li", { children: _jsxs("button", { className: "w-full text-left flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50", onClick: () => onSelectPlant(p), children: [_jsx(Sprout, { className: "h-3.5 w-3.5 text-emerald-600", "aria-hidden": true }), _jsx("span", { className: "text-gray-800", children: p.strain }), _jsx("span", { className: "ml-auto text-[11px] text-gray-500", children: p.id.slice(0, 6) })] }) }, p.id))) }))] }, s.key));
                                            }) })] }))] }, loc.key));
                    }) })] }, sec.title))) }));
}
function PlantGrid({ plants, onOpen }) {
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: plants.map((p) => (_jsxs("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm p-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("div", { className: "font-medium text-gray-900", children: p.strain }), _jsx(Sprout, { className: "h-4 w-4 text-green-600", "aria-hidden": true })] }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["Planted ", new Date(p.plantedAt).toLocaleDateString()] }), _jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsx("code", { className: "text-[11px] text-gray-600", children: p.id.slice(0, 8) }), onOpen ? (_jsx("button", { className: "text-xs text-primary hover:underline", onClick: () => onOpen(p), children: "View" })) : (_jsx("span", { className: "text-xs text-gray-400", children: "Details" }))] })] }, p.id))) }));
}
function PlantDetailsView({ plant, onBack }) {
    const ageDays = Math.floor((Date.now() - new Date(plant.plantedAt).getTime()) / 86400000);
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsxs("button", { onClick: onBack, className: "inline-flex items-center gap-1 text-sm text-primary hover:underline", children: [_jsx(ChevronLeft, { className: "h-4 w-4", "aria-hidden": true }), " Back to plants"] }) }), _jsx(Card, { children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "shrink-0 rounded-md bg-emerald-50 p-2", children: _jsx(Sprout, { className: "h-6 w-6 text-emerald-600", "aria-hidden": true }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: plant.strain }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Plant ID: ", _jsx("code", { className: "text-xs", children: plant.id })] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Location: ", prettyLocationString(plant.location)] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Planted: ", new Date(plant.plantedAt).toLocaleString(), " (", ageDays, " days ago)"] })] })] }) }), _jsx(Card, { children: _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsx(Info, { className: "h-4 w-4 text-gray-400", "aria-hidden": true }), "Lifecycle and event history will appear here in future iterations."] }) })] }));
}
