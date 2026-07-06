@echo off
title AstroVision Install
color 0E

echo.
echo  ==========================================
echo   AstroVision - Installing Dependencies
echo  ==========================================
echo.

:: ---------- BACKEND ----------
echo  [BACKEND] Setting up Python environment...
echo.

cd /d "%~dp0backend"

if not exist "venv\" (
    echo  [*] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 goto err_venv
    echo  [+] Virtual environment created.
) else (
    echo  [*] Virtual environment already exists, skipping.
)

echo  [*] Activating virtual environment...
call venv\Scripts\activate.bat

echo  [*] Installing Python packages...
pip install -r requirements.txt
if errorlevel 1 goto err_pip
echo  [+] Backend packages installed.

:: ---------- FRONTEND ----------
echo.
echo  ------------------------------------------
echo  [FRONTEND] Installing Node.js packages...
echo.

cd /d "%~dp0frontend"

npm install
if errorlevel 1 goto err_npm
echo  [+] Frontend packages installed.

:: ---------- DONE ----------
echo.
echo  ==========================================
echo   All done! Double-click start_app.bat
echo   to launch both servers.
echo  ==========================================
echo.
goto end

:err_venv
echo.
echo  [ERROR] Could not create virtual environment.
echo          Check that Python 3.10+ is installed and on your PATH.
echo          Test: python --version
goto end

:err_pip
echo.
echo  [ERROR] pip install failed.
echo          See the error messages above for details.
goto end

:err_npm
echo.
echo  [ERROR] npm install failed.
echo          Check that Node.js 18+ is installed and on your PATH.
echo          Test: node --version
goto end

:end
echo.
echo  You can close this window now.
cmd /k
