"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageViewerProps {
  imageB64: string;
  width: number;
  height: number;
}

export default function ImageViewer({ imageB64, width, height }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleReset = () => setZoom(1);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Star Field
        </h2>

        {/* Zoom controls */}
        <div
          className="flex items-center gap-1"
          style={{
            background: "rgba(16,19,42,0.8)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "4px 6px",
          }}
        >
          <button
            id="btn-zoom-out"
            onClick={handleZoomOut}
            disabled={zoom <= 0.25}
            aria-label="Zoom out"
            style={{
              background: "none",
              border: "none",
              cursor: zoom <= 0.25 ? "not-allowed" : "pointer",
              color: zoom <= 0.25 ? "var(--text-muted)" : "var(--text-secondary)",
              padding: "4px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s",
            }}
          >
            <ZoomOut size={15} />
          </button>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.75rem",
              fontWeight: 600,
              minWidth: 36,
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            id="btn-zoom-in"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            aria-label="Zoom in"
            style={{
              background: "none",
              border: "none",
              cursor: zoom >= 3 ? "not-allowed" : "pointer",
              color: zoom >= 3 ? "var(--text-muted)" : "var(--text-secondary)",
              padding: "4px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s",
            }}
          >
            <ZoomIn size={15} />
          </button>
          <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 2px" }} />
          <button
            id="btn-zoom-reset"
            onClick={handleReset}
            aria-label="Reset zoom"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              padding: "4px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s",
            }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Image container */}
      <div
        id="image-viewer-container"
        className="animate-fade-in-up"
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid var(--border)",
          background: "#04050d",
          position: "relative",
          aspectRatio: width && height ? `${width}/${height}` : "1/1",
          maxHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(124,58,237,0.15), 0 0 80px rgba(6,182,212,0.08)",
        }}
      >
        <div
          style={{
            transition: "transform 0.3s ease",
            transform: `scale(${zoom})`,
            transformOrigin: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            id="star-field-image"
            src={`data:image/png;base64,${imageB64}`}
            alt={`Astronomical FITS image — ${width}×${height} pixels`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Overlay corner badge */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            background: "rgba(4,5,13,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "3px 8px",
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            fontFamily: "monospace",
          }}
        >
          {width} × {height}
        </div>
      </div>
    </div>
  );
}
