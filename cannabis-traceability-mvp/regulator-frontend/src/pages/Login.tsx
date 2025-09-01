import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, verify2FA, is2FARequired } = useAuth();
  const [username, setUsername] = useState('Regulator');
  const [password, setPassword] = useState('1234');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl border border-gray-200 shadow">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Sign in</h1>

        {!is2FARequired ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
            </div>
            <button className="w-full bg-primary text-white rounded-md py-2 font-medium">Continue</button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">2FA Code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="mt-1 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
            </div>
            <button className="w-full bg-primary text-white rounded-md py-2 font-medium">Verify</button>
          </form>
        )}

  <p className="text-xs text-gray-500 mt-4">Use Farmer / 1234. 2FA accepts any 6 digits.</p>
      </div>
    </div>
  );
}
