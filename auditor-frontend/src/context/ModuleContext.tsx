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
  const [activeModule, setActiveModule] = useState<ModuleName>(() => {
    const saved = (localStorage.getItem('activeModule') || 'cannabis') as ModuleName;
    return saved;
  });

  const availableModules = useMemo<ModuleName[]>(() => {
    const mods = (user?.modules || ['cannabis']) as string[];
    // Normalize possible misspelling "alkohol" => "alcohol"
    return mods.map((m) => (m === 'alkohol' ? 'alcohol' : (m as ModuleName))) as ModuleName[];
  }, [user?.modules]);

  // Reconcile stored module with user's available set
  useEffect(() => {
    if (!availableModules.includes(activeModule)) {
      setActiveModule(availableModules[0] || 'cannabis');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableModules.join('|')]);

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
