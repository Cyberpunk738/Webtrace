'use client';

import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'normal' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  variant = 'normal',
}) => {
  let borderClass = 'border-slate-200 bg-white';
  let valueColor = 'text-slate-950';

  if (variant === 'warning') {
    borderClass = 'border-amber-300 bg-amber-50/50';
    valueColor = 'text-amber-700';
  } else if (variant === 'danger') {
    borderClass = 'border-rose-300 bg-rose-50/50';
    valueColor = 'text-rose-700';
  }

  return (
    <div className={`rounded-xl border p-4 transition-all shadow-sm ${borderClass}`}>
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs font-semibold text-slate-500">{label}</span>
        <div className="text-slate-700">{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className={`font-mono text-2xl font-bold tracking-tight ${valueColor}`}>{value}</span>
      </div>
      {subtitle && <p className="mt-1 text-[11px] font-mono text-slate-500">{subtitle}</p>}
    </div>
  );
};
