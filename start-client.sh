#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")"

# Kill any running instances of the app
echo "Killing any running instances of the app..."
pkill -f "vite" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Change to the client directory
cd client

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing client dependencies..."
  npm install
fi

# Start the client with Vite
echo "Starting the client with Vite..."
echo "Press Ctrl+C to stop the app when done."
npx vite --port 5173 --host