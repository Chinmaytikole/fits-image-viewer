import io
import base64
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend — must be set before pyplot import
import matplotlib.pyplot as plt

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from astropy.io import fits

app = FastAPI(title="FITS Image Analyzer API")

# Allow requests from the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DQ flag definitions (JWST / HST standard) ────────────────────────────────
# Bit value → human-readable label
DQ_FLAG_NAMES = {
    1:     "Do Not Use",
    2:     "Saturated",
    4:     "Jump Detected",
    8:     "Dropout",
    16:    "Persistence",
    32:    "AD Convert Error",
    64:    "Cosmic Ray",
    128:   "Reference Pixel",
    256:   "Bad Pixel (flat)",
    512:   "Bad Pixel (reset)",
    1024:  "Bad Pixel (dark)",
    2048:  "Unreliable Flat",
    4096:  "Unreliable Gain",
    8192:  "Unreliable Slope",
    16384: "Unreliable Bias",
    32768: "Missing Data",
}


def _find_hdu(hdul, names: list[str], fallback_index: int = 0):
    """Return the first HDU matching any of the given extension names, or fallback."""
    for name in names:
        try:
            hdu = hdul[name]
            if hdu.data is not None:
                return hdu
        except (KeyError, IndexError):
            pass
    # Fallback: scan by index
    try:
        hdu = hdul[fallback_index]
        if hdu.data is not None:
            return hdu
    except IndexError:
        pass
    return None


def _coerce_2d(data: np.ndarray) -> np.ndarray:
    """Squeeze extra dimensions down to 2D."""
    if data.ndim > 2:
        # For cubes (nz, ny, nx) pick the first slice
        data = data[0] if data.shape[0] <= data.shape[-1] else data[-1]
    return data.squeeze()


def _extract_err_metrics(err_data: np.ndarray) -> dict:
    flat = err_data[np.isfinite(err_data)]
    if flat.size == 0:
        return {"available": False}
    return {
        "available": True,
        "mean_err": float(np.mean(flat)),
        "median_err": float(np.median(flat)),
        "min_err": float(np.min(flat)),
        "max_err": float(np.max(flat)),
        "std_err": float(np.std(flat)),
    }


def _extract_dq_metrics(dq_data: np.ndarray, total_pixels: int) -> dict:
    flat = dq_data.astype(np.int64).ravel()
    good_pixels = int(np.sum(flat == 0))
    bad_pixels = int(total_pixels - good_pixels)
    pct_good = round(good_pixels / total_pixels * 100, 3) if total_pixels > 0 else 0.0
    pct_bad  = round(bad_pixels  / total_pixels * 100, 3) if total_pixels > 0 else 0.0

    # Break down which flags are set across the array
    flag_counts: dict[str, int] = {}
    for bit_value, label in DQ_FLAG_NAMES.items():
        count = int(np.sum((flat & bit_value) != 0))
        if count > 0:
            flag_counts[label] = count

    # Count unique non-zero flag combinations
    unique_flags = int(np.unique(flat[flat != 0]).size)

    return {
        "available": True,
        "total_pixels": total_pixels,
        "good_pixels": good_pixels,
        "bad_pixels": bad_pixels,
        "pct_good": pct_good,
        "pct_bad": pct_bad,
        "unique_flag_combos": unique_flags,
        "flag_counts": flag_counts,
    }


@app.get("/")
async def root():
    return {"message": "FITS Image Analyzer API is running. POST to /api/analyze-fits to analyze a file."}


