import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModuleProvider } from './context/ModuleContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LifecycleExplorer from './pages/LifecycleExplorer';
import Calendar from './pages/Calendar';
// Removed: Inventory, Sites, Plants
import BlockchainView from './pages/BlockchainView';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
// Removed in farmer app scope
// import Licensing from './pages/Licensing';
// import Facilities from './pages/Facilities';
import Production from './pages/Production';
import Inventory from './pages/Inventory';
import License from './pages/License';
import ErrorBoundary from './components/ErrorBoundary';
import { enableDevTools, setupErrorHandling } from './lib/devtools';

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
                        <Route path="/lifecycle" element={<LifecycleExplorer />} />
                        <Route path="/calendar" element={<Calendar />} />
                        {/* Farmer: no Licensing/Operators/Integrity routes */}
                        <Route path="/production" element={<Production />} />
                        <Route path="/facilities" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/sites" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/plants" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/license" element={<License />} />
                        <Route path="/integrity" element={<Navigate to="/dashboard" replace />} />
                        {/* Debug route removed in MVP build */}
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
