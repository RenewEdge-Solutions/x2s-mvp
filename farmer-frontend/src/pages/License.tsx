import React from 'react';
import Card from '../components/Card';

export default function License() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">License</h1>
        <p className="text-sm text-gray-600">Your cultivation license details and contacts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="License details">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-800">
            <div>
              <dt className="text-gray-500">License number</dt>
              <dd className="font-mono">LIC-CLT-2025-0912</dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd>Cultivation – Mixed light, Tier 2</dd>
            </div>
            <div>
              <dt className="text-gray-500">Issued</dt>
              <dd>2025-05-14</dd>
            </div>
            <div>
              <dt className="text-gray-500">Expires</dt>
              <dd>2026-05-13</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-emerald-100 text-emerald-700">Active</span></dd>
            </div>
            <div>
              <dt className="text-gray-500">Coverage</dt>
              <dd>Up to 10,000 sq ft flowering canopy</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500">Licensed premises</dt>
              <dd>Farm HQ, 45 Coastal Rd, Castries, St. Lucia</dd>
            </div>
          </dl>
        </Card>

        <Card title="Regulator contact">
          <div className="text-sm text-gray-800 space-y-2">
            <div>
              <div className="text-gray-500">Agency</div>
              <div>St. Lucia Cannabis Authority</div>
            </div>
            <div>
              <div className="text-gray-500">Inspector</div>
              <div>Marina Joseph</div>
            </div>
            <div>
              <div className="text-gray-500">Email</div>
              <div><a className="text-primary hover:underline" href="mailto:inspections@slu-cannabis.gov">inspections@slu-cannabis.gov</a></div>
            </div>
            <div>
              <div className="text-gray-500">Phone</div>
              <div>+1 (758) 555-0143</div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Contact the authority">
        <ContactForm />
      </Card>
    </div>
  );
}

function ContactForm() {
  return (
    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <label className="sm:col-span-1">
        <span className="block text-gray-700 mb-1">Your name</span>
        <input className="w-full rounded-md border-gray-300" placeholder="Jane Doe" />
      </label>
      <label className="sm:col-span-1">
        <span className="block text-gray-700 mb-1">Email</span>
        <input type="email" className="w-full rounded-md border-gray-300" placeholder="jane@example.com" />
      </label>
      <label className="sm:col-span-2">
        <span className="block text-gray-700 mb-1">Subject</span>
        <input className="w-full rounded-md border-gray-300" placeholder="License question / inspection scheduling" />
      </label>
      <label className="sm:col-span-2">
        <span className="block text-gray-700 mb-1">Message</span>
        <textarea rows={5} className="w-full rounded-md border-gray-300" placeholder="Provide details, license number, relevant dates, and attachments if any." />
      </label>
      <div className="sm:col-span-2 flex items-center justify-end gap-2">
        <button type="reset" className="px-3 py-1.5 text-gray-700">Clear</button>
        <button type="button" className="px-3 py-1.5 rounded-md bg-primary text-white hover:opacity-95" onClick={() => alert('Message sent (mock). The authority will respond via email.')}>Send message</button>
      </div>
    </form>
  );
}
 
