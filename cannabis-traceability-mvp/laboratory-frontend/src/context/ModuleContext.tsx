import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

export type ModuleName = 'cannabis' | 'alcohol' | 'mushrooms' | 'explosives';

type ModuleCtx = {
  activeModule: ModuleName;
  setActiveModule: (m: ModuleName) => void;
  availableModules: ModuleName[];
};

const Ctx = createContext<ModuleCtx | undefined>(undefined);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Lab app: enforce Cannabis-only module and normalize any saved or user-provided values
  const [activeModule, setActiveModule] = useState<ModuleName>(() => {
    const raw = String(localStorage.getItem('activeModule') || 'cannabis').toLowerCase();
    return 'cannabis';
  });

  const availableModules = useMemo<ModuleName[]>(() => {
    return ['cannabis'];
  }, []);

  // Reconcile stored module with user's available set
  useEffect(() => {
    // Always correct any stray value back to cannabis
    if (activeModule !== 'cannabis') setActiveModule('cannabis');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule]);

  useEffect(() => {
    localStorage.setItem('activeModule', activeModule);
  }, [activeModule]);

  const value = useMemo(() => ({ activeModule, setActiveModule, availableModules }), [activeModule, availableModules]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useModule() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ModuleContext missing');
  return ctx;
}
