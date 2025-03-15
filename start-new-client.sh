#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")"

# Kill any running instances of the app
echo "Killing any running instances of the app..."
pkill -f "vite" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Change to the new client directory
cd client-new

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing client dependencies..."
  npm install
fi

# Start the client with Vite
echo "Starting the Audio Spectrum Visualizer..."
echo "Press Ctrl+C to stop the app when done."
npx vite --port 5173 --host