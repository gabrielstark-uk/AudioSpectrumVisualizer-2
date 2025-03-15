@echo off
REM Navigate to the client directory
cd /d "%~dp0\client"

REM Start a simple HTTP server
python -m http.server 3000