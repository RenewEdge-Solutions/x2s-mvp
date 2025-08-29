import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { History as HistoryIcon } from 'lucide-react';
import { api } from '../lib/api';
import { useModule } from '../context/ModuleContext';
export default function LifecycleExplorer() {
    const [events, setEvents] = useState([]);
    const { activeModule } = useModule();
    useEffect(() => {
        if (activeModule === 'cannabis') {
            api.getLifecycle().then(setEvents);
        }
        else {
            setEvents([]);
        }
    }, [activeModule]);
    return (_jsxs(Card, { children: [_jsxs("h2", { className: "text-lg font-medium text-gray-900 mb-3 inline-flex items-center gap-2", children: [_jsx(HistoryIcon, { className: "h-5 w-5", "aria-hidden": true }), " Event History"] }), activeModule !== 'cannabis' && (_jsxs("p", { className: "text-sm text-gray-700 mb-3", children: ["The ", activeModule, " module UI is not yet implemented in this MVP."] })), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500", children: [_jsx("th", { className: "py-2 pr-4", children: "Type" }), _jsx("th", { className: "py-2 pr-4", children: "Details" }), _jsx("th", { className: "py-2 pr-4", children: "Time" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: events.map((e, i) => (_jsxs("tr", { className: "text-gray-800", children: [_jsx("td", { className: "py-2 pr-4", children: e.type }), _jsx("td", { className: "py-2 pr-4", children: e.type === 'plant' ? (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-green-500", "aria-hidden": true }), e.strain, " \u2014 ", e.location] })) : (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-amber-500", "aria-hidden": true }), e.yieldGrams, "g \u2014 ", e.status] })) }), _jsx("td", { className: "py-2 pr-4", children: new Date(e.plantedAt ?? e.harvestedAt).toLocaleString() })] }, i))) })] }) })] }));
}
