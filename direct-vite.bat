@echo off
REM Navigate to the client directory
cd /d "%~dp0\client"

REM Run Vite directly
echo Starting Vite development server...
npx vite