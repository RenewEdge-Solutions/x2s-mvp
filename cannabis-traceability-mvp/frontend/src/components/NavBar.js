import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DisabledLink from './DisabledLink';
import { useModule } from '../context/ModuleContext';
import { Leaf, Wand2, User as UserIcon, ChevronDown, LogOut, Calendar as CalendarIcon, Package as PackageIcon, Bell, Sprout, FileText } from 'lucide-react';
import { api } from '../lib/api';
export default function NavBar() {
    const { user, logout } = useAuth();
    const { activeModule, setActiveModule, availableModules } = useModule();
    const { pathname } = useLocation();
    const isActive = (p) => {
        const active = pathname === p || (p === '/dashboard' && pathname === '/');
        return active ? 'text-primary' : 'text-gray-600 hover:text-gray-900';
    };
    return (_jsx("header", { className: "border-b border-gray-100", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 py-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Link, { to: "/dashboard", className: "font-semibold text-lg text-gray-900 inline-flex items-center gap-2", children: [_jsx(Leaf, { className: "h-5 w-5 text-primary", "aria-hidden": true }), "Traceability"] }), availableModules.length > 1 ? (_jsx("select", { "aria-label": "Select module", title: "Module", value: activeModule, onChange: (e) => setActiveModule(e.target.value), className: "border border-gray-200 rounded-md text-sm px-2 py-1 bg-white text-gray-800 hover:bg-gray-50", children: ['cannabis', 'alcohol', 'mushrooms', 'explosives']
                                .filter((m) => availableModules.includes(m))
                                .map((m) => (_jsx("option", { value: m, children: m.charAt(0).toUpperCase() + m.slice(1) }, m))) })) : (_jsx(DisabledLink, { children: availableModules[0]?.charAt(0).toUpperCase() + availableModules[0]?.slice(1) }))] }), _jsxs("nav", { className: "flex items-center gap-4", children: [_jsxs(Link, { className: `${isActive('/dashboard')} inline-flex items-center gap-1`, to: "/dashboard", children: [_jsx(Wand2, { className: "h-4 w-4", "aria-hidden": true }), " Dashboard"] }), _jsxs(Link, { className: `${isActive('/production')} inline-flex items-center gap-1`, to: "/production", children: [_jsx(Sprout, { className: "h-4 w-4", "aria-hidden": true }), " Production"] }), _jsxs(Link, { className: `${isActive('/inventory')} inline-flex items-center gap-1`, to: "/inventory", children: [_jsx(PackageIcon, { className: "h-4 w-4", "aria-hidden": true }), " Inventory"] }), _jsxs(Link, { className: `${isActive('/calendar')} inline-flex items-center gap-1`, to: "/calendar", children: [_jsx(CalendarIcon, { className: "h-4 w-4", "aria-hidden": true }), " Calendar"] }), _jsxs(Link, { className: `${isActive('/reports')} inline-flex items-center gap-1`, to: "/reports", children: [_jsx(FileText, { className: "h-4 w-4", "aria-hidden": true }), " Reports"] }), _jsx("span", { className: "text-gray-200", children: "|" }), _jsx(NotificationsMenu, {}), _jsx(UserMenu, { name: user?.firstName || user?.lastName ? `${user?.firstName} ${user?.lastName}`.trim() : user?.username || '', onLogout: logout })] })] }) }));
}
function UserMenu({ name, onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => {
            if (!ref.current)
                return;
            if (!ref.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    return (_jsxs("div", { className: "relative", ref: ref, children: [_jsxs("button", { onClick: () => setOpen((o) => !o), className: "inline-flex items-center gap-2 text-gray-700 hover:text-gray-900", "aria-haspopup": "menu", "aria-expanded": open, children: [_jsx(UserIcon, { className: "h-4 w-4", "aria-hidden": true }), _jsx("span", { className: "hidden sm:inline", children: name }), _jsx(ChevronDown, { className: "h-4 w-4 text-gray-400", "aria-hidden": true })] }), open && (_jsxs("div", { role: "menu", className: "absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50", children: [_jsxs(Link, { to: "/profile", role: "menuitem", className: "flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50", onClick: () => setOpen(false), children: [_jsx(UserIcon, { className: "h-4 w-4", "aria-hidden": true }), _jsx("span", { children: "Profile" })] }), _jsx("div", { className: "my-1 border-t border-gray-100" }), _jsxs("button", { role: "menuitem", title: "Logout", "aria-label": "Logout", onClick: () => {
                            setOpen(false);
                            onLogout();
                        }, className: "flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full justify-start", children: [_jsx(LogOut, { className: "h-4 w-4 text-gray-800", "aria-hidden": true }), _jsx("span", { children: "Logout" })] })] }))] }));
}
function NotificationsMenu() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const ref = useRef(null);
    const { activeModule } = useModule();
    useEffect(() => {
        const handler = (e) => {
            if (!ref.current)
                return;
            if (!ref.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const refresh = async () => {
        if (activeModule !== 'cannabis') {
            setItems([]);
            return;
        }
        const [plants, harvests] = await Promise.all([api.getPlants(), api.getHarvests()]);
        const now = Date.now();
        const daysBetween = (d) => Math.floor((now - new Date(d).getTime()) / 86400000);
        const out = [];
        plants.forEach((p) => {
            const age = daysBetween(p.plantedAt);
            const daysToHarvest = 60 - age;
            if (!p.harvested && daysToHarvest <= 3 && daysToHarvest >= 0) {
                out.push({
                    id: `harvest-${p.id}`,
                    text: `${daysToHarvest === 0 ? 'Harvest today' : `Harvest in ${daysToHarvest} day${daysToHarvest === 1 ? '' : 's'}`}: ${p.strain} at ${p.location}`,
                    severity: daysToHarvest <= 1 ? 'alert' : 'warning',
                    href: '/wizard?step=2',
                });
            }
            if (!p.harvested && age >= 12 && age <= 16) {
                out.push({ id: `transplant-${p.id}`, text: `Transplant recommended: ${p.strain} (${p.location})`, severity: 'info', href: '/production' });
            }
        });
        harvests.forEach((h) => {
            if (h.status === 'drying') {
                const daysDrying = daysBetween(h.harvestedAt);
                if (daysDrying >= 5) {
                    out.push({ id: `dry-${h.id}`, text: `Check drying lot ${h.id} (${daysDrying} days)`, severity: 'warning', href: '/inventory' });
                }
            }
        });
        setItems(out);
    };
    useEffect(() => {
        refresh();
        const t = setInterval(refresh, 60000);
        return () => clearInterval(t);
    }, [activeModule]);
    return (_jsxs("div", { className: "relative", ref: ref, children: [_jsxs("button", { onClick: () => setOpen((o) => !o), className: "relative inline-flex items-center text-gray-700 hover:text-gray-900", "aria-haspopup": "menu", "aria-expanded": open, title: "Notifications", "aria-label": "Notifications", children: [_jsx(Bell, { className: "h-5 w-5", "aria-hidden": true }), items.length > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5", children: items.length }))] }), open && (_jsxs("div", { className: "absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-50", children: [_jsx("div", { className: "px-3 pb-2 text-sm text-gray-500", children: "Notifications" }), items.length === 0 ? (_jsx("div", { className: "px-3 py-2 text-sm text-gray-600", children: "No notifications" })) : (_jsx("ul", { className: "max-h-80 overflow-auto", children: items.map((n) => (_jsx("li", { className: "px-1", children: _jsxs("button", { type: "button", onClick: () => {
                                    if (n.href) {
                                        // navigate within SPA and keep notification until backend condition resolves
                                        window.history.pushState({}, '', n.href);
                                        // close menu for focus shift
                                        setOpen(false);
                                    }
                                }, className: `w-full text-left px-2 py-2 rounded-md hover:bg-gray-50 ${n.href ? 'cursor-pointer' : 'cursor-default'}`, "aria-label": n.href ? `Open task: ${n.text}` : undefined, children: [_jsxs("div", { className: "text-sm text-gray-800", children: [_jsx("span", { className: 'inline-block w-2 h-2 rounded-full mr-2 align-middle ' +
                                                    (n.severity === 'alert'
                                                        ? 'bg-red-500'
                                                        : n.severity === 'warning'
                                                            ? 'bg-amber-500'
                                                            : 'bg-blue-500'), "aria-hidden": true }), n.text] }), n.href && (_jsx("div", { className: "mt-0.5 text-[11px] text-primary", children: "Click to open" }))] }) }, n.id))) }))] }))] }));
}
