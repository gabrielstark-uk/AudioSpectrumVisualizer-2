@echo off
echo Killing any running instances of the app...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting the app with current state...
npm run dev