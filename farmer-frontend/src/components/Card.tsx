import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  to?: string; // optional link makes the entire card clickable
};

export default function Card({ children, className = '', title, subtitle, to }: Props) {
  const base = `block relative bg-white rounded-xl border border-gray-200 shadow-sm p-4 overflow-hidden ${to ? 'hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200' : ''} ${className}`;
  const content = (
    <>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={base}>
        {content}
      </Link>
    );
  }
  return <div className={base}>{content}</div>;
}
