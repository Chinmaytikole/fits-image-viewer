"use client";

import { Monitor, TrendingUp, TrendingDown, Aperture, Zap } from "lucide-react";
import MetricCard from "./MetricCard";

interface AnalysisResult {
  image_b64: string;
  width: number;
  height: number;
  max_dn: number;
  min_dn: number;
  gain: number;
  max_photon_count: number;
  filename: string;
}

interface MetricsDashboardProps {
  data: AnalysisResult;
}

function formatNumber(n: number, decimals = 2): string {
  if (Math.abs(n) >= 1_000_000)
    return (n / 1_000_000).toFixed(2) + "M";
  if (Math.abs(n) >= 1_000)
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toFixed(decimals);
}

const METRICS = (data: AnalysisResult) => [
  {
    label: "Resolution",
    value: `${data.width} × ${data.height}`,
    unit: "px",
    icon: Monitor,
    iconGlowClass: "icon-glow-indigo",
    iconColor: "#818cf8",
    accentColor: "#4f46e5",
    delay: 0,
  },
  {
    label: "Max DN",
    value: formatNumber(data.max_dn, 1),
    unit: "DN",
    icon: TrendingUp,
    iconGlowClass: "icon-glow-violet",
    iconColor: "#a78bfa",
    accentColor: "#7c3aed",
    delay: 80,
  },
  {
    label: "Min DN",
    value: formatNumber(data.min_dn, 1),
    unit: "DN",
    icon: TrendingDown,
    iconGlowClass: "icon-glow-cyan",
    iconColor: "#67e8f9",
    accentColor: "#06b6d4",
    delay: 160,
  },
  {
    label: "Camera Gain",
    value: data.gain.toFixed(4),
    unit: "e⁻/DN",
    icon: Aperture,
    iconGlowClass: "icon-glow-purple",
    iconColor: "#c084fc",
    accentColor: "#a855f7",
    delay: 240,
  },
  {
    label: "Max Photon Count",
    value: formatNumber(data.max_photon_count, 0),
    unit: "e⁻",
    icon: Zap,
    iconGlowClass: "icon-glow-teal",
    iconColor: "#2dd4bf",
    accentColor: "#14b8a6",
    delay: 320,
  },
];

export default function MetricsDashboard({ data }: MetricsDashboardProps) {
  const metrics = METRICS(data);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0ms", animationFillMode: "both" }}>
        <h2
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "0.25rem",
          }}
        >
          Image Metrics
        </h2>
        <p
          id="metrics-filename"
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={data.filename}
        >
          {data.filename}
        </p>
      </div>

      {/* Metric cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "0.75rem",
        }}
      >
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>
    </div>
  );
}
