import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { api } from '../lib/api';
export default function DataDump() {
    const [plants, setPlants] = useState([]);
    const [harvests, setHarvests] = useState([]);
    const [reports, setReports] = useState([]);
    const [lifecycle, setLifecycle] = useState([]);
    const [integrity, setIntegrity] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [ps, hs, rs, lc, ig] = await Promise.all([
                api.getPlants().catch(() => []),
                api.getHarvests().catch(() => []),
                api.listReports().catch(() => []),
                api.getLifecycle().catch(() => []),
                api.getIntegrity().catch(() => []),
            ]);
            setPlants(ps || []);
            setHarvests(hs || []);
            setReports(rs || []);
            setLifecycle(lc || []);
            setIntegrity(ig || []);
        }
        catch (e) {
            setError(e?.message || 'Failed to load');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    const Section = ({ title, children, count }) => (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h2", { className: "text-lg font-medium text-gray-900", children: title }), _jsx("div", { className: "text-sm text-gray-500", children: count })] }), children] }));
    const Row = ({ label, value }) => (_jsxs("div", { className: "grid grid-cols-[120px_minmax(0,1fr)] gap-3 text-sm", children: [_jsx("div", { className: "text-gray-500", children: label }), _jsx("div", { className: "text-gray-800 break-words", children: value })] }));
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Data (App View)" }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("button", { disabled: loading, onClick: load, className: "px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50", children: "Refresh" }) })] }), error && (_jsx(Card, { children: _jsx("div", { className: "text-sm text-rose-700", children: error }) })), _jsx(Section, { title: "Plants", count: plants.length, children: plants.length === 0 ? (_jsx("div", { className: "text-sm text-gray-600", children: "No plants." })) : (_jsx("ul", { className: "space-y-3", children: plants.map((p) => (_jsx("li", { className: "p-3 border rounded-md", children: _jsxs("div", { className: "grid gap-2", children: [_jsx(Row, { label: "ID", value: _jsx("code", { className: "text-xs", children: p.id }) }), _jsx(Row, { label: "Strain", value: p.strain }), _jsx(Row, { label: "Location", value: p.location }), _jsx(Row, { label: "Planted", value: new Date(p.plantedAt).toLocaleString() }), _jsx(Row, { label: "Harvested", value: String(!!p.harvested) })] }) }, p.id))) })) }), _jsx(Section, { title: "Harvests", count: harvests.length, children: harvests.length === 0 ? (_jsx("div", { className: "text-sm text-gray-600", children: "No harvests." })) : (_jsx("ul", { className: "space-y-3", children: harvests.map((h) => (_jsx("li", { className: "p-3 border rounded-md", children: _jsxs("div", { className: "grid gap-2", children: [_jsx(Row, { label: "ID", value: _jsx("code", { className: "text-xs", children: h.id }) }), _jsx(Row, { label: "Plant", value: _jsx("code", { className: "text-xs", children: h.plantId }) }), _jsx(Row, { label: "Weight", value: `${h.yieldGrams} g` }), _jsx(Row, { label: "Status", value: h.status }), _jsx(Row, { label: "Harvested", value: h.harvestedAt ? new Date(h.harvestedAt).toLocaleString() : '—' })] }) }, h.id))) })) }), _jsx(Section, { title: "Reports", count: reports.length, children: reports.length === 0 ? (_jsx("div", { className: "text-sm text-gray-600", children: "No reports." })) : (_jsx("ul", { className: "space-y-3", children: reports.map((r) => (_jsx("li", { className: "p-3 border rounded-md", children: _jsxs("div", { className: "grid gap-2", children: [_jsx(Row, { label: "ID", value: _jsx("code", { className: "text-xs", children: r.id }) }), _jsx(Row, { label: "Type", value: r.type }), _jsx(Row, { label: "Created", value: new Date(r.createdAt).toLocaleString() })] }) }, r.id))) })) }), _jsx(Section, { title: "Lifecycle events", count: lifecycle.length, children: lifecycle.length === 0 ? (_jsx("div", { className: "text-sm text-gray-600", children: "No events." })) : (_jsx("pre", { className: "text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-80", children: JSON.stringify(lifecycle, null, 2) })) }), _jsx(Section, { title: "Integrity events", count: integrity.length, children: integrity.length === 0 ? (_jsx("div", { className: "text-sm text-gray-600", children: "No events." })) : (_jsx("pre", { className: "text-xs bg-gray-50 p-3 rounded-md overflow-auto max-h-80", children: JSON.stringify(integrity, null, 2) })) })] }));
}
