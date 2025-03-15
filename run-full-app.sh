#!/bin/bash

# Navigate to the project root
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the client first
echo "Building client..."
cd client
npm run build
cd ..

# Start the server in production mode
echo "Starting server..."
NODE_ENV=production npm start