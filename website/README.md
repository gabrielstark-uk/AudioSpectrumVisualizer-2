# Audio Spectrum Visualizer - Marketing Website

This directory contains the marketing website for the Audio Spectrum Visualizer application. The website is designed to showcase the application's features, pricing plans, and provide download links for different operating systems.

## Structure

- `index.html` - Main HTML file for the website
- `styles.css` - CSS styles for the website
- `script.js` - JavaScript functionality for the website
- `assets/` - Directory for images, icons, and other assets
- `downloads/` - Directory for application downloads
- `deploy.sh` - Deployment script for the website

## Development

To work on the website locally, you can simply open the `index.html` file in your browser. For a more robust development environment, you can use a local server:

```bash
# Using Python
python -m http.server

# Using Node.js (with http-server)
npx http-server
```

## Deployment

The website is designed to be deployed to any static hosting service. The included `deploy.sh` script provides an example of deploying to AWS S3 with CloudFront.

To deploy the website:

1. Update the configuration variables in `deploy.sh` with your actual S3 bucket and CloudFront distribution ID
2. Make the script executable: `chmod +x deploy.sh`
3. Run the script: `./deploy.sh`

## Adding Downloads

When new versions of the application are released, place the installers in the `downloads/` directory with the following naming convention:

- Windows: `AudioSpectrumVisualizer-Windows.exe`
- macOS: `AudioSpectrumVisualizer-Mac.dmg`
- Linux: `AudioSpectrumVisualizer-Linux.AppImage`

## Customization

- **Colors**: The primary color scheme uses purple (#8b5cf6) and indigo (#6366f1). You can modify these in `styles.css`.
- **Content**: Update the content in `index.html` to reflect the latest features and pricing.
- **Images**: Replace placeholder images in the `assets/` directory with actual screenshots and graphics.

## SEO

The website includes basic SEO elements:

- Title tag
- Meta description
- Semantic HTML structure
- Responsive design for mobile devices

For additional SEO optimization, consider adding:

- Structured data (schema.org)
- Open Graph tags for social sharing
- XML sitemap
- Robots.txt file

## Analytics

To add analytics tracking:

1. Sign up for a service like Google Analytics
2. Add the tracking code to `index.html` before the closing `</body>` tag

## License

The website content and design are proprietary and should not be used without permission.