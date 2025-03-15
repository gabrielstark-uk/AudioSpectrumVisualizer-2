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

# Start the app in development mode
echo "Starting the Audio Spectrum Visualizer app..."
echo "Press Ctrl+C to stop the app when done."
echo "Once the server is running, open your browser to: http://localhost:5173"

# Run the app
npm run dev