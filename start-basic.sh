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

# Create a temporary main.tsx file
cat > src/main-basic.tsx << 'EOL'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-basic';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOL

# Create a temporary index.html file
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
    <script type="module" src="/src/main-basic.tsx"></script>
  </body>
</html>
EOL

# Start the client with Vite
echo "Starting the basic Audio Spectrum Visualizer..."
echo "Press Ctrl+C to stop the app when done."
npx vite --port 5173 --host#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")"

# Kill any running instances of the app
echo "Killing any running instances of the app..."
pkill -f "vite" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Change to the client directory
cd client

# Create a temporary main.tsx file
cat > src/main-basic.tsx << 'EOL'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-basic';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOL

# Create a temporary index.html file
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
    <script type="module" src="/src/main-basic.tsx"></script>
  </body>
</html>
EOL

# Start the client with Vite
echo "Starting the basic Audio Spectrum Visualizer..."
echo "Press Ctrl+C to stop the app when done."
npx vite --port 5173 --host