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
import Calendar from './pages/Calendar';
// Removed: Inventory, Sites, Plants, Lifecycle, Integrity, Licensing, Operators
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import ErrorBoundary from './components/ErrorBoundary';
import { enableDevTools, setupErrorHandling } from './lib/devtools';
import POS from './pages/POS';
import Inventory from './pages/Inventory';

// Enable development tools
enableDevTools();
setupErrorHandling();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ModuleProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <App>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/pos" element={<POS />} />
                        <Route path="/production" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/facilities" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/sites" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/plants" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/debug/data" element={<DataDump />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </App>
                  </PrivateRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ModuleProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
