import React from 'react';

export default function DisabledLink({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-gray-400 cursor-not-allowed" title="Coming soon">
      {children}
    </span>
  );
}
