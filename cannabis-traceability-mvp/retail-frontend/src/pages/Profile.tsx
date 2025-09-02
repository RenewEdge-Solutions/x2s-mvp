import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { KeyRound, ShieldCheck, MonitorSmartphone } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [twoFA, setTwoFA] = useState(true);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-600">Account, security, and notifications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Account */}
        <Card className="lg:col-span-2" title="Account" subtitle="Basic details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Field label="Name" value={`${user.firstName} ${user.lastName}`} />
            <Field label="Username" value={user.username} />
            <Field label="Role" value={user.role} />
            <Field label="Email" value={user.email} />
            <Field label="Phone" value={user.phone} />
            <div className="sm:col-span-2">
              <Field label="Address" value={user.address} />
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs text-gray-500">Subscribed Modules</div>
              <div className="text-gray-900">{user.modules?.length ? user.modules.join(', ') : '—'}</div>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card title="Security" subtitle="2FA and credentials">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-gray-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden /> Two-factor authentication
              </div>
              <button
                className={`px-2 py-1 rounded-md text-xs ring-1 ${twoFA ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-gray-50 text-gray-700 ring-gray-200'}`}
                onClick={() => setTwoFA((t) => !t)}
              >
                {twoFA ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Password</div>
              <button className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">
                <KeyRound className="h-4 w-4" aria-hidden /> Update password
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Notifications */}
  <Card className="lg:col-span-2" title="Notifications" subtitle="Delivery preferences">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Toggle label="Email alerts" defaultChecked />
            <Toggle label="SMS alerts" />
            <Toggle label="Ledger mismatch alerts" defaultChecked />
            <Toggle label="Inspection schedule reminders" defaultChecked />
          </div>
        </Card>

        {/* Active sessions */}
        <Card title="Active sessions" subtitle="Signed-in devices">
          <div className="space-y-2 text-sm">
            {[
              { device: 'MacBook Pro • Safari', ip: '102.22.16.5', last: '2 minutes ago', current: true },
              { device: 'iPhone • Mobile Safari', ip: '102.22.16.5', last: 'Yesterday 14:10' },
              { device: 'Windows • Chrome', ip: '41.78.112.220', last: '2 days ago' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                <div className="inline-flex items-center gap-2 text-gray-800">
                  <MonitorSmartphone className="h-4 w-4 text-emerald-600" aria-hidden />
                  <span className="font-medium">{s.device}</span>
                </div>
                <div className="text-xs text-gray-500">
                  <div>{s.ip}</div>
                  <div>{s.current ? 'Current session' : s.last}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-gray-900">{value ?? '—'}</div>
    </div>
  );
}

function Toggle({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-800">{label}</span>
      <button
        onClick={() => setOn((v) => !v)}
        className={`h-6 w-10 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-gray-300'} relative`}
        role="switch"
        aria-checked={on}
      >
        <span className={`absolute top-0.5 ${on ? 'right-0.5' : 'left-0.5'} h-5 w-5 rounded-full bg-white shadow`} />
      </button>
    </div>
  );
}
