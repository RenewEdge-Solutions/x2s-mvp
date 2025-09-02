import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModule, ModuleName } from '../context/ModuleContext';
import { Leaf, Wand2, User as UserIcon, ChevronDown, LogOut, Calendar as CalendarIcon, Bell, FileText, Search, Plus, ShieldCheck, Workflow, Scale, Building2 } from 'lucide-react';
import { api } from '../lib/api';

export default function NavBar() {
  const { user, logout } = useAuth();
  const { activeModule, availableModules } = useModule();
  const { pathname } = useLocation();
  const isActive = (p: string) => pathname === p || (p === '/dashboard' && pathname === '/');

  return (
    <header className="border-b border-gray-100 fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Brand (left) */}
        <Link to="/dashboard" className="font-semibold text-lg text-gray-900 inline-flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" aria-hidden />
          Traceability
        </Link>

        {/* Module switcher (moved left, next to brand) */}
        <div className="hidden sm:block">
          <ModuleSwitcher active={activeModule} modules={availableModules} />
        </div>

        {/* Push everything else to the right */}
        <div className="ml-auto flex items-center gap-4">
          {/* Primary nav (right-aligned) */}
          <nav className="hidden md:flex items-center gap-1 p-0.5 rounded-lg bg-white/40">
            {/* Overview */}
            <Link
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive('/dashboard')
                  ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              to="/dashboard"
            >
              <Workflow className="h-4 w-4" aria-hidden /> Overview
            </Link>
            {/* Licensing */}
            <Link
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive('/licensing')
                  ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              to="/licensing"
            >
              <Scale className="h-4 w-4" aria-hidden /> Licensing
            </Link>
            {/* Operators */}
            <Link
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive('/facilities')
                  ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              to="/facilities"
            >
              <Building2 className="h-4 w-4" aria-hidden /> Operators
            </Link>
            {/* Lifecycle */}
            <Link
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive('/lifecycle')
                  ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              to="/lifecycle"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden /> Lifecycle
            </Link>
            {/* Integrity */}
            <Link
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive('/integrity')
                  ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              to="/integrity"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden /> Integrity
            </Link>
            {/* Reports */}
            <Link
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive('/reports')
                  ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              to="/reports"
            >
              <FileText className="h-4 w-4" aria-hidden /> Reports
            </Link>
            {/* Calendar */}
            <Link
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive('/calendar')
                  ? 'text-primary bg-primary/10 ring-1 ring-primary/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              to="/calendar"
            >
              <CalendarIcon className="h-4 w-4" aria-hidden /> Calendar
            </Link>
          </nav>

          {/* Notifications & User */}
          <div className="flex items-center gap-3">
            <NotificationsMenu />
            <UserMenu
              name={user?.firstName || user?.lastName ? `${user?.firstName} ${user?.lastName}`.trim() : user?.username || 'Regulator'}
              role={user?.role || 'Regulator'}
              onLogout={logout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function UserMenu({ name, role, org, onLogout }: { name: string; role?: string; org?: string; onLogout: () => void }) {
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

  const initials = (name || 'R A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {initials || <UserIcon className="h-4 w-4" aria-hidden />}
        </span>
        <span className="hidden sm:flex flex-col leading-tight">
          <span className="text-sm font-medium">{name || 'Regulator'}</span>
          <span className="text-[11px] text-gray-500">{role || 'Regulator'}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-xl py-2 z-50"
        >
          {/* User card */}
          <div className="px-3 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary text-sm font-semibold inline-flex items-center justify-center">
                {initials || <UserIcon className="h-4 w-4" aria-hidden />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{name || 'Regulator'}</div>
                <div className="text-xs text-gray-500 truncate inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  {role || 'Regulator'} • {org || 'Authority'}
                </div>
              </div>
            </div>
          </div>
          <div className="my-1 border-t border-gray-100" />
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

type Notification = { 
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'alert';
  category: 'compliance' | 'inspection' | 'licensing' | 'integrity' | 'reports' | 'capacity';
  operator?: string;
  createdAt: string; // ISO
  href?: string;
  read?: boolean;
};

type NotificationGroup = {
  category: Notification['category'];
  title: string;
  items: Notification[];
  priority: number;
};

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const { activeModule } = useModule();
  const navigate = useNavigate();

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
    const capacityAlerts = await api.getEmptyCapacityAlerts();

    const now = Date.now();
    const isoAgo = (h: number) => new Date(now - h * 3600_000).toISOString();

    const mock: Notification[] = [
      {
        id: 'capa-001',
        title: 'CAPA overdue',
        message: 'Sunrise Processing has not submitted CAPA for Major deficiency (Sanitation).',
        severity: 'alert',
        category: 'compliance',
        operator: 'Sunrise Processing',
        createdAt: isoAgo(3),
        href: '/facilities',
        read: false,
      },
      {
        id: 'insp-101',
        title: 'Inspection scheduled',
        message: 'Routine inspection tomorrow at Green Leaf Holdings (09:00).',
        severity: 'info',
        category: 'inspection',
        operator: 'Green Leaf Holdings',
        createdAt: isoAgo(5),
        href: '/calendar',
        read: false,
      },
      {
        id: 'lic-777',
        title: 'Licensing SLA at risk',
        message: 'Medicanna Labs Ltd application pending background check > 5 days.',
        severity: 'warning',
        category: 'licensing',
        operator: 'Medicanna Labs Ltd',
        createdAt: isoAgo(8),
        href: '/wizard',
        read: false,
      },
      {
        id: 'chain-404',
        title: 'Ledger integrity mismatch',
        message: 'On-chain total for Licence Fees differs from system ledger (delta 1.2%).',
        severity: 'alert',
        category: 'integrity',
        createdAt: isoAgo(10),
        href: '/integrity',
        read: false,
      },
      {
        id: 'rpt-901',
        title: 'Report ready',
        message: 'Automated report “Market Sales Summary” has been generated (CSV).',
        severity: 'info',
        category: 'reports',
        createdAt: isoAgo(12),
        href: '/reports',
        read: false,
      },
    ];

    // Capacity alerts (append a few from API if available)
    if (capacityAlerts?.overCapacityStructures?.length) {
      capacityAlerts.overCapacityStructures.slice(0, 2).forEach((s: any, idx: number) => {
        mock.push({
          id: `cap-over-${idx}-${s.structureId}`,
          title: 'Over capacity structure',
          message: `${s.structureName} at ${s.facilityName} is over capacity (${s.totalPlants}/${s.capacity}).`,
          severity: 'warning',
          category: 'capacity',
          operator: s.facilityName,
          createdAt: isoAgo(14 + idx),
          href: '/facilities',
          read: false,
        });
      });
    }

    setItems(mock.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  // Group notifications by category with priority
  const groupedNotifications = useMemo(() => {
    const groups: NotificationGroup[] = [
      { category: 'compliance', title: 'Compliance', items: items.filter(i => i.category === 'compliance'), priority: 1 },
      { category: 'inspection', title: 'Inspections', items: items.filter(i => i.category === 'inspection'), priority: 2 },
      { category: 'licensing', title: 'Licensing', items: items.filter(i => i.category === 'licensing'), priority: 3 },
      { category: 'integrity', title: 'Integrity', items: items.filter(i => i.category === 'integrity'), priority: 4 },
      { category: 'reports', title: 'Reports', items: items.filter(i => i.category === 'reports'), priority: 5 },
      { category: 'capacity', title: 'Capacity', items: items.filter(i => i.category === 'capacity'), priority: 6 },
    ];
    return groups.filter(g => g.items.length > 0).sort((a, b) => a.priority - b.priority);
  }, [items]);

  const timeAgo = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
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
          <span className={`absolute -top-1 -right-1 rounded-full text-white text-[10px] leading-none px-1.5 py-0.5 ${
            items.some(item => item.severity === 'alert') 
              ? 'bg-red-500' 
              : items.some(item => item.severity === 'warning')
              ? 'bg-amber-500'
              : 'bg-blue-500'
          }`}>
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[28rem] rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-50">
          <div className="px-3 pb-2 flex items-center justify-between">
            <div className="text-sm text-gray-700 font-semibold">Notifications</div>
            {items.length > 0 && (
              <button className="text-xs text-primary hover:underline" onClick={() => setItems(prev => prev.map(i => ({...i, read: true})))}>Mark all as read</button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-600">No notifications</div>
          ) : (
            <div className="max-h-96 overflow-auto">
              {groupedNotifications.map((group) => (
                <div key={group.category} className="mb-3 last:mb-0">
                  <div className="px-3 py-1 bg-gray-50 border-y border-gray-100 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {group.title}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {group.items.length}
                    </span>
                  </div>
                  <ul className="px-1 divide-y divide-gray-100">
                    {group.items.map((n) => (
                      <li key={n.id} className="py-2 px-2 hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-white text-[11px] ${
                            n.severity === 'alert' ? 'bg-red-500' : n.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} aria-hidden>
                            {n.category === 'integrity' ? '⛓' : n.category === 'inspection' ? '🗓' : n.category === 'reports' ? '⬇' : n.category === 'capacity' ? '🏗' : n.category === 'licensing' ? '⚖' : '✔'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-medium text-gray-900 truncate">{n.title}</div>
                              <div className="text-[11px] text-gray-500 shrink-0">{timeAgo(n.createdAt)}</div>
                            </div>
                            <div className="text-sm text-gray-700">{n.message}</div>
                            <div className="mt-1 flex items-center gap-2">
                              {n.operator && <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-gray-100 text-gray-700">{n.operator}</span>}
                              {!n.read && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" aria-label="Unread" />}
                            </div>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            <button
                              className={`inline-flex items-center gap-1 px-2 py-1 border rounded-md text-xs ${n.href ? 'hover:bg-gray-50' : 'opacity-60 cursor-default'}`}
                              onClick={() => { if (n.href) { navigate(n.href); setOpen(false); } }}
                            >
                              View
                            </button>
                            <button className="text-[11px] text-gray-500 hover:underline" onClick={() => setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>Mark read</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Reports dropdown removed; direct link used instead

// New: Module switcher
function ModuleSwitcher({ active, modules }: { active: ModuleName; modules: ModuleName[] }) {
  const { setActiveModule } = useModule();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const labelFor = (m: ModuleName) => m.charAt(0).toUpperCase() + m.slice(1);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800 hover:bg-gray-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="font-medium">{labelFor(active)}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50">
          {modules.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setActiveModule(m);
                setOpen(false);
                navigate('/dashboard');
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${m === active ? 'text-primary' : 'text-gray-800'}`}
              role="menuitem"
            >
              {labelFor(m)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// New: Global search
function SearchBox() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const ROUTES = [
    { label: 'Overview', path: '/dashboard', keywords: 'home overview kpi dashboard' },
    { label: 'Licensing wizard', path: '/wizard', keywords: 'license onboarding register apply' },
    { label: 'Lifecycle', path: '/lifecycle', keywords: 'trace seed-to-sale stages chain custody' },
    { label: 'Calendar', path: '/calendar', keywords: 'inspection schedule events' },
    { label: 'Reports', path: '/reports', keywords: 'pdf summary export compliance' },
    { label: 'Integrity', path: '/integrity', keywords: 'blockchain audit tamper-evident history' },
  { label: 'Operators', path: '/facilities', keywords: 'operators license holders capacity occupancy structures rooms companies farms' },
    { label: 'Profile', path: '/profile', keywords: 'user account settings' },
  ];

  const results = useMemo(() => {
    const v = q.trim().toLowerCase();
    if (!v) return ROUTES;
    return ROUTES.filter(r => r.label.toLowerCase().includes(v) || r.keywords.includes(v));
  }, [q]);

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
      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1">
        <Search className="h-4 w-4 text-gray-400" aria-hidden />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const first = results[0];
              if (first) {
                navigate(first.path);
                setOpen(false);
              }
            }
          }}
          placeholder="Search…"
          className="w-72 text-sm outline-none placeholder:text-gray-400"
          aria-label="Global search"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute right-0 mt-2 w-[20rem] rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50">
          {results.slice(0, 7).map((r) => (
            <button
              key={r.path}
              type="button"
              onClick={() => { navigate(r.path); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// New: Quick create actions
function QuickCreate() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-95"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus className="h-4 w-4" aria-hidden /> New
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50">
          <button
            type="button"
            onClick={() => { navigate('/calendar'); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4 text-gray-500" aria-hidden /> Inspection
          </button>
          <button
            type="button"
            onClick={() => { navigate('/reports'); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <FileText className="h-4 w-4 text-gray-500" aria-hidden /> Report
          </button>
          <button
            type="button"
            onClick={() => { navigate('/wizard'); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4 text-gray-500" aria-hidden /> Licensing
          </button>
        </div>
      )}
    </div>
  );
}
