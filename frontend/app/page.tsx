"use client";

import { useState, useCallback } from "react";
import { Telescope, AlertCircle, RefreshCw, Github } from "lucide-react";
import DropZone from "@/components/DropZone";
import ImageViewer from "@/components/ImageViewer";
import MetricsDashboard from "@/components/MetricsDashboard";

type AppState = "idle" | "loading" | "success" | "error";

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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileSelected = useCallback(async (file: File) => {
    setAppState("loading");
    setResult(null);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze-fits`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let detail = "An unexpected error occurred while analyzing the file.";
        try {
          const errBody = await response.json();
          detail = errBody.detail ?? detail;
        } catch {
          // ignore JSON parse errors on error bodies
        }
        setErrorMessage(detail);
        setAppState("error");
        return;
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
      setAppState("success");
    } catch (err) {
      const msg =
        err instanceof TypeError && err.message.includes("fetch")
          ? "Could not connect to the backend server. Make sure the FastAPI server is running on port 8000."
          : String(err);
      setErrorMessage(msg);
      setAppState("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState("idle");
    setResult(null);
    setErrorMessage("");
  }, []);

  return (
    <main
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Nav bar ────────────────────────────────────────────────────────── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          borderBottom: "1px solid rgba(99,102,241,0.12)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(4,5,13,0.85)",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(124,58,237,0.4)",
            }}
          >
            <Telescope size={18} style={{ color: "#fff" }} />
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "-0.02em",
            }}
            className="gradient-text"
          >
            AstroVision
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                boxShadow: "0 0 6px #22c55e",
              }}
            />
            FITS Analyzer
          </span>
        </div>
      </nav>

      {/* ── Page body ──────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
          padding: "2.5rem 1.5rem 4rem",
        }}
      >
        {/* ── Hero heading (idle/error) ─────────────────────────────────── */}
        {appState !== "success" && (
          <div
            style={{ textAlign: "center", marginBottom: "3rem" }}
            className="animate-fade-in-up"
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.25)",
                borderRadius: 99,
                padding: "0.375rem 1rem",
                marginBottom: "1.25rem",
                fontSize: "0.75rem",
                color: "#a78bfa",
                fontWeight: 600,
                letterSpacing: "0.06em",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#7c3aed",
                  boxShadow: "0 0 6px #7c3aed",
                }}
              />
              ASTRONOMICAL IMAGE ANALYZER
            </div>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                marginBottom: "1rem",
              }}
              className="gradient-text"
            >
              Explore the Stars
              <br />
              in Your Data
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                maxWidth: 500,
                margin: "0 auto",
                fontSize: "1rem",
                lineHeight: 1.7,
              }}
            >
              Upload a{" "}
              <code
                style={{
                  background: "rgba(124,58,237,0.15)",
                  padding: "1px 6px",
                  borderRadius: 4,
                  color: "#a78bfa",
                  fontFamily: "monospace",
                }}
              >
                .fits
              </code>{" "}
              file to visualize star fields and extract pixel metrics in seconds.
            </p>
          </div>
        )}

        {/* ── Upload section ────────────────────────────────────────────── */}
        {(appState === "idle" || appState === "loading") && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <DropZone onFileSelected={handleFileSelected} isLoading={appState === "loading"} />
          </div>
        )}

        {/* ── Error state ───────────────────────────────────────────────── */}
        {appState === "error" && (
          <div
            className="animate-fade-in-up"
            style={{ maxWidth: 600, margin: "0 auto" }}
          >
            <div
              id="error-panel"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 20,
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.25rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertCircle size={26} style={{ color: "#f87171" }} />
              </div>
              <div>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "#fca5a5",
                    marginBottom: "0.5rem",
                  }}
                >
                  Analysis Failed
                </h2>
                <p
                  id="error-message"
                  style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6 }}
                >
                  {errorMessage}
                </p>
              </div>
              <button
                id="btn-try-again"
                onClick={handleReset}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 10,
                  padding: "0.625rem 1.25rem",
                  color: "#fca5a5",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ── Success: two-column results layout ───────────────────────── */}
        {appState === "success" && result && (
          <div>
            {/* Results toolbar */}
            <div
              className="animate-fade-in-up"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  letterSpacing: "-0.02em",
                }}
                className="gradient-text"
              >
                Analysis Complete
              </h2>
              <button
                id="btn-analyze-another"
                onClick={handleReset}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(124,58,237,0.12)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  borderRadius: 10,
                  padding: "0.5rem 1rem",
                  color: "#a78bfa",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <RefreshCw size={13} />
                Analyze Another
              </button>
            </div>

            {/* Two-column layout */}
            <div
              id="results-layout"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "1.5rem",
              }}
              className="results-grid"
            >
              {/* Left: image */}
              <div className="glass-card" style={{ padding: "1.25rem" }}>
                <ImageViewer
                  imageB64={result.image_b64}
                  width={result.width}
                  height={result.height}
                />
              </div>

              {/* Right: metrics */}
              <div>
                <MetricsDashboard data={result} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(99,102,241,0.1)",
          padding: "1.25rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Telescope size={12} style={{ color: "#7c3aed" }} />
        AstroVision — FITS Image Analyzer · Powered by FastAPI &amp; Next.js
      </footer>

      {/* Responsive grid style */}
      <style jsx>{`
        @media (min-width: 768px) {
          .results-grid {
            grid-template-columns: 1fr 380px !important;
          }
        }
        @media (min-width: 1024px) {
          .results-grid {
            grid-template-columns: 1fr 420px !important;
          }
        }
      `}</style>
    </main>
  );
}
