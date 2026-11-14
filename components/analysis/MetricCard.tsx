"use client";

import React from "react";

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: "normal" | "warning" | "danger";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  variant = "normal",
}) => {
  let borderClass = "border-[#424137] bg-[#252525]";
  let valueColor = "text-[#f6f3e9]";

  if (variant === "warning") {
    borderClass = "border-amber-300 bg-[#3d3420]/50";
    valueColor = "text-amber-300";
  } else if (variant === "danger") {
    borderClass = "border-rose-300 bg-[#40232b]/50";
    valueColor = "text-rose-300";
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-all shadow-sm ${borderClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs font-semibold text-[#aaa69c]">
          {label}
        </span>
        <div className="text-[#d5d2c8]">{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span
          className={`font-mono text-2xl font-bold tracking-tight ${valueColor}`}
        >
          {value}
        </span>
      </div>
      {subtitle && (
        <p className="mt-1 text-[11px] font-mono text-[#aaa69c]">{subtitle}</p>
      )}
    </div>
  );
};
