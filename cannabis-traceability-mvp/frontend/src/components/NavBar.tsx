import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DisabledLink from './DisabledLink';
import { useModule } from '../context/ModuleContext';
import { Leaf, ShieldCheck, Wand2, User as UserIcon, ChevronDown, LogOut, Calendar as CalendarIcon, Package as PackageIcon, Bell, Sprout, FileText } from 'lucide-react';
import { api } from '../lib/api';

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
          <Link className={`${isActive('/sites')} inline-flex items-center gap-1`} to="/sites">
            <Sprout className="h-4 w-4" aria-hidden /> Sites
          </Link>
          <Link className={`${isActive('/plants')} inline-flex items-center gap-1`} to="/plants">
            <Leaf className="h-4 w-4" aria-hidden /> Plants
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

  const refresh = async () => {
    if (activeModule !== 'cannabis') {
      setItems([]);
      return;
    }
    const [plants, harvests, capacityAlerts] = await Promise.all([
      api.getPlants(), 
      api.getHarvests(),
      api.getEmptyCapacityAlerts()
    ]);
    const now = Date.now();
    const daysBetween = (d: string | number | Date) => Math.floor((now - new Date(d).getTime()) / 86400000);

    const out: Notification[] = [];
    
    // Add capacity alerts (lowest priority - limit to 5)
    if (capacityAlerts?.emptyStructures) {
      capacityAlerts.emptyStructures.slice(0, 5).forEach((structure: any) => {
        out.push({
          id: `empty-${structure.structureId}`,
          text: `Empty ${structure.structureType}: ${structure.structureName} at ${structure.facilityName}`,
          severity: 'info',
          category: 'capacity',
          href: '/sites',
        });
      });
    }
    
    // Add low utilization alerts
    if (capacityAlerts?.lowUtilizationStructures) {
      capacityAlerts.lowUtilizationStructures.slice(0, 3).forEach((structure: any) => {
        out.push({
          id: `low-util-${structure.structureId}`,
          text: `Low utilization (${Math.round(structure.occupancyRate * 100)}%): ${structure.structureName}`,
          severity: 'info',
          category: 'capacity',
          href: '/sites',
        });
      });
    }
    
    // Add over capacity alerts
    if (capacityAlerts?.overCapacityStructures) {
      capacityAlerts.overCapacityStructures.forEach((structure: any) => {
        out.push({
          id: `over-capacity-${structure.structureId}`,
          text: `Over capacity: ${structure.structureName} (${structure.totalPlants} plants)`,
          severity: 'warning',
          category: 'capacity',
        href: '/sites',
      });
    });
    }

    plants.forEach((p: any) => {
      const age = daysBetween(p.plantedAt);
      const daysToHarvest = 60 - age;
      
      // Critical harvest notifications
      if (!p.harvested && daysToHarvest <= 3 && daysToHarvest >= 0) {
        out.push({
          id: `harvest-${p.id}`,
          text: `${
            daysToHarvest === 0 ? 'Harvest today' : `Harvest in ${daysToHarvest} day${daysToHarvest === 1 ? '' : 's'}`
          }: ${p.strain} at ${p.location}`,
          severity: daysToHarvest <= 1 ? 'alert' : 'warning',
          category: 'critical',
          href: '/wizard?step=2',
        });
      }
      
      // Calendar/scheduling notifications
      if (!p.harvested && age >= 12 && age <= 16) {
        out.push({ 
          id: `transplant-${p.id}`, 
          text: `Transplant recommended: ${p.strain} (${p.location})`, 
          severity: 'info', 
          category: 'calendar', 
          href: '/sites' 
        });
      }
      
      // Flip to flowering notifications (calendar category)
      if (!p.harvested && age >= 14 && age <= 30) {
        out.push({
          id: `flip-${p.id}`,
          text: `Ready to flip to flowering: ${p.strain} (${age} days old)`,
          severity: 'info',
          category: 'calendar',
          href: '/calendar',
        });
      }
    });
    
    harvests.forEach((h: any) => {
      if (h.status === 'drying') {
        const daysDrying = daysBetween(h.harvestedAt);
        if (daysDrying >= 5) {
          out.push({ 
            id: `dry-${h.id}`, 
            text: `Check drying lot ${h.id} (${daysDrying} days)`, 
            severity: 'warning', 
            category: 'critical', 
            href: '/inventory' 
          });
        }
      }
    });

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
