@echo off
echo ==========================================
echo  FITS Image Viewer - Backend Server
echo ==========================================
echo.
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Starting FastAPI server on http://localhost:8000
echo.
uvicorn main:app --reload --port 8000 --host 0.0.0.0
