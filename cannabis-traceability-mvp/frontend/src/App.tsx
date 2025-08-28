import React from 'react';
import { NavBar } from './components';

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
