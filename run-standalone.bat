@echo off
REM Navigate to the client directory
cd /d "%~dp0\client"

REM Install dependencies if needed
if not exist "node_modules" (
  echo Installing client dependencies...
  call npm install
)

REM Start the client development server with the standalone HTML
echo Starting standalone client...
call npx vite serve --port 3000 standalone.html