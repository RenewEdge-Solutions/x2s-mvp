import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import DataDump from './pages/DataDump';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModuleProvider } from './context/ModuleContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wizard from './pages/Wizard';
import LifecycleExplorer from './pages/LifecycleExplorer';
import Calendar from './pages/Calendar';
import Inventory from './pages/Inventory';
import Plants from './pages/Plants';
import BlockchainView from './pages/BlockchainView';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
function PrivateRoute({ children }) {
    const { user } = useAuth();
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(_Fragment, { children: children });
}
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(AuthProvider, { children: _jsx(ModuleProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/*", element: _jsx(PrivateRoute, { children: _jsx(App, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/wizard", element: _jsx(Wizard, {}) }), _jsx(Route, { path: "/lifecycle", element: _jsx(LifecycleExplorer, {}) }), _jsx(Route, { path: "/calendar", element: _jsx(Calendar, {}) }), _jsx(Route, { path: "/production", element: _jsx(Navigate, { to: "/facilities", replace: true }) }), _jsx(Route, { path: "/facilities", element: _jsx(Plants, {}) }), _jsx(Route, { path: "/inventory", element: _jsx(Inventory, {}) }), _jsx(Route, { path: "/reports", element: _jsx(Reports, {}) }), _jsx(Route, { path: "/integrity", element: _jsx(BlockchainView, {}) }), _jsx(Route, { path: "/debug/data", element: _jsx(DataDump, {}) }), _jsx(Route, { path: "/profile", element: _jsx(Profile, {}) })] }) }) }) })] }) }) }) }) }));