@app.post("/api/analyze-fits")
async def analyze_fits(file: UploadFile = File(...)):
    """
    Accept a multipart FITS file upload. Extracts:
    - SCI array: pixel value metrics + physical units
    - ERR array: per-pixel uncertainty statistics
    - DQ  array: data quality flag breakdown
    Renders a contrast-stretched PNG of the SCI array.
    """
    # ── 1. Validate extension ──────────────────────────────────────────────────
    filename = file.filename or ""
    if not (filename.lower().endswith(".fits") or filename.lower().endswith(".fts")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only .fits or .fts files are accepted.",
        )

    # ── 2. Read file into memory (no disk writes) ──────────────────────────────
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    buf = io.BytesIO(contents)

    # ── 3. Open with astropy ───────────────────────────────────────────────────
    try:
        hdul = fits.open(buf, memmap=False)
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse FITS file: {str(exc)}",
        )

    try:
        # ── 4. Locate SCI / primary image HDU ─────────────────────────────────
        sci_hdu = _find_hdu(hdul, ["SCI", "PRIMARY", "IMAGE", "COMPRESSED_IMAGE"], fallback_index=0)

        # If no named SCI, scan all HDUs for any 2D image data
        if sci_hdu is None or sci_hdu.data is None:
            for hdu in hdul:
                if hdu.data is not None and np.ndim(hdu.data) >= 2:
                    sci_hdu = hdu
                    break

        if sci_hdu is None or sci_hdu.data is None:
            raise HTTPException(
                status_code=422,
                detail="No 2D image data found in this FITS file. It may contain only table data or no pixel data.",
            )

        sci_header = sci_hdu.header
        image_data = _coerce_2d(sci_hdu.data).astype(np.float64)
        height, width = image_data.shape
        total_pixels = height * width

        # ── 5. SCI physical units (BUNIT header keyword) ───────────────────────
        bunit = str(sci_header.get("BUNIT", "DN")).strip()
        # Normalise common variants
        unit_display_map = {
            "MJY/SR": "MJy/sr",
            "MJYSR":  "MJy/sr",
            "JY":     "Jy",
            "DN/S":   "DN/s",
            "COUNTS": "DN",
            "COUNT":  "DN",
            "ADU":    "DN",
        }
        sci_unit = unit_display_map.get(bunit.upper(), bunit) or "DN"

        # Infer processing level from unit
        if sci_unit in ("MJy/sr",):
            processing_level = "Calibrated (Stage 2) — Surface Brightness"
        elif sci_unit in ("Jy",):
            processing_level = "Calibrated (Stage 2) — Spectral Flux Density"
        elif sci_unit in ("DN/s",):
            processing_level = "Calibrated (Stage 1) — Count Rate"
        else:
            processing_level = "Raw / Uncalibrated (Stage 0)"

        # ── 6. SCI numerical metrics ───────────────────────────────────────────
        valid_sci = image_data[np.isfinite(image_data)]
        max_dn = float(np.nanmax(valid_sci))
        min_dn = float(np.nanmin(valid_sci))
        mean_sci = float(np.mean(valid_sci))
        median_sci = float(np.median(valid_sci))
        std_sci = float(np.std(valid_sci))

        # Gain (common header keywords)
        gain = 1.0
        for kw in ("GAIN", "EGAIN", "HIERARCH ESO DET OUT1 GAIN"):
            if kw in sci_header:
                try:
                    gain = float(sci_header[kw])
                    break
                except (ValueError, TypeError):
                    pass

        max_photon_count = max_dn * gain

        # ── 7. ERR array ───────────────────────────────────────────────────────
        err_hdu = _find_hdu(hdul, ["ERR", "UNCERTAINTY", "SIGMA", "NOISE"])
        err_metrics: dict = {"available": False}
        if err_hdu is not None and err_hdu.data is not None:
            try:
                err_2d = _coerce_2d(err_hdu.data).astype(np.float64)
                err_metrics = _extract_err_metrics(err_2d)
            except Exception:
                pass  # ERR present but unreadable — keep available=False

        # ── 8. DQ array ────────────────────────────────────────────────────────
        dq_hdu = _find_hdu(hdul, ["DQ", "QUALITY", "FLAG", "MASK"])
        dq_metrics: dict = {"available": False}
        if dq_hdu is not None and dq_hdu.data is not None:
            try:
                dq_2d = _coerce_2d(dq_hdu.data)
                dq_metrics = _extract_dq_metrics(dq_2d, total_pixels)
            except Exception:
                pass

        # ── 9. Render SCI image (contrast-stretched) ───────────────────────────
        vmin = mean_sci - std_sci
        vmax = mean_sci + 3 * std_sci

        fig, ax = plt.subplots(figsize=(8, 8), dpi=100, facecolor="#0a0a0f")
        ax.set_facecolor("#0a0a0f")
        ax.imshow(image_data, cmap="gray", origin="lower", vmin=vmin, vmax=vmax, aspect="equal")
        ax.axis("off")
        fig.tight_layout(pad=0)

        img_buf = io.BytesIO()
        fig.savefig(img_buf, format="png", bbox_inches="tight", pad_inches=0, facecolor="#0a0a0f")
        plt.close(fig)
        img_buf.seek(0)
        image_b64 = base64.b64encode(img_buf.read()).decode("utf-8")

    finally:
        hdul.close()

    return JSONResponse(
        content={
            # ── Image ──────────────────────────────────────────
            "image_b64": image_b64,
            "width": width,
            "height": height,
            "filename": filename,
            # ── SCI array ──────────────────────────────────────
            "sci": {
                "unit": sci_unit,
                "processing_level": processing_level,
                "max": max_dn,
                "min": min_dn,
                "mean": mean_sci,
                "median": median_sci,
                "std": std_sci,
            },
            # ── Detector ───────────────────────────────────────
            "gain": gain,
            "max_photon_count": max_photon_count,
            # ── ERR array ──────────────────────────────────────
            "err": err_metrics,
            # ── DQ array ───────────────────────────────────────
            "dq": dq_metrics,
        }
    )
