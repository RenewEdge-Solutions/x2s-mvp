import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { FileText, Download, Plus } from 'lucide-react';
import { api } from '../lib/api';
export default function Reports() {
    const [types, setTypes] = useState([]);
    const [created, setCreated] = useState([]);
    const [loading, setLoading] = useState(false);
    const refresh = async () => {
        const [t, c] = await Promise.all([api.getReportTypes(), api.listReports()]);
        setTypes(t);
        setCreated(c);
    };
    useEffect(() => {
        refresh();
    }, []);
    const create = async (type) => {
        setLoading(true);
        try {
            await api.createReport(type);
            await refresh();
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(Card, { title: "Automated reports", subtitle: "Generated on demand; always up to date", children: _jsx("ul", { className: "divide-y divide-gray-100", children: types.map((t) => (_jsxs("li", { className: "py-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "h-5 w-5 text-gray-500", "aria-hidden": true }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: t.label }), _jsxs("div", { className: "text-xs text-gray-500", children: [t.description, " \u2022 ", t.format.toUpperCase()] })] })] }), _jsxs("a", { className: "inline-flex items-center gap-1 text-primary hover:underline text-sm", href: api.autoReportUrl(t.key), children: [_jsx(Download, { className: "h-4 w-4", "aria-hidden": true }), " Download"] })] }, t.key))) }) }), _jsx(Card, { title: "Create a report", subtitle: "Persist a snapshot you can reference later", children: _jsx("div", { className: "space-y-3", children: types.map((t) => (_jsxs("button", { disabled: loading, onClick: () => create(t.key), className: "w-full inline-flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50", children: [_jsxs("span", { className: "flex items-center gap-3 text-gray-800", children: [_jsx(Plus, { className: "h-4 w-4", "aria-hidden": true }), " ", t.label] }), _jsx("span", { className: "text-xs text-gray-500", children: t.format.toUpperCase() })] }, t.key))) }) }), _jsx(Card, { title: "Created reports", subtitle: "Previously generated files", children: created.length === 0 ? (_jsx("div", { className: "text-sm text-gray-600", children: "No reports yet. Use \"Create a report\" to add one." })) : (_jsx("ul", { className: "divide-y divide-gray-100", children: created.map((r) => (_jsxs("li", { className: "py-3 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-900 font-medium", children: labelOf(r.type) }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(r.createdAt).toLocaleString() })] }), _jsxs("a", { className: "inline-flex items-center gap-1 text-primary hover:underline text-sm", href: api.downloadReportUrl(r.id), children: [_jsx(Download, { className: "h-4 w-4", "aria-hidden": true }), " Download"] })] }, r.id))) })) })] }));
}
function labelOf(key) {
    switch (key) {
        case 'inventory_summary':
            return 'Inventory Summary';
        case 'harvest_yields':
            return 'Harvest Yields';
        default:
            return key;
    }
}
