# Audio Spectrum Visualizer - Desktop Application Setup

This guide will help you set up the Audio Spectrum Visualizer as a desktop application for Windows, macOS, and Linux using Electron.

## Quick Start

1. Run the preparation script:
   ```
   node prepare-electron.js
   ```

2. Add application icons to the `assets` directory:
   - `icon.png` (512x512 PNG for Linux)
   - `icon.ico` (for Windows)
   - `icon.icns` (for macOS)

3. Start the development environment:
   ```
   npm run electron:dev
   ```

4. Build the application for distribution:
   ```
   npm run electron:build:all
   ```

## Detailed Instructions

For detailed instructions on building, signing, and distributing the application, please refer to the [ELECTRON.md](ELECTRON.md) file.

## Features

The desktop application includes all features of the web version, plus:

- Native desktop experience
- Offline functionality
- Improved performance for audio processing
- System-level integration
- Automatic updates

## System Requirements

- Windows 10/11 (64-bit)
- macOS 10.13 or later
- Linux: Ubuntu 18.04+, Fedora 30+, or equivalent

## Support

For issues related to the desktop application, please file an issue on the GitHub repository.