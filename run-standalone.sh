#!/bin/bash

# Navigate to the client directory
cd "$(dirname "$0")/client"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing client dependencies..."
  npm install
fi

# Start the client development server with the standalone HTML
echo "Starting standalone client..."
npx vite serve --port 3000 standalone.html