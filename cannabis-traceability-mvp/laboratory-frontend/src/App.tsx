import React from 'react';
import NavBar from './components/NavBar';

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-6">{children}</main>
    </div>
  );
}
