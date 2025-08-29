import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { useModule } from '../context/ModuleContext';
import { api } from '../lib/api';
import { Calendar as CalendarIcon } from 'lucide-react';
import { computeEventsForCannabis, eventColor } from '../lib/calendar';
export default function Calendar() {
    const { activeModule } = useModule();
    const [plants, setPlants] = useState([]);
    const [harvests, setHarvests] = useState([]);
    const [cursor, setCursor] = useState(new Date());
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
    const events = useMemo(() => {
        if (activeModule !== 'cannabis')
            return [];
        return computeEventsForCannabis(plants, harvests);
    }, [plants, harvests, activeModule]);
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDay = firstOfMonth.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const weeks = [];
    let week = new Array(startDay).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
        week.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }
    if (week.length)
        weeks.push([...week, ...new Array(7 - week.length).fill(null)]);
    const todayKey = new Date().toISOString().slice(0, 10);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h1", { className: "text-2xl font-semibold text-gray-900 inline-flex items-center gap-2", children: [_jsx(CalendarIcon, { className: "h-6 w-6", "aria-hidden": true }), " Calendar"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "px-2 py-1 border rounded-md text-sm", onClick: () => setCursor(new Date()), "aria-label": "Today", children: "Today" }), _jsx("button", { className: "px-2 py-1 border rounded-md text-sm", onClick: () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)), "aria-label": "Previous month", children: "\u2039" }), _jsx("div", { className: "text-sm text-gray-700 w-32 text-center", children: cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' }) }), _jsx("button", { className: "px-2 py-1 border rounded-md text-sm", onClick: () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)), "aria-label": "Next month", children: "\u203A" })] })] }), activeModule !== 'cannabis' ? (_jsx(Card, { children: _jsxs("p", { className: "text-sm text-gray-600", children: ["Calendar for ", activeModule, " is not yet implemented in this MVP."] }) })) : (_jsxs(Card, { children: [_jsx("div", { className: "grid grid-cols-7 text-xs text-gray-500 mb-2", children: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (_jsx("div", { className: "px-2 py-1", children: d }, d))) }), _jsx("div", { className: "grid grid-cols-7 gap-1", children: weeks.map((w, i) => (_jsx(React.Fragment, { children: w.map((d, j) => {
                                const key = d ? d.toISOString().slice(0, 10) : `${i}-${j}-empty`;
                                const dayEvents = d
                                    ? events.filter((e) => e.date.toISOString().slice(0, 10) === key)
                                    : [];
                                const isToday = d && key === todayKey;
                                return (_jsxs("div", { className: `min-h-[88px] border rounded-md p-1 ${isToday ? 'border-primary' : 'border-gray-200'} bg-white`, children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: d ? d.getDate() : '' }), _jsx("div", { className: "space-y-1", children: dayEvents.map((ev, idx) => (_jsxs("div", { className: `group relative text-[11px] text-white px-1 py-0.5 rounded ${eventColor(ev.type)}`, children: [_jsx("span", { className: "truncate block", children: ev.label }), _jsx("div", { className: "absolute left-0 top-full mt-1 hidden group-hover:block bg-black text-white text-[11px] px-2 py-1 rounded shadow-lg z-10 max-w-[200px]", children: ev.label })] }, idx))) })] }, key));
                            }) }, i))) })] }))] }));
}
