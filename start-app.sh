#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")"

# Kill any running instances of the app
echo "Killing any running instances of the app..."
pkill -f "node.*server/index.ts" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the server in one terminal
echo "Starting the server..."
gnome-terminal --title="Audio Spectrum Server" -- bash -c "npm run dev; read -p 'Press Enter to close...'"

# Start the client in another terminal
echo "Starting the client..."
gnome-terminal --title="Audio Spectrum Client" -- bash -c "cd client && npm run dev; read -p 'Press Enter to close...'"

echo "Application started. Check the opened terminal windows."