import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Card from '../components/Card';
const demo = [
    { id: 'A-102', type: 'batch', hash: 'c4f5…91b2' },
    { id: 'D-221', type: 'distill', hash: '8ab2…cc11' },
    { id: 'SHP-00045', type: 'shipment', hash: '12cd…88ee' },
];
export default function AlcoholBlockchain() {
    return (_jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 mb-3", children: "Alcohol Blockchain Integrity (Mock)" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500", children: [_jsx("th", { className: "py-2 pr-4", children: "Type" }), _jsx("th", { className: "py-2 pr-4", children: "ID" }), _jsx("th", { className: "py-2 pr-4", children: "Hash" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: demo.map((e) => (_jsxs("tr", { className: "text-gray-800", children: [_jsx("td", { className: "py-2 pr-4", children: e.type }), _jsx("td", { className: "py-2 pr-4 font-mono text-xs", children: e.id }), _jsx("td", { className: "py-2 pr-4 font-mono text-xs break-all", children: e.hash })] }, e.id))) })] }) })] }));
}
