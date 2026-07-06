# 🔭 AstroVision — FITS Image Analyzer

A full-stack web application for visualizing and analyzing astronomical **FITS** (Flexible Image Transport System) files. Upload any `.fits` or `.fts` file to render a contrast-stretched star field image and extract detailed numerical metrics from the **SCI**, **ERR**, and **DQ** arrays.

![AstroVision Screenshot](./docs/screenshot.png)

---

## ✨ Features

- **Drag-and-drop upload** — drop a `.fits` / `.fts` file directly onto the page
- **Star field visualization** — contrast-stretched grayscale render (`mean ± σ` stretching)
- **SCI Array metrics** — physical unit, processing level, max/min/mean/median/std
- **ERR Array metrics** — per-pixel uncertainty statistics (mean, median, min, max)
- **DQ Array metrics** — bad pixel counts, quality %, per-flag breakdown (JWST/HST standard)
- **Graceful error handling** — corrupted files and missing arrays are handled cleanly
- **Dark astronomy theme** — glassmorphism UI with nebula glow effects

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React, Tailwind CSS v4, Lucide React |
| **Backend** | FastAPI, Uvicorn, Astropy, NumPy, Matplotlib |
| **Communication** | REST (multipart file upload → JSON response) |

---

## 📁 Project Structure

```
fits_image_viewer/
├── backend/
│   ├── main.py              # FastAPI app — single POST /api/analyze-fits endpoint
│   ├── requirements.txt     # Python dependencies
│   └── start.bat            # Windows convenience launcher
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx   # Root layout, fonts, SEO metadata
    │   │   ├── page.tsx     # Main page — state machine & API calls
    │   │   └── globals.css  # Dark theme, animations, glass-card utility
    │   └── components/
    │       ├── DropZone.tsx         # Drag-and-drop upload zone
    │       ├── ImageViewer.tsx      # Base64 image display with zoom controls
    │       ├── MetricCard.tsx       # Individual metric card (glassmorphism)
    │       └── MetricsDashboard.tsx # SCI / ERR / DQ metric panels
    ├── package.json
    └── next.config.ts
```

---

## 🚀 Getting Started

