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

# Create a temporary vite.config.js
cat > vite.config.js << 'EOL'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
EOL

# Create a temporary index.html
cat > index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Audio Spectrum Visualizer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main-simple.tsx"></script>
  </body>
</html>
EOL

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing client dependencies..."
  npm install react react-dom @vitejs/plugin-react vite
fi

# Start the client with Vite
echo "Starting the simplified Audio Spectrum Visualizer..."
echo "Press Ctrl+C to stop the app when done."
npx vite --port 5173 --host