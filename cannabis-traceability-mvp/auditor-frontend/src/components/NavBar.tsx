import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DisabledLink from './DisabledLink';
import { useModule } from '../context/ModuleContext';
import { Leaf, ShieldCheck, Wand2, User as UserIcon, ChevronDown, LogOut, Calendar as CalendarIcon, Package as PackageIcon, Bell, Sprout, FileText } from 'lucide-react';
// No API import; notifications are mocked for the auditor frontend

export default function NavBar() {
  const { user, logout } = useAuth();
  const { activeModule, availableModules } = useModule();
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
          <span className="ml-2 px-2 py-1 rounded bg-gray-100 text-sm font-medium text-gray-700">
            {activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link className={`${isActive('/dashboard')} inline-flex items-center gap-1`} to="/dashboard">
            <Wand2 className="h-4 w-4" aria-hidden /> Dashboard
          </Link>
          {/* Removed Sites, Plants, and Inventory for Auditor */}
          <Link className={`${isActive('/users')} inline-flex items-center gap-1`} to="/users">
            <UserIcon className="h-4 w-4" aria-hidden /> Users
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

type Notification = { 
  id: string; 
  text: string; 
  severity: 'info' | 'warning' | 'alert'; 
  category: 'critical' | 'calendar' | 'capacity';
  href?: string; 
};

type NotificationGroup = {
  category: 'critical' | 'calendar' | 'capacity';
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

  // Mock notifications aligned with auditor mock data
  const refresh = () => {
    if (activeModule !== 'cannabis') {
      setItems([]);
      return;
    }
    const out: Notification[] = [
      // Critical (matching auditor dashboard/calendar themes)
      {
        id: 'crit-1',
        text: 'Critical: Access control violation detected at Sunrise Fields',
        severity: 'alert',
        category: 'critical',
        href: '/users'
      },
      {
        id: 'crit-2',
        text: 'Variance alert: Inventory mismatch flagged in Riverbend',
        severity: 'warning',
        category: 'critical',
        href: '/reports'
      },
      // Calendar-type (from calendar mock events)
      {
        id: 'cal-1',
        text: 'On-site Audit scheduled – Sunrise Fields (tomorrow)',
        severity: 'info',
        category: 'calendar',
        href: '/calendar'
      },
      {
        id: 'cal-2',
        text: 'Report Deadline – Q3 Audit Summary due in 1 week',
        severity: 'warning',
        category: 'calendar',
        href: '/calendar'
      },
      {
        id: 'cal-3',
        text: 'License Renewal – Riverbend due in 12 days',
        severity: 'info',
        category: 'calendar',
        href: '/calendar'
      },
      // Capacity-style, reframed for auditor context
      {
        id: 'cap-1',
        text: 'Compliance Review scheduled – Hempstead (in 5 days)',
        severity: 'info',
        category: 'capacity',
        href: '/calendar'
      }
    ];
    setItems(out);
  };

  // Group notifications by category with priority
  const groupedNotifications = useMemo(() => {
    const groups: NotificationGroup[] = [
      {
        category: 'critical',
        title: 'Critical Actions',
        items: items.filter(item => item.category === 'critical'),
        priority: 1,
      },
      {
        category: 'calendar',
        title: 'Scheduled Tasks',
        items: items.filter(item => item.category === 'calendar'),
        priority: 2,
      },
      {
        category: 'capacity',
        title: 'Capacity Management',
        items: items.filter(item => item.category === 'capacity'),
        priority: 3,
      },
    ];
    
    // Sort by priority and filter out empty groups
    return groups
      .filter(group => group.items.length > 0)
      .sort((a, b) => a.priority - b.priority);
  }, [items]);

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
        <div className="absolute right-0 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-50">
          <div className="px-3 pb-2 text-sm text-gray-500 font-medium">Notifications</div>
          {items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-600">No notifications</div>
          ) : (
            <div className="max-h-96 overflow-auto">
              {groupedNotifications.map((group) => (
                <div key={group.category} className="mb-3 last:mb-0">
                  <div className="px-3 py-1 bg-gray-50 border-y border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        {group.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        group.category === 'critical' 
                          ? 'bg-red-100 text-red-800'
                          : group.category === 'calendar'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {group.items.length}
                      </span>
                    </div>
                  </div>
                  <ul className="px-1">
                    {group.items.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (n.href) {
                              navigate(n.href);
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