You need **two terminals** running simultaneously — one for the backend, one for the frontend.

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | ≥ 3.10 | [python.org](https://python.org) |
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | Included with Node.js |

---

### Terminal 1 — Start the Backend (FastAPI)

```powershell
# Navigate to the backend folder
cd fits_image_viewer\backend

# Install Python dependencies (only needed once)
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

> **Windows shortcut:** double-click `start.bat` — it installs deps and launches the server automatically.



---

### Terminal 2 — Start the Frontend (Next.js)

```powershell
# Navigate to the frontend folder
cd fits_image_viewer\frontend

# Install Node.js dependencies (only needed once)
npm install

# Start the development server
npm run dev
```

You should see:
```
▲ Next.js 16.x.x (Turbopack)
- Local:   http://localhost:3000
✓ Ready in ~3s
```

---

### Open the App

Go to **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🖱 How to Use

1. **Open** `http://localhost:3000`
2. **Drop** a `.fits` or `.fts` file onto the upload zone, or click **"click to browse"** to pick a file
3. Wait for the spinner — the backend is processing the image in memory
4. The results appear in a two-column layout:
   - **Left:** Rendered star field image (with zoom controls)
   - **Right:** Metric dashboard with SCI / ERR / DQ sections
5. Click **"Analyze Another"** to upload a new file

---

## 📊 Metrics Explained

### SCI — Science Array (always present)
The primary pixel data of the FITS image.

| Metric | Description |
|---|---|
| **Data Unit** | Physical unit from `BUNIT` header keyword (e.g. `DN`, `MJy/sr`, `Jy`, `DN/s`) |
| **Processing Level** | Inferred from unit: Raw/Uncalibrated, Stage 1 (count rate), or Stage 2 (calibrated flux) |
| **Max / Min Value** | Brightest and darkest pixel values |
| **Mean / Std Dev** | Average intensity and spread across the image |
| **Camera Gain** | e⁻/DN ratio from `GAIN` or `EGAIN` header keyword (defaults to 1.0) |
| **Max Photon Count** | Max DN × Gain — estimated maximum detected electrons |

### ERR — Uncertainty Array (calibrated files only)
The 1σ per-pixel uncertainty, combining Poisson noise and read noise.

| Metric | Description |
|---|---|
| **Mean Error** | Average uncertainty across all pixels |
| **Median Error** | Robust central uncertainty estimate |
| **Min / Max Error** | Range of uncertainties in the array |

> Shows *"No ERR extension found"* for simple single-HDU files — this is expected.

### DQ — Data Quality Array (calibrated files only)
Integer bit-flags marking compromised pixels.

| Metric | Description |
|---|---|
| **Good Pixels** | Pixels with DQ = 0 (no flags set) |
| **Bad Pixels** | Pixels with any flag set, shown as count and % |
| **Unique Flag Combinations** | Number of distinct bit patterns across bad pixels |
| **Top Flag Types** | Per-flag breakdown using the JWST/HST standard bit table |

**Standard DQ bit flags:**

| Bit | Meaning |
|---|---|
| 1 | Do Not Use |
| 2 | Saturated |
| 4 | Jump Detected |
| 8 | Dropout |
| 64 | Cosmic Ray |
| 256 | Bad Pixel (flat) |
| 32768 | Missing Data |

> Shows *"No DQ extension found"* for single-HDU files — this is expected.

---

## 🔌 API Reference

### `POST /api/analyze-fits`

Accepts a multipart file upload and returns a JSON response.

**Request:**
```
Content-Type: multipart/form-data
Body: file=<your_file.fits>
```

**Response:**
```jsonc
{
  "image_b64": "<base64-encoded PNG>",
  "width": 2048,
  "height": 2048,
  "filename": "example.fits",

  "sci": {
    "unit": "MJy/sr",
    "processing_level": "Calibrated (Stage 2) — Surface Brightness",
    "max": 1.234e+03,
    "min": -2.1,
    "mean": 42.7,
    "median": 40.1,
    "std": 18.3
  },

  "gain": 1.5,
  "max_photon_count": 185100.0,

  "err": {
    "available": true,
    "mean_err": 0.82,
    "median_err": 0.79,
    "min_err": 0.01,
    "max_err": 12.4,
    "std_err": 0.31
  },

  "dq": {
    "available": true,
    "total_pixels": 4194304,
    "good_pixels": 4181200,
    "bad_pixels": 13104,
    "pct_good": 99.688,
    "pct_bad": 0.312,
    "unique_flag_combos": 7,
    "flag_counts": {
      "Saturated": 512,
      "Jump Detected": 12592
    }
  }
}
```

**Health check:** `GET http://localhost:8000/` → `{"message": "FITS Image Analyzer API is running..."}`

**Interactive API docs:** `http://localhost:8000/docs` (Swagger UI auto-generated by FastAPI)

---

## 🗂 FITS File Compatibility

| File Type | SCI | ERR | DQ |
|---|---|---|---|
| Amateur / raw `.fits` | ✅ Primary HDU | ❌ N/A | ❌ N/A |
| HST calibrated `_flt.fits` | ✅ `SCI` ext | ✅ `ERR` ext | ✅ `DQ` ext |
| JWST Stage 2 `_cal.fits` | ✅ `SCI` ext | ✅ `ERR` ext | ✅ `DQ` ext |
| JWST Stage 1 `_rate.fits` | ✅ `SCI` ext | ✅ `ERR` ext | ✅ `DQ` ext |

> Sample FITS files for testing can be found at the [MAST Archive](https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html) or [ESO Archive](https://archive.eso.org/).

---

## 🛠 Troubleshooting

### "Could not connect to the backend server"
The FastAPI server on port 8000 isn't running. Start it with:
```powershell
cd backend
uvicorn main:app --reload --port 8000
```

### "No 2D image data found in this FITS file"
The file contains only binary tables (e.g. a catalogue), or is a non-image FITS product. Try a different file.


### Port 8000 already in use
```powershell
# Find and kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Port 3000 already in use
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📦 Dependencies

### Backend (`requirements.txt`)
```
fastapi          # Web framework
uvicorn[standard] # ASGI server
astropy          # FITS file reading
numpy            # Numerical operations
matplotlib       # Image rendering
python-multipart # File upload support
```

### Frontend (`package.json`)
```
next             # React framework (App Router)
react / react-dom
tailwindcss      # Utility CSS
lucide-react     # Icons
typescript
```

---

## 📄 License

MIT — free to use, modify, and distribute.
