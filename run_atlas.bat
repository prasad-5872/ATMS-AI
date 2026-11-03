@echo off
title ATLAS Traffic Control Management System (ITMS)
color 0b
echo ==============================================================
echo   ATLAS: Adaptive Traffic Control Management System (ITMS)
echo   Starting Control Room Interface...
echo ==============================================================
echo.

cd /d "%~dp0"

echo [1/2] Opening ATLAS Control Center in browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000/

echo [2/2] Launching live simulation server...
echo.
echo Press Ctrl+C in this window anytime to stop the server.
echo ==============================================================
npm run dev

pause
