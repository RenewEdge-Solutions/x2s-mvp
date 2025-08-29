import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Card from './Card';
export default function KPI({ label, value, icon, action, }) {
    return (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "text-sm text-gray-500", children: label }), action && _jsx("div", { className: "text-xs", children: action })] }), icon && _jsx("div", { className: "text-gray-400", children: icon })] }), _jsx("div", { className: "text-2xl font-semibold text-gray-900 mt-1", children: value })] }));
}
