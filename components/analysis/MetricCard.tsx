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
  let borderClass = 'border-slate-800 bg-slate-900/60';
  let valueColor = 'text-slate-100';

  if (variant === 'warning') {
    borderClass = 'border-amber-500/20 bg-amber-500/5';
    valueColor = 'text-amber-400';
  } else if (variant === 'danger') {
    borderClass = 'border-rose-500/20 bg-rose-500/5';
    valueColor = 'text-rose-400';
  }

  return (
    <div className={`rounded-xl border p-4 transition-all ${borderClass}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-slate-400">{label}</span>
        <div className="text-slate-400">{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className={`font-mono text-2xl font-bold tracking-tight ${valueColor}`}>{value}</span>
      </div>
      {subtitle && <p className="mt-1 text-[11px] font-mono text-slate-400">{subtitle}</p>}
    </div>
  );
};
