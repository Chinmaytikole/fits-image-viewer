"use client";

import {
  Monitor, TrendingUp, TrendingDown, Aperture, Zap,
  AlertTriangle, Shield, Activity, BarChart2, Layers,
  CheckCircle2, XCircle,
} from "lucide-react";
import MetricCard from "./MetricCard";

// ── Type definitions matching the backend JSON shape ────────────────────────
interface SciMetrics {
  unit: string;
  processing_level: string;
  max: number;
  min: number;
  mean: number;
  median: number;
  std: number;
}

interface ErrMetrics {
  available: boolean;
  mean_err?: number;
  median_err?: number;
  min_err?: number;
  max_err?: number;
  std_err?: number;
}

interface DqMetrics {
  available: boolean;
  total_pixels?: number;
  good_pixels?: number;
  bad_pixels?: number;
  pct_good?: number;
  pct_bad?: number;
  unique_flag_combos?: number;
  flag_counts?: Record<string, number>;
}

export interface AnalysisResult {
  image_b64: string;
  width: number;
  height: number;
  filename: string;
  sci: SciMetrics;
  gain: number;
  max_photon_count: number;
  err: ErrMetrics;
  dq: DqMetrics;
}

interface MetricsDashboardProps {
  data: AnalysisResult;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 2): string {
  if (!isFinite(n)) return "N/A";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000)     return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toFixed(decimals);
}

function fmtSci(n: number, unit: string): string {
  if (!isFinite(n)) return "N/A";
  // For physical calibrated units show more decimals
  if (unit === "MJy/sr" || unit === "Jy") return n.toExponential(3);
  return fmt(n, 1);
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginTop: "0.25rem",
        marginBottom: "0.5rem",
      }}
    >
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {children}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: "linear-gradient(90deg, rgba(99,102,241,0.2) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

function UnavailableBadge({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.75rem",
        borderRadius: 12,
        background: "rgba(107,114,128,0.07)",
        border: "1px dashed rgba(107,114,128,0.25)",
        color: "var(--text-muted)",
        fontSize: "0.75rem",
      }}
    >
      <XCircle size={13} style={{ opacity: 0.6 }} />
      No {label} extension found in this FITS file
    </div>
  );
}

