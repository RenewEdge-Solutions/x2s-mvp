import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Card from '../components/Card';
const demo = [
    { id: 'EXP-1031', type: 'lot', hash: '9f9a…e1e1' },
    { id: 'TRF-201', type: 'transfer', hash: 'a0a0…b0b0' },
    { id: 'CHK-0992', type: 'compliance', hash: 'caca…dede' },
];
export default function ExplosivesBlockchain() {
    return (_jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 mb-3", children: "Explosives Blockchain Integrity (Mock)" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500", children: [_jsx("th", { className: "py-2 pr-4", children: "Type" }), _jsx("th", { className: "py-2 pr-4", children: "ID" }), _jsx("th", { className: "py-2 pr-4", children: "Hash" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: demo.map((e) => (_jsxs("tr", { className: "text-gray-800", children: [_jsx("td", { className: "py-2 pr-4", children: e.type }), _jsx("td", { className: "py-2 pr-4 font-mono text-xs", children: e.id }), _jsx("td", { className: "py-2 pr-4 font-mono text-xs break-all", children: e.hash })] }, e.id))) })] }) })] }));
}
