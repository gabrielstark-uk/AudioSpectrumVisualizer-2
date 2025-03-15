const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class ServerProcess {
  constructor() {
    this.serverProcess = null;
    this.serverPath = path.join(app.getAppPath(), 'dist', 'index.js');
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;

    // Check if server file exists
    if (!fs.existsSync(this.serverPath)) {
      console.error('Server file not found:', this.serverPath);
      return;
    }

    // Set environment variables
    const env = { 
      ...process.env, 
      NODE_ENV: 'production',
      PORT: 3000
    };

    // Start server process
    this.serverProcess = spawn('node', [this.serverPath], {
      env,
      stdio: 'pipe'
    });

    // Handle server output
    this.serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });

    this.serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    this.serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      this.isRunning = false;
      this.serverProcess = null;
    });

    this.isRunning = true;
    console.log('Server started');
  }

  stop() {
    if (!this.isRunning || !this.serverProcess) return;

    // Kill the server process
    this.serverProcess.kill();
    this.isRunning = false;
    this.serverProcess = null;
    console.log('Server stopped');
  }
}

module.exports = ServerProcess;