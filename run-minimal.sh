#!/bin/bash

# Navigate to the client directory
cd "$(dirname "$0")/client"

# Start a simple HTTP server
python3 -m http.server 3000