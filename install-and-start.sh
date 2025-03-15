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

# Install dependencies
echo "Installing dependencies..."
npm install

# Install additional dependencies
echo "Installing additional dependencies..."
npm install --save @radix-ui/react-toast class-variance-authority clsx lucide-react tailwind-merge wouter @tanstack/react-query
npm install --save-dev tailwindcss postcss autoprefixer @types/node

# Create tailwind.config.js if it doesn't exist
if [ ! -f "tailwind.config.js" ]; then
  echo "Creating tailwind.config.js..."
  npx tailwindcss init -p
fi

# Start the client with Vite
echo "Starting the Audio Spectrum Visualizer..."
echo "Press Ctrl+C to stop the app when done."
npm run dev#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")"

# Kill any running instances of the app
echo "Killing any running instances of the app..."
pkill -f "vite" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Change to the client directory
cd client

# Install dependencies
echo "Installing dependencies..."
npm install

# Install additional dependencies
echo "Installing additional dependencies..."
npm install --save @radix-ui/react-toast class-variance-authority clsx lucide-react tailwind-merge wouter @tanstack/react-query
npm install --save-dev tailwindcss postcss autoprefixer @types/node

# Create tailwind.config.js if it doesn't exist
if [ ! -f "tailwind.config.js" ]; then
  echo "Creating tailwind.config.js..."
  npx tailwindcss init -p
fi

# Start the client with Vite
echo "Starting the Audio Spectrum Visualizer..."
echo "Press Ctrl+C to stop the app when done."
npm run dev