import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

type Role = 'Regulator' | 'Auditor' | 'Grower' | 'Shop' | 'Lab' | 'Operator';

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

  const login = async (username: string, password: string) => {
    const res = await api.login(username, password);
    set2FA(res.require2fa);
  setPendingUser(res.user);
  };

  const verify2FA = async (code: string) => {
    await api.verify2FA(code);
    setUser(pendingUser);
    setPendingUser(null);
    set2FA(false);
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
