import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
};

export default function Card({ children, className = '', title, subtitle }: Props) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
