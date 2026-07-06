"use client";

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  id?: string;
  label: string;
  value: string;
  subValue?: string;
  unit?: string;
  icon: LucideIcon;
  iconGlowClass: string;
  iconColor: string;
  accentColor: string;
  delay?: number;
  badge?: React.ReactNode;
}

export default function MetricCard({
  id,
  label,
  value,
  subValue,
  unit,
  icon: Icon,
  iconGlowClass,
  iconColor,
  accentColor,
  delay = 0,
  badge,
}: MetricCardProps) {
  return (
    <div
      id={id ?? `metric-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="glass-card animate-fade-in-up"
      style={{
        padding: "1rem 1.25rem",
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
    >
      {/* Top row: icon + label + optional badge */}
      <div className="flex items-center justify-between" style={{ marginBottom: "0.75rem" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 36,
              height: 36,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}30`,
              flexShrink: 0,
            }}
          >
            <Icon size={16} style={{ color: iconColor }} className={iconGlowClass} />
          </div>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
        </div>
        {badge}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span
          style={{
            fontSize: "1.45rem",
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
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {subValue && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "0.25rem" }}>
          {subValue}
        </p>
      )}

      {/* Accent bar */}
      <div
        style={{
          marginTop: "0.75rem",
          height: 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
          opacity: 0.5,
        }}
      />
    </div>
  );
}
