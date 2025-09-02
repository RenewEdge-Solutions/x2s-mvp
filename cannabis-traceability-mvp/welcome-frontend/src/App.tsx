import React from 'react';
import {
  ShieldCheck,
  Scale,
  Leaf,
  Store,
  Microscope,
  ArrowRight,
  CheckCircle2,
  BadgeCheck,
  FileCheck2,
  Shield,
} from 'lucide-react';
import './index.css';

type Role = {
  name: string;
  href: string;
  icon: React.ElementType;
  blurb: string;
};

const roles: Role[] = [
  {
    name: 'Regulator',
    href: 'http://localhost:9001',
    icon: Scale,
    blurb: 'Licensing, compliance KPIs, enforcement views',
  },
  {
    name: 'Auditor',
    href: 'http://localhost:9002',
    icon: ShieldCheck,
    blurb: 'Chain-of-custody, audit logs, investigations',
  },
  {
  name: 'Farmer',
    href: 'http://localhost:9003',
    icon: Leaf,
    blurb: 'Seed-to-harvest, inventory, movement journals',
  },
  {
  name: 'Retail',
    href: 'http://localhost:9004',
    icon: Store,
    blurb: 'Point-of-sale traceability and product history',
  },
  {
    name: 'Laboratory',
    href: 'http://localhost:9005',
    icon: Microscope,
    blurb: 'COAs, batch results, recalls support',
  },
];

const RoleCard = ({ role }: { role: Role }) => (
  <a
    href={role.href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
    aria-label={`${role.name} view`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    <div className="relative flex items-start gap-4">
      <div className="rounded-xl bg-emerald-600/10 p-3 text-emerald-700 ring-1 ring-emerald-600/20">
        {React.createElement(role.icon, { size: 24 })}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">{role.name}</h3>
          <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-600" />
        </div>
        <p className="mt-1 text-sm text-gray-600">{role.blurb}</p>
      </div>
    </div>
  </a>
);

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <header className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-600/10 ring-1 ring-emerald-600/20 text-emerald-700 flex items-center justify-center">
            <Leaf className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Cannabis Traceability MVP</h1>
            <p className="text-gray-500 text-sm">Seed-to-sale integrity for regulators, auditors, operators, labs, and retail</p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="grid md:grid-cols-[1fr_1.25fr] xl:grid-cols-[1fr_1.35fr]">
            <div className="p-8">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Welcome</h2>
              <p className="mt-3 text-gray-600 leading-relaxed text-sm">
                This demo aligns to policy and procurement objectives for cannabis and industrial hemp programs: transparent seed-to-sale tracking, licensing oversight, chain-of-custody, and consumer safety.
              </p>
              <ul className="mt-4 grid grid-cols-1 gap-1.5 text-gray-700 text-sm">
                <li>• Compliance and licensing views (permits, metrics)</li>
                <li>• Chain-of-custody and audit-ready logs</li>
                <li>• Laboratory COAs tied to batches and recalls</li>
                <li>• Offline-first and blockchain lifecycle concepts</li>
              </ul>
            </div>
            <div className="relative p-8 bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="relative rounded-2xl bg-white/90 backdrop-blur-sm ring-1 ring-black/5 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold tracking-tight text-gray-900">Program overview</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                    <BadgeCheck className="h-3.5 w-3.5" /> Aligned to policy
                  </span>
                </div>
                <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2 whitespace-nowrap"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Public health & safety via verified product history</li>
                  <li className="flex items-start gap-2 whitespace-nowrap"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Oversight of licensing, movement, and inventory</li>
                  <li className="flex items-start gap-2 whitespace-nowrap"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Privacy-respecting data sharing with consent</li>
                  <li className="flex items-start gap-2 whitespace-nowrap"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Auditability and tamper‑evident records</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width policy, lifecycle, compliance uses entire space */}
      <section className="mx-auto max-w-6xl px-6 mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-gray-900">
              <Shield className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-semibold uppercase tracking-wide">Policy</h4>
            </div>
            <ul className="mt-2 space-y-1 text-gray-700 text-sm">
              <li className="flex gap-2 whitespace-nowrap"><FileCheck2 className="h-4 w-4 text-emerald-600" /> Licensing lifecycle (apply → issue → renew)</li>
              <li className="flex gap-2 whitespace-nowrap"><FileCheck2 className="h-4 w-4 text-emerald-600" /> Seed-to-sale traceability across license types</li>
              <li className="flex gap-2 whitespace-nowrap"><FileCheck2 className="h-4 w-4 text-emerald-600" /> Mandatory testing, COAs, batch results</li>
              <li className="flex gap-2 whitespace-nowrap"><FileCheck2 className="h-4 w-4 text-emerald-600" /> Recordkeeping, audit, enforcement</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 ring-1 ring-black/5">
            <div className="flex items-center gap-2 text-gray-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-semibold uppercase tracking-wide">Lifecycle</h4>
            </div>
            <ol className="mt-2 grid grid-cols-2 gap-y-1 text-gray-700 text-sm">
              <li className="flex gap-2 items-center whitespace-nowrap"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">1</span> Genetics & propagation</li>
              <li className="flex gap-2 items-center whitespace-nowrap"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">2</span> Cultivation events</li>
              <li className="flex gap-2 items-center whitespace-nowrap"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">3</span> Harvest, lots</li>
              <li className="flex gap-2 items-center whitespace-nowrap"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">4</span> Manufacture & label</li>
              <li className="flex gap-2 items-center whitespace-nowrap"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">5</span> Lab testing & COAs</li>
              <li className="flex gap-2 items-center whitespace-nowrap"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">6</span> Distribution & retail</li>
              <li className="flex gap-2 items-center whitespace-nowrap"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">7</span> Returns & recalls</li>
              <li className="flex gap-2 items-center whitespace-nowrap"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">8</span> Waste disposal & destruction</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 ring-1 ring-black/5 md:col-span-2">
            <div className="flex items-center gap-2 text-gray-900">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-semibold uppercase tracking-wide">Compliance</h4>
            </div>
            <ul className="mt-2 grid grid-cols-1 gap-2 text-gray-700 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <li className="flex gap-2 items-start"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Role-based access, consented sharing</li>
              <li className="flex gap-2 items-start"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Movement logs, inventory, chain‑of‑custody</li>
              <li className="flex gap-2 items-start"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> KPI dashboards for oversight</li>
              <li className="flex gap-2 items-start"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Tamper‑evident history, audit trails</li>
              <li className="flex gap-2 items-start"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Data retention & secure export</li>
              <li className="flex gap-2 items-start"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Automated alerts & incident reporting</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quick role access moved below */}
      <section className="mx-auto max-w-6xl px-6 mt-6">
        <h3 className="sr-only">Quick role access</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {roles.map((r) => (
            <RoleCard key={r.name} role={r} />
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 py-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} RenewEdge Solutions — Cannabis Traceability Suite
      </footer>
    </div>
  );
}
