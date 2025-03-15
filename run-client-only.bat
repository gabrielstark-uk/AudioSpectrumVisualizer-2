@echo off
REM Navigate to the client directory
cd /d "%~dp0\client"

REM Install dependencies if needed
if not exist "node_modules" (
  echo Installing client dependencies...
  call npm install
)

REM Start the client development server
echo Starting client development server...
call npx vite --port 3000