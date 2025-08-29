import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { useModule } from '../context/ModuleContext';
import { api } from '../lib/api';
import { Package as PackageIcon, Sprout, Scissors } from 'lucide-react';
export default function Inventory() {
    const { activeModule } = useModule();
    const [plants, setPlants] = useState([]);
    const [harvests, setHarvests] = useState([]);
    useEffect(() => {
        if (activeModule === 'cannabis') {
            api.getPlants().then(setPlants);
            api.getHarvests().then(setHarvests);
        }
        else {
            setPlants([]);
            setHarvests([]);
        }
    }, [activeModule]);
    const summary = useMemo(() => {
        const activePlants = plants.filter((p) => !p.harvested).length;
        const drying = harvests.filter((h) => h.status === 'drying').length;
        const dried = harvests.filter((h) => h.status === 'dried').length;
        return { activePlants, drying, dried };
    }, [plants, harvests]);
    if (activeModule !== 'cannabis') {
        return (_jsx(Card, { children: _jsxs("p", { className: "text-sm text-gray-700", children: ["Inventory for ", activeModule, " is not yet implemented in this MVP."] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("h1", { className: "text-2xl font-semibold text-gray-900 inline-flex items-center gap-2", children: [_jsx(PackageIcon, { className: "h-6 w-6", "aria-hidden": true }), " Inventory"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Active plants" }), _jsxs("div", { className: "text-2xl font-semibold text-gray-900 inline-flex items-center gap-2 mt-1", children: [_jsx(Sprout, { className: "h-5 w-5 text-green-600", "aria-hidden": true }), " ", summary.activePlants] })] }), _jsxs(Card, { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Harvest lots (drying)" }), _jsxs("div", { className: "text-2xl font-semibold text-gray-900 inline-flex items-center gap-2 mt-1", children: [_jsx(Scissors, { className: "h-5 w-5 text-amber-600", "aria-hidden": true }), " ", summary.drying] })] }), _jsxs(Card, { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Harvest lots (dried)" }), _jsxs("div", { className: "text-2xl font-semibold text-gray-900 inline-flex items-center gap-2 mt-1", children: [_jsx(Scissors, { className: "h-5 w-5 text-emerald-700", "aria-hidden": true }), " ", summary.dried] })] })] }), _jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 mb-2", children: "Plants in production" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500", children: [_jsx("th", { className: "py-2 pr-4", children: "Strain" }), _jsx("th", { className: "py-2 pr-4", children: "Location" }), _jsx("th", { className: "py-2 pr-4", children: "Planted" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: plants
                                        .filter((p) => !p.harvested)
                                        .slice(0, 20)
                                        .map((p) => (_jsxs("tr", { className: "text-gray-800", children: [_jsx("td", { className: "py-2 pr-4", children: p.strain }), _jsx("td", { className: "py-2 pr-4", children: p.location }), _jsx("td", { className: "py-2 pr-4", children: new Date(p.plantedAt).toLocaleDateString() })] }, p.id))) })] }) })] }), _jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 mb-2", children: "Harvest lots" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500", children: [_jsx("th", { className: "py-2 pr-4", children: "Lot" }), _jsx("th", { className: "py-2 pr-4", children: "Weight" }), _jsx("th", { className: "py-2 pr-4", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: harvests.slice(0, 20).map((h) => (_jsxs("tr", { className: "text-gray-800", children: [_jsx("td", { className: "py-2 pr-4 font-mono text-xs", children: h.id }), _jsxs("td", { className: "py-2 pr-4", children: [h.yieldGrams, " g"] }), _jsx("td", { className: "py-2 pr-4 capitalize", children: h.status })] }, h.id))) })] }) })] })] }));
}