// ── DQ flag breakdown pill list ───────────────────────────────────────────────
function DQFlagList({ flagCounts, totalPixels }: { flagCounts: Record<string, number>; totalPixels: number }) {
  const entries = Object.entries(flagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (entries.length === 0) return null;

  return (
    <div
      id="dq-flag-list"
      className="glass-card"
      style={{ padding: "0.875rem 1rem", marginTop: "0.75rem" }}
    >
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "0.625rem",
        }}
      >
        Top Flag Types
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        {entries.map(([name, count]) => {
          const pct = (count / totalPixels) * 100;
          return (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{name}</span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {count.toLocaleString()} px · {pct.toFixed(2)}%
                </span>
              </div>
              {/* Mini progress bar */}
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: "rgba(239,68,68,0.12)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(pct, 100)}%`,
                    background: "linear-gradient(90deg, #ef4444, #f87171)",
                    borderRadius: 2,
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MetricsDashboard({ data }: MetricsDashboardProps) {
  const { sci, err, dq, gain, max_photon_count } = data;

  const pctGoodColor = dq.available && dq.pct_good !== undefined
    ? dq.pct_good >= 99 ? "#22c55e"
    : dq.pct_good >= 95 ? "#eab308"
    : "#ef4444"
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>

      {/* ── File header ─────────────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ animationFillMode: "both", marginBottom: "0.25rem" }}>
        <p
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "0.2rem",
          }}
        >
          File
        </p>
        <p
          id="metrics-filename"
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.825rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "monospace",
          }}
          title={data.filename}
        >
          {data.filename}
        </p>
      </div>

      {/* ════════════════ SCI Array ════════════════ */}
      <SectionHeader>SCI — Science Array</SectionHeader>

      {/* Processing level badge */}
      <div
        id="sci-processing-level"
        className="animate-fade-in-up"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "rgba(124,58,237,0.1)",
          border: "1px solid rgba(124,58,237,0.25)",
          borderRadius: 8,
          padding: "0.35rem 0.7rem",
          fontSize: "0.72rem",
          color: "#a78bfa",
          fontWeight: 600,
          animationFillMode: "both",
          marginBottom: "0.25rem",
        }}
      >
        <Layers size={11} />
        {sci.processing_level}
      </div>

      {/* Resolution + Unit row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
        <MetricCard
          id="metric-resolution"
          label="Resolution"
          value={`${data.width}×${data.height}`}
          unit="px"
          icon={Monitor}
          iconGlowClass="icon-glow-indigo"
          iconColor="#818cf8"
          accentColor="#4f46e5"
          delay={0}
        />
        <MetricCard
          id="metric-sci-unit"
          label="Data Unit"
          value={sci.unit}
          icon={Activity}
          iconGlowClass="icon-glow-violet"
          iconColor="#a78bfa"
          accentColor="#7c3aed"
          delay={60}
        />
      </div>

      {/* Max / Min */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
        <MetricCard
          id="metric-sci-max"
          label="Max Value"
          value={fmtSci(sci.max, sci.unit)}
          unit={sci.unit}
          icon={TrendingUp}
          iconGlowClass="icon-glow-violet"
          iconColor="#a78bfa"
          accentColor="#7c3aed"
          delay={120}
        />
        <MetricCard
          id="metric-sci-min"
          label="Min Value"
          value={fmtSci(sci.min, sci.unit)}
          unit={sci.unit}
          icon={TrendingDown}
          iconGlowClass="icon-glow-cyan"
          iconColor="#67e8f9"
          accentColor="#06b6d4"
          delay={180}
        />
      </div>

      {/* Mean / Std */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
        <MetricCard
          id="metric-sci-mean"
          label="Mean"
          value={fmtSci(sci.mean, sci.unit)}
          unit={sci.unit}
          icon={BarChart2}
          iconGlowClass="icon-glow-indigo"
          iconColor="#818cf8"
          accentColor="#4f46e5"
          delay={240}
        />
        <MetricCard
          id="metric-sci-std"
          label="Std Dev σ"
          value={fmtSci(sci.std, sci.unit)}
          unit={sci.unit}
          icon={BarChart2}
          iconGlowClass="icon-glow-purple"
          iconColor="#c084fc"
          accentColor="#a855f7"
          delay={300}
        />
      </div>

      {/* Gain + Photon count */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
        <MetricCard
          id="metric-gain"
          label="Camera Gain"
          value={gain.toFixed(4)}
          unit="e⁻/DN"
          icon={Aperture}
          iconGlowClass="icon-glow-purple"
          iconColor="#c084fc"
          accentColor="#a855f7"
          delay={360}
        />
        <MetricCard
          id="metric-photon-count"
          label="Max Photons"
          value={fmt(max_photon_count, 0)}
          unit="e⁻"
          icon={Zap}
          iconGlowClass="icon-glow-teal"
          iconColor="#2dd4bf"
          accentColor="#14b8a6"
          delay={420}
        />
      </div>

      {/* ════════════════ ERR Array ════════════════ */}
      <SectionHeader>ERR — Uncertainty Array</SectionHeader>

      {!err.available ? (
        <UnavailableBadge label="ERR" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
          <MetricCard
            id="metric-err-mean"
            label="Mean Error"
            value={fmtSci(err.mean_err!, sci.unit)}
            unit={sci.unit}
            subValue="Avg per-pixel uncertainty"
            icon={Activity}
            iconGlowClass="icon-glow-teal"
            iconColor="#2dd4bf"
            accentColor="#14b8a6"
            delay={480}
          />
          <MetricCard
            id="metric-err-median"
            label="Median Error"
            value={fmtSci(err.median_err!, sci.unit)}
            unit={sci.unit}
            subValue="Robust central estimate"
            icon={Activity}
            iconGlowClass="icon-glow-indigo"
            iconColor="#818cf8"
            accentColor="#4f46e5"
            delay={540}
          />
          <MetricCard
            id="metric-err-min"
            label="Min Error"
            value={fmtSci(err.min_err!, sci.unit)}
            unit={sci.unit}
            icon={TrendingDown}
            iconGlowClass="icon-glow-cyan"
            iconColor="#67e8f9"
            accentColor="#06b6d4"
            delay={600}
          />
          <MetricCard
            id="metric-err-max"
            label="Max Error"
            value={fmtSci(err.max_err!, sci.unit)}
            unit={sci.unit}
            icon={TrendingUp}
            iconGlowClass="icon-glow-violet"
            iconColor="#a78bfa"
            accentColor="#7c3aed"
            delay={660}
          />
        </div>
      )}

      {/* ════════════════ DQ Array ════════════════ */}
      <SectionHeader>DQ — Data Quality Array</SectionHeader>

      {!dq.available ? (
        <UnavailableBadge label="DQ" />
      ) : (
        <>
          {/* Good vs Bad pixel overview */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
            <MetricCard
              id="metric-dq-good"
              label="Good Pixels"
              value={fmt(dq.good_pixels!, 0)}
              unit="px"
              subValue={`${dq.pct_good}% of array`}
              icon={CheckCircle2}
              iconGlowClass="icon-glow-teal"
              iconColor="#22c55e"
              accentColor="#16a34a"
              delay={720}
              badge={
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: pctGoodColor,
                    background: `${pctGoodColor}18`,
                    border: `1px solid ${pctGoodColor}30`,
                    borderRadius: 6,
                    padding: "1px 6px",
                  }}
                >
                  {dq.pct_good}%
                </span>
              }
            />
            <MetricCard
              id="metric-dq-bad"
              label="Bad Pixels"
              value={fmt(dq.bad_pixels!, 0)}
              unit="px"
              subValue={`${dq.pct_bad}% flagged`}
              icon={AlertTriangle}
              iconGlowClass=""
              iconColor="#f87171"
              accentColor="#ef4444"
              delay={780}
              badge={
                dq.bad_pixels! > 0 ? (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "#f87171",
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      borderRadius: 6,
                      padding: "1px 6px",
                    }}
                  >
                    {dq.pct_bad}%
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "#22c55e",
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.25)",
                      borderRadius: 6,
                      padding: "1px 6px",
                    }}
                  >
                    CLEAN
                  </span>
                )
              }
            />
          </div>

          {/* Unique flag combos */}
          <MetricCard
            id="metric-dq-unique-flags"
            label="Unique Flag Combinations"
            value={String(dq.unique_flag_combos ?? 0)}
            subValue="Distinct DQ bit patterns across all bad pixels"
            icon={Shield}
            iconGlowClass="icon-glow-purple"
            iconColor="#c084fc"
            accentColor="#a855f7"
            delay={840}
          />

          {/* Flag breakdown list */}
          {dq.flag_counts && Object.keys(dq.flag_counts).length > 0 && (
            <DQFlagList
              flagCounts={dq.flag_counts}
              totalPixels={dq.total_pixels!}
            />
          )}
        </>
      )}
    </div>
  );
}
