@echo off
REM Start Backend and Frontend Development Servers
REM This script opens two terminals to run both servers simultaneously

echo.
echo ====================================
echo  Starting Copilot Testing Services
echo ====================================
echo.

REM Start Backend in a new terminal
echo [1/2] Starting Backend Server on port 3000...
start "Copilot Backend" cmd /k "cd /d C:\Users\linar\Repos\Copilot-Testing\backend && npm run dev"

REM Wait 3 seconds before starting frontend
timeout /t 3 /nobreak

REM Start Frontend in a new terminal  
echo [2/2] Starting Frontend Dev Server...
start "Copilot Frontend" cmd /k "cd /d C:\Users\linar\Repos\Copilot-Testing\frontend && npm run dev"

echo.
echo ====================================
echo  Servers Starting
echo ====================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Close these windows to stop the servers.
echo.
