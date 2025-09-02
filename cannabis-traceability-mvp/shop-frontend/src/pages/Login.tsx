import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDemoCode } from '../lib/totp';

export default function Login() {
  const { login, verify2FA, is2FARequired } = useAuth();
  const [username, setUsername] = useState('Shop');
  const [password, setPassword] = useState('1234');
  const [code, setCode] = useState('');
  const [nowCode, setNowCode] = useState(getDemoCode('SHOP-DEMO'));
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setNowCode(getDemoCode('SHOP-DEMO')), 1000);
    return () => clearInterval(t);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!is2FARequired) await login(username, password);
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await verify2FA(code);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand / Illustration */}
        <div className="relative hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm p-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          <h2 className="text-3xl font-bold text-gray-900">Shop Portal</h2>
          <p className="mt-2 text-gray-600">Secure access to POS and inventory tools.</p>
          <ul className="mt-6 space-y-2 text-sm text-gray-700">
            <li>• Role: Shop</li>
            <li>• Access: POS, Inventory, Sales logs</li>
            <li>• Compliance-grade session with 2FA</li>
          </ul>

          {/* Phone mock for 2FA */}
          <div className="absolute -bottom-6 -right-6 w-48 h-96 rotate-6">
            <div className="relative h-full w-full rounded-3xl bg-black/90 p-3 shadow-2xl ring-8 ring-gray-200">
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex flex-col">
                <div className="text-xs text-gray-400">Authenticator</div>
                <div className="mt-4 text-gray-300 text-xs">SHOP-DEMO</div>
                <div className="mt-1 text-4xl font-mono tracking-widest text-white">{nowCode.substring(0,3)} {nowCode.substring(3)}</div>
                <div className="mt-1 text-xs text-gray-400">Code refreshes every 30s</div>
                <div className="mt-auto grid grid-cols-3 gap-1 text-[10px] text-white/70">
                  {Array.from({length:9}).map((_,i)=>(
                    <div key={i} className="aspect-square rounded-md bg-white/10 backdrop-blur-sm flex items-center justify-center">{i+1}</div>
                  ))}
                  <div className="col-span-2 aspect-square rounded-md bg-white/10 flex items-center justify-center">0</div>
                  <div className="aspect-square rounded-md bg-emerald-500/80 flex items-center justify-center">✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-600">Enter your credentials to access the Shop workspace.</p>
          </div>

          {!is2FARequired ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Shop"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="••••"
                />
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 font-medium transition">Continue</button>
            </form>
          ) : (
            <form onSubmit={onVerify} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700">2FA Code</label>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={nowCode}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter the code shown on the device mock (auto refreshes every 30s).</p>
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 font-medium transition">Verify</button>
            </form>
          )}

          <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
            <div className="font-medium">Demo credentials</div>
            <div className="mt-1 text-gray-600">Username: Shop &nbsp;•&nbsp; Password: 1234</div>
            <div className="text-gray-500">2FA Code: shown on the phone (e.g. {nowCode})</div>
          </div>
        </div>
      </div>
    </div>
  );
}
