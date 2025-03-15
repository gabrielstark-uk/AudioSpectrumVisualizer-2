@echo off
REM Navigate to the project root
cd /d "%~dp0"

REM Install dependencies if needed
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)

REM Build the client first
echo Building client...
cd client
call npm run build
cd ..

REM Start the server in production mode
echo Starting server...
set NODE_ENV=production
call npm start