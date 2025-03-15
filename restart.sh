#!/bin/bash

# Kill any running instances of the app
echo "Killing any running instances of the app..."
pkill -f "node.*server/index.ts" || true
pkill -f "vite" || true

# Wait a moment for processes to terminate
sleep 2

# Start the app in development mode
echo "Starting the app with current state..."
cd "$(dirname "$0")"
npm run dev