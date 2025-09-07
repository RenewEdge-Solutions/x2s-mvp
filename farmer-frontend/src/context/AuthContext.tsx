import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getDemoCode, getDemoCodeForStep } from '../lib/totp';

type Role = 'Regulator' | 'Auditor' | 'Grower' | 'Shop' | 'Lab' | 'Operator' | 'Farmer';

export type UserProfile = {
  id: string;
  username: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  modules?: string[];
};

type User = UserProfile | null;

type AuthCtx = {
  user: User;
  is2FARequired: boolean;
  login: (username: string, password: string) => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [is2FARequired, set2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState<User>(null);
  const DEFAULT_ROLE: Role = 'Farmer';
  const SECRET = 'FARMER-DEMO';
  const [initialStep, setInitialStep] = useState<number | null>(null);

  const login = async (username: string, password: string) => {
    if (!username || password !== '1234') throw new Error('Invalid credentials');
    setPendingUser({
      id: 'demo-user',
      username,
      role: DEFAULT_ROLE,
      firstName: DEFAULT_ROLE,
      lastName: 'User',
      phone: '+1 (555) 010-0001',
      email: `${username.toLowerCase()}@demo.local`,
    });
    set2FA(true);
    setInitialStep(Math.floor(Date.now() / 1000 / 30));
  };

  const verify2FA = async (code: string) => {
    const sanitized = (code || '').replace(/\D/g, '').slice(0, 6);
    const nowStep = Math.floor(Date.now() / 1000 / 30);
    const candidates = new Set<string>();
    // Current window ±1
    for (let d = -1; d <= 1; d++) {
      candidates.add(getDemoCodeForStep(SECRET, nowStep + d));
    }
    // Also accept codes around the initial step at login to avoid boundary races
    if (initialStep != null) {
      for (let d = -1; d <= 1; d++) {
        candidates.add(getDemoCodeForStep(SECRET, initialStep + d));
      }
    }
    const isDev = import.meta.env?.MODE !== 'production';
    const devBypass = isDev && /^[0-9]{6}$/.test(sanitized);
    if (!candidates.has(sanitized) && !devBypass) throw new Error('Invalid 2FA code');
    setUser(pendingUser);
    setPendingUser(null);
    set2FA(false);
    setInitialStep(null);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const value = useMemo(
    () => ({ user, is2FARequired, login, verify2FA, logout }),
    [user, is2FARequired],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('AuthContext missing');
  return ctx;
}
