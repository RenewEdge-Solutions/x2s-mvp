import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DisabledLink from './DisabledLink';
import { useModule } from '../context/ModuleContext';
import { Leaf, ShieldCheck, Wand2, User as UserIcon, ChevronDown, LogOut, Calendar as CalendarIcon, Package as PackageIcon, Bell, Sprout, FileText } from 'lucide-react';
import { api } from '../lib/api';

export default function NavBar() {
  const { user, logout } = useAuth();
  const { activeModule, setActiveModule, availableModules } = useModule();
  const { pathname } = useLocation();
  const isActive = (p: string) => {
    const active = pathname === p || (p === '/dashboard' && pathname === '/');
    return active ? 'text-primary' : 'text-gray-600 hover:text-gray-900';
  };

  return (
    <header className="border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="font-semibold text-lg text-gray-900 inline-flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" aria-hidden />
            Traceability
          </Link>
          {availableModules.length > 1 ? (
            <select
              aria-label="Select module"
              title="Module"
              value={activeModule}
              onChange={(e) => setActiveModule(e.target.value as any)}
              className="border border-gray-200 rounded-md text-sm px-2 py-1 bg-white text-gray-800 hover:bg-gray-50"
            >
              {(['cannabis', 'alcohol', 'mushrooms', 'explosives'] as const)
                .filter((m) => availableModules.includes(m))
                .map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
            </select>
          ) : (
            <DisabledLink>{availableModules[0]?.charAt(0).toUpperCase() + availableModules[0]?.slice(1)}</DisabledLink>
          )}
        </div>
        <nav className="flex items-center gap-4">
          <Link className={`${isActive('/dashboard')} inline-flex items-center gap-1`} to="/dashboard">
            <Wand2 className="h-4 w-4" aria-hidden /> Dashboard
          </Link>
          <Link className={`${isActive('/facilities')} inline-flex items-center gap-1`} to="/facilities">
            <Sprout className="h-4 w-4" aria-hidden /> Facilities
          </Link>
          <Link className={`${isActive('/inventory')} inline-flex items-center gap-1`} to="/inventory">
            <PackageIcon className="h-4 w-4" aria-hidden /> Inventory
          </Link>
          <Link className={`${isActive('/calendar')} inline-flex items-center gap-1`} to="/calendar">
            <CalendarIcon className="h-4 w-4" aria-hidden /> Calendar
          </Link>
          <Link className={`${isActive('/reports')} inline-flex items-center gap-1`} to="/reports">
            <FileText className="h-4 w-4" aria-hidden /> Reports
          </Link>
          <span className="text-gray-200">|</span>
          <NotificationsMenu />
          <UserMenu
            name={user?.firstName || user?.lastName ? `${user?.firstName} ${user?.lastName}`.trim() : user?.username || ''}
            onLogout={logout}
          />
        </nav>
      </div>
    </header>
  );
}

function UserMenu({ name, onLogout }: { name: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserIcon className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{name}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50"
        >
          <Link
            to="/profile"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <UserIcon className="h-4 w-4" aria-hidden />
            <span>Profile</span>
          </Link>
          <div className="my-1 border-t border-gray-100" />
          <button
            role="menuitem"
            title="Logout"
            aria-label="Logout"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full justify-start"
          >
            <LogOut className="h-4 w-4 text-gray-800" aria-hidden />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

type Notification = { id: string; text: string; severity: 'info' | 'warning' | 'alert'; href?: string };

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const { activeModule } = useModule();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
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
    const daysBetween = (d: string | number | Date) => Math.floor((now - new Date(d).getTime()) / 86400000);

    const out: Notification[] = [];
  plants.forEach((p: any) => {
      const age = daysBetween(p.plantedAt);
      const daysToHarvest = 60 - age;
      if (!p.harvested && daysToHarvest <= 3 && daysToHarvest >= 0) {
        out.push({
          id: `harvest-${p.id}`,
          text: `${
            daysToHarvest === 0 ? 'Harvest today' : `Harvest in ${daysToHarvest} day${daysToHarvest === 1 ? '' : 's'}`
          }: ${p.strain} at ${p.location}`,
          severity: daysToHarvest <= 1 ? 'alert' : 'warning',
          href: '/wizard?step=2',
        });
      }
      if (!p.harvested && age >= 12 && age <= 16) {
  out.push({ id: `transplant-${p.id}`, text: `Transplant recommended: ${p.strain} (${p.location})`, severity: 'info', href: '/facilities' });
      }
    });
    harvests.forEach((h: any) => {
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex items-center text-gray-700 hover:text-gray-900"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-50">
          <div className="px-3 pb-2 text-sm text-gray-500">Notifications</div>
          {items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-600">No notifications</div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {items.map((n) => (
                <li key={n.id} className="px-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (n.href) {
                        // navigate within SPA and keep notification until backend condition resolves
                        window.history.pushState({}, '', n.href);
                        // close menu for focus shift
                        setOpen(false);
                      }
                    }}
                    className={`w-full text-left px-2 py-2 rounded-md hover:bg-gray-50 ${n.href ? 'cursor-pointer' : 'cursor-default'}`}
                    aria-label={n.href ? `Open task: ${n.text}` : undefined}
                  >
                    <div className="text-sm text-gray-800">
                      <span
                        className={
                          'inline-block w-2 h-2 rounded-full mr-2 align-middle ' +
                          (n.severity === 'alert'
                            ? 'bg-red-500'
                            : n.severity === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-blue-500')
                        }
                        aria-hidden
                      />
                      {n.text}
                    </div>
                    {n.href && (
                      <div className="mt-0.5 text-[11px] text-primary">Click to open</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Reports dropdown removed; direct link used instead
