#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const rootDir = __dirname;
const packageJsonPath = path.join(rootDir, 'package.json');
const electronPackageJsonPath = path.join(rootDir, 'package.electron.json');

// Function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Create necessary directories
ensureDirectoryExists(path.join(rootDir, 'assets'));
ensureDirectoryExists(path.join(rootDir, 'build'));
ensureDirectoryExists(path.join(rootDir, 'electron'));
ensureDirectoryExists(path.join(rootDir, 'release'));

// Replace package.json with electron version
console.log('Updating package.json for Electron...');
if (fs.existsSync(electronPackageJsonPath)) {
  const electronPackageJson = fs.readFileSync(electronPackageJsonPath, 'utf8');
  fs.writeFileSync(packageJsonPath, electronPackageJson);
  console.log('package.json updated successfully');
} else {
  console.error('package.electron.json not found!');
  process.exit(1);
}

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Failed to install dependencies:', error);
  process.exit(1);
}

console.log('\nElectron setup complete!');
console.log('\nNext steps:');
console.log('1. Add application icons to the assets directory');
console.log('2. Run "npm run electron:dev" to start development');
console.log('3. Run "npm run electron:build:all" to build for all platforms');
console.log('\nSee ELECTRON.md for more details');