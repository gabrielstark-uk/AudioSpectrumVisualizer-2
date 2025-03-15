#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")"

# Kill any running instances of the app
echo "Killing any running instances of the app..."
if command -v pkill &> /dev/null; then
  pkill -f "node.*server/index.ts" 2>/dev/null || true
  pkill -f "vite" 2>/dev/null || true
elif command -v taskkill &> /dev/null; then
  taskkill /f /im node.exe 2>nul || true
fi

# Wait a moment for processes to terminate
sleep 2 2>/dev/null || timeout /t 2 /nobreak >nul 2>&1

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the app in development mode
echo "Starting the app with current state..."
echo "Press Ctrl+C to stop the app when done."
npm run dev