import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import KPI from '../components/KPI';
import { Package2, Repeat, ShieldAlert } from 'lucide-react';
import Card from '../components/Card';
export default function ExplosivesDashboard() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "Explosives Module" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(KPI, { label: "Active Lots", value: 4, icon: _jsx(Package2, { className: "h-4 w-4", "aria-hidden": true }) }), _jsx(KPI, { label: "Transfers (7d)", value: 2, icon: _jsx(Repeat, { className: "h-4 w-4", "aria-hidden": true }) }), _jsx(KPI, { label: "Alerts", value: 1, icon: _jsx(ShieldAlert, { className: "h-4 w-4 text-amber-500", "aria-hidden": true }) })] }), _jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 mb-2", children: "Recent Activity" }), _jsxs("ul", { className: "text-sm text-gray-700 list-disc pl-5", children: [_jsx("li", { children: "Lot created: EXP-1031" }), _jsx("li", { children: "Transfer recorded: TRF-201" }), _jsx("li", { children: "Compliance check passed: EXP-0992" })] })] })] }));
}
