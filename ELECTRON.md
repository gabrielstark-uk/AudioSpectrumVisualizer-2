# Audio Spectrum Visualizer - Desktop Application

This document provides instructions for building and distributing the Audio Spectrum Visualizer as a desktop application for Windows, macOS, and Linux.

## Prerequisites

- Node.js 16+ installed
- For macOS builds: macOS computer with Xcode installed
- For Windows builds: Windows computer with Visual Studio Build Tools
- For all platforms: Necessary code signing certificates (for production releases)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Prepare application icons:
   - Place a 512x512 PNG icon at `assets/icon.png` (for Linux)
   - Place a Windows icon at `assets/icon.ico`
   - Place a macOS icon at `assets/icon.icns`

## Development

To run the application in development mode:

```
npm run electron:dev
```

This will start both the Vite development server and Electron, with hot reloading enabled.

## Building for Distribution

### Building for All Platforms

```
npm run electron:build:all
```

### Building for Specific Platforms

- Windows: `npm run electron:build:win`
- macOS: `npm run electron:build:mac`
- Linux: `npm run electron:build:linux`

The built applications will be available in the `release` directory.

## Distribution Formats

- Windows: NSIS installer (.exe) and portable (.exe)
- macOS: DMG (.dmg) and ZIP (.zip)
- Linux: AppImage (.AppImage), Debian package (.deb), and RPM package (.rpm)

## Code Signing

For production releases, you should sign your application:

### Windows Code Signing

1. Obtain a code signing certificate
2. Add the following to your `electron-builder.yml`:
   ```yaml
   win:
     certificateFile: path/to/certificate.pfx
     certificatePassword: YOUR_PASSWORD
   ```

### macOS Code Signing

1. Obtain an Apple Developer ID
2. Add the following to your `electron-builder.yml`:
   ```yaml
   mac:
     identity: Developer ID Application: Your Name (TEAM_ID)
   ```

## Auto Updates

This application is configured to support auto-updates via GitHub releases. When you publish a new version:

1. Update the version in `package.json`
2. Build the application
3. Create a new GitHub release with the built files
4. Users will be automatically notified of the update

## Troubleshooting

- **Missing dependencies**: Run `npm install` to ensure all dependencies are installed
- **Build errors**: Check that you have the necessary build tools installed for your platform
- **Code signing errors**: Verify your certificates and identities are correctly configured
- **Icon issues**: Ensure your icons are in the correct format and location

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder Documentation](https://www.electron.build/)
- [Code Signing Guide](https://www.electron.build/code-signing)