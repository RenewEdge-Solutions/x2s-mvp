import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useModule } from '../context/ModuleContext';
import AlcoholBlockchain from './AlcoholBlockchain';
import MushroomsBlockchain from './MushroomsBlockchain';
import ExplosivesBlockchain from './ExplosivesBlockchain';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
async function sha256Hex(input) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}
export default function BlockchainView() {
    const [events, setEvents] = useState([]);
    const [matches, setMatches] = useState({});
    const { activeModule } = useModule();
    const { user } = useAuth();
    // Route-level guard: restrict Integrity for operational roles
    if (user && (user.role === 'Operator' || user.role === 'Grower' || user.role === 'Shop' || user.role === 'Lab')) {
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    useEffect(() => {
        if (activeModule === 'cannabis') {
            api.getIntegrity().then(setEvents);
        }
        else {
            setEvents([]);
            setMatches({});
        }
    }, [activeModule]);
    const recompute = async (payload, id) => {
        const local = await sha256Hex(JSON.stringify(payload));
        setMatches((m) => ({ ...m, [id]: local === (events.find((e) => e.id === id)?.hash ?? '') }));
    };
    if (activeModule === 'alcohol') {
        return _jsx(AlcoholBlockchain, {});
    }
    if (activeModule === 'mushrooms') {
        return _jsx(MushroomsBlockchain, {});
    }
    if (activeModule === 'explosives') {
        return _jsx(ExplosivesBlockchain, {});
    }
    return (_jsxs(Card, { children: [_jsxs("h2", { className: "text-lg font-medium text-gray-900 mb-3 inline-flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "h-5 w-5", "aria-hidden": true }), " Blockchain Integrity"] }), activeModule !== 'cannabis' && (_jsxs("p", { className: "text-sm text-gray-700 mb-3", children: ["The ", activeModule, " module UI is not yet implemented in this MVP."] })), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-gray-500", children: [_jsx("th", { className: "py-2 pr-4", children: "Type" }), _jsx("th", { className: "py-2 pr-4", children: "ID" }), _jsx("th", { className: "py-2 pr-4", children: "Hash" }), _jsx("th", { className: "py-2 pr-4", children: "Verify" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-100", children: events.map((e) => (_jsxs("tr", { className: "text-gray-800", children: [_jsx("td", { className: "py-2 pr-4", children: e.type }), _jsx("td", { className: "py-2 pr-4 font-mono text-xs", children: e.id }), _jsx("td", { className: "py-2 pr-4 font-mono text-xs break-all", children: e.hash }), _jsx("td", { className: "py-2 pr-4", children: _jsx("button", { className: `rounded-md px-3 py-1 text-sm border ${matches[e.id] ? 'border-green-500 text-green-600' : 'border-gray-300 text-gray-700'}`, onClick: () => recompute(e.payload, e.id), children: matches[e.id] ? '✓ Match' : 'Recompute' }) })] }, e.id))) })] }) })] }));
}
