import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
const Ctx = createContext(undefined);
export function ModuleProvider({ children }) {
    const { user } = useAuth();
    const [activeModule, setActiveModule] = useState(() => {
        const saved = (localStorage.getItem('activeModule') || 'cannabis');
        return saved;
    });
    const availableModules = useMemo(() => {
        const mods = (user?.modules || ['cannabis']);
        // Normalize possible misspelling "alkohol" => "alcohol"
        return mods.map((m) => (m === 'alkohol' ? 'alcohol' : m));
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
    return _jsx(Ctx.Provider, { value: value, children: children });
}
export function useModule() {
    const ctx = useContext(Ctx);
    if (!ctx)
        throw new Error('ModuleContext missing');
    return ctx;
}
