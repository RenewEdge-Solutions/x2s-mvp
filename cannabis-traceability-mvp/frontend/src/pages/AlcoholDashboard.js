import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import KPI from '../components/KPI';
import { Beer, Truck, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
export default function AlcoholDashboard() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Alcohol Module" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(KPI, { label: "Active Batches", value: 12, icon: _jsx(Beer, { className: "h-4 w-4", "aria-hidden": true }) }), _jsx(KPI, { label: "Shipments (7d)", value: 5, icon: _jsx(Truck, { className: "h-4 w-4", "aria-hidden": true }) }), _jsx(KPI, { label: "Alerts", value: 1, icon: _jsx(AlertCircle, { className: "h-4 w-4 text-amber-500", "aria-hidden": true }) })] }), _jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 mb-2", children: "Recent Activity" }), _jsxs("ul", { className: "text-sm text-gray-700 list-disc pl-5", children: [_jsx("li", { children: "Fermentation started: Batch A-102" }), _jsx("li", { children: "Distillation complete: Batch D-221" }), _jsx("li", { children: "Shipment created: SHP-00045" })] })] })] }));
}
