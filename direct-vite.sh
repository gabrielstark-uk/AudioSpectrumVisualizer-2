#!/bin/bash

# Navigate to the client directory
cd "$(dirname "$0")/client"

# Make sure Vite is installed
if ! [ -x "$(command -v npx)" ]; then
  echo 'Error: npx is not installed.' >&2
  exit 1
fi

# Install path-browserify if not already installed
if ! [ -d "node_modules/path-browserify" ]; then
  echo "Installing path-browserify..."
  npm install --save path-browserify
fi

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Create a symbolic link to the public directory if it doesn't exist
if [ ! -d "public" ] && [ -d "../public" ]; then
  echo "Creating symbolic link to public directory..."
  ln -sf ../public public
fi

# Run Vite directly with debugging
echo "Starting Vite development server..."
VITE_DEBUG=true npx vite --debug