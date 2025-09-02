import React from 'react';
import './index.css';

const Button = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="inline-flex items-center justify-center rounded-lg bg-black text-white px-6 py-3 text-base font-medium shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition"
  >
    {children}
  </a>
);

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <header className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-600" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Cannabis Traceability MVP</h1>
            <p className="text-gray-500 text-sm">Seed-to-sale integrity, simplified</p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-10">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Welcome</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                This MVP showcases a modular traceability platform spanning regulators, auditors, operators, shops, and laboratories. It demonstrates compliant data capture, lifecycle tracking, and blockchain integrity views aligned with the proposal scope.
              </p>
              <ul className="mt-6 space-y-2 text-gray-700">
                <li>• Role-based views and flows</li>
                <li>• Location-aware operations and KPIs</li>
                <li>• Offline-first architecture (concept)</li>
                <li>• Blockchain commit lifecycle (concept)</li>
              </ul>
              <p className="mt-6 text-sm text-gray-500">Select a view below to begin at the login screen.</p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button href="http://localhost:9001">Regulator View</Button>
                <Button href="http://localhost:9002">Auditor View</Button>
                <Button href="http://localhost:9003">Farmer/Operator View</Button>
                <Button href="http://localhost:9004">Shop View</Button>
                <Button href="http://localhost:9005">Laboratory View</Button>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 p-10 text-white">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_30%),radial-gradient(circle_at_80%_30%,white,transparent_30%)]" />
              <div className="relative">
                <h3 className="text-xl font-medium">Highlights</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-white" /> Secure, role-based navigation</li>
                  <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-white" /> Intuitive Apple-style UI</li>
                  <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-white" /> Modular architecture</li>
                  <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-white" /> Audit-friendly dashboards</li>
                </ul>
                <div className="mt-8 rounded-xl bg-white/10 p-4">
                  <p className="text-sm leading-6">
                    The demonstration aligns with the proposal documents, focusing on transparency, compliance, and a streamlined user experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 py-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} RenewEdge Solutions — Cannabis Traceability Suite
      </footer>
    </div>
  );
}
