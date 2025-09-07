import React from 'react';
import Card from './Card';

export default function KPI({
  label,
  value,
  icon,
  action,
  to,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  to?: string;
}) {
  return (
    <Card to={to}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500">{label}</div>
          {action && <div className="text-[11px]">{action}</div>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="text-xl font-semibold text-gray-900 mt-0.5">{value}</div>
    </Card>
  );
}
