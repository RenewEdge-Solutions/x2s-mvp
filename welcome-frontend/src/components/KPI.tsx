import React from 'react';
import Card from './Card';

export default function KPI({
  label,
  value,
  icon,
  action,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">{label}</div>
          {action && <div className="text-xs">{action}</div>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="text-2xl font-semibold text-gray-900 mt-1">{value}</div>
    </Card>
  );
}
