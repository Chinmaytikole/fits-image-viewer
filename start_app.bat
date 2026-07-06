@echo off
title AstroVision Launcher

echo.
echo  ==========================================
echo   AstroVision - Starting Both Servers
echo  ==========================================
echo.

:: Backend window
echo  [1/2] Launching Backend  (http://localhost:8000) ...
start "AstroVision Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate 2>nul && uvicorn main:app --reload --port 8000"

:: Small pause so the two windows don't open on top of each other
timeout /t 1 /nobreak >nul

:: Frontend window
echo  [2/2] Launching Frontend (http://localhost:3000) ...
start "AstroVision Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  Both servers are starting in their own windows.
echo  Open http://localhost:3000 once both are ready.
echo.
pause
