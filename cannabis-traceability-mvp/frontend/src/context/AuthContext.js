import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
const Ctx = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    });
    const [is2FARequired, set2FA] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);
    const login = async (username, password) => {
        const res = await api.login(username, password);
        set2FA(res.require2fa);
        setPendingUser(res.user);
    };
    const verify2FA = async (code) => {
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
        if (user)
            localStorage.setItem('user', JSON.stringify(user));
    }, [user]);
    const value = useMemo(() => ({ user, is2FARequired, login, verify2FA, logout }), [user, is2FARequired]);
    return _jsx(Ctx.Provider, { value: value, children: children });
}
export function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx)
        throw new Error('AuthContext missing');
    return ctx;
}
