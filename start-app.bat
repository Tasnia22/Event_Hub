@echo off
title Event Management App - Launcher
color 0A

echo ==========================================
echo   EVENT MANAGEMENT APP - STARTING UP...
echo ==========================================
echo.

REM Add Node.js to PATH for this session
set PATH=C:\Program Files\nodejs;%PATH%

echo [1/2] Starting Backend Server (Port 5000)...
start "Backend - Event Management" cmd /k "cd /d F:\Event_Management\backend && set PATH=C:\Program Files\nodejs;%PATH% && node server.js"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend Dev Server (Port 5173)...
start "Frontend - Event Management" cmd /k "cd /d F:\Event_Management\frontend && set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo   APP IS RUNNING!
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ==========================================
echo.
echo Opening browser...
start http://localhost:5173

echo.
echo You can close this window. The two server
echo windows (Backend ^& Frontend) must stay open.
echo.
pause
