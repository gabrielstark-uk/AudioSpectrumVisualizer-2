#!/bin/bash

# Navigate to the client directory
cd "$(dirname "$0")/client"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing client dependencies..."
  npm install
fi

# Start the client development server
echo "Starting client development server..."
npx vite --port 3000