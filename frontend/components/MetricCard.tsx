"use client";

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  iconGlowClass: string;
  iconColor: string;
  accentColor: string;
  delay?: number;
}

export default function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  iconGlowClass,
  iconColor,
  accentColor,
  delay = 0,
}: MetricCardProps) {
  return (
    <div
      id={`metric-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="glass-card animate-fade-in-up"
      style={{
        padding: "1.25rem 1.5rem",
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
    >
      {/* Top row: icon + label */}
      <div className="flex items-center gap-3" style={{ marginBottom: "0.875rem" }}>
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 40,
            height: 40,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
            flexShrink: 0,
          }}
        >
          <Icon size={18} style={{ color: iconColor }} className={iconGlowClass} />
        </div>
        <span
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.1,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {/* Accent bar */}
      <div
        style={{
          marginTop: "0.875rem",
          height: 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
          opacity: 0.5,
        }}
      />
    </div>
  );
}
