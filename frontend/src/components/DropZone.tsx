"use client";

import { useCallback, useState } from "react";
import { Upload, Star, AlertCircle } from "lucide-react";

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

export default function DropZone({ onFileSelected, isLoading }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      const name = file.name.toLowerCase();
      if (!name.endsWith(".fits") && !name.endsWith(".fts")) {
        setValidationError(
          `"${file.name}" is not a valid FITS file. Please upload a .fits or .fts file.`
        );
        return false;
      }
      setValidationError(null);
      return true;
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && validateFile(file)) {
        onFileSelected(file);
      }
    },
    [onFileSelected, validateFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        onFileSelected(file);
      }
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [onFileSelected, validateFile]
  );

  if (isLoading) {
    return (
      <div
        id="dropzone-loading"
        className="dropzone flex flex-col items-center justify-center gap-6 p-16"
        style={{ minHeight: 320 }}
      >
        {/* Spinning orbital rings */}
        <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
          <div
            className="absolute inset-0 rounded-full border-2 animate-spin-slow"
            style={{ borderColor: "transparent", borderTopColor: "#7c3aed" }}
          />
          <div
            className="absolute rounded-full border-2 animate-spin-slow"
            style={{
              inset: 10,
              borderColor: "transparent",
              borderBottomColor: "#06b6d4",
              animationDuration: "1.4s",
              animationDirection: "reverse",
            }}
          />
          <Star
            size={24}
            style={{ color: "#a78bfa" }}
            className="icon-glow-violet"
          />
        </div>
        <div className="text-center">
          <p style={{ color: "#a5b4fc", fontWeight: 600, fontSize: "1rem" }}>
            Analyzing your FITS data…
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }}>
            Processing image and extracting metrics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="fits-file-input" style={{ cursor: "pointer", display: "block" }}>
        <div
          id="dropzone-area"
          className={`dropzone flex flex-col items-center justify-center gap-6 p-12 ${
            isDragging ? "drag-over" : ""
          }`}
          style={{ minHeight: 320 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="region"
          aria-label="FITS file drop zone"
        >
          {/* Icon cluster */}
          <div className="relative">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{
                width: 72,
                height: 72,
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              <Upload
                size={32}
                style={{ color: isDragging ? "#a78bfa" : "#7c3aed" }}
                className="icon-glow-violet"
              />
            </div>
            {/* Small orbiting star */}
            <div
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                width: 20,
                height: 20,
                background: "rgba(6,182,212,0.2)",
                border: "1px solid rgba(6,182,212,0.4)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Star size={10} style={{ color: "#06b6d4" }} />
            </div>
          </div>

          {/* Text */}
          <div className="text-center" style={{ maxWidth: 340 }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: "1.125rem",
                color: isDragging ? "#a78bfa" : "var(--text-primary)",
                transition: "color 0.2s",
              }}
            >
              {isDragging ? "Release to upload" : "Drop your FITS file here"}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 6 }}>
              or{" "}
              <span style={{ color: "#a78bfa", textDecoration: "underline" }}>
                click to browse
              </span>
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 12 }}>
              Accepted formats:{" "}
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
              <code
                style={{
                  background: "rgba(6,182,212,0.1)",
                  padding: "1px 6px",
                  borderRadius: 4,
                  color: "#67e8f9",
                  fontFamily: "monospace",
                }}
              >
                .fts
              </code>
            </p>
          </div>
        </div>
      </label>

      {/* Hidden file input */}
      <input
        id="fits-file-input"
        type="file"
        accept=".fits,.fts"
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload FITS file"
      />

      {/* Validation error */}
      {validationError && (
        <div
          className="flex items-start gap-3 rounded-xl p-4"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
          role="alert"
        >
          <AlertCircle size={18} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: "#fca5a5", fontSize: "0.875rem" }}>{validationError}</p>
        </div>
      )}
    </div>
  );
}
