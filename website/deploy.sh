#!/bin/bash

# Deployment script for Audio Spectrum Visualizer website

# Configuration
WEBSITE_DIR="$(pwd)"
OUTPUT_DIR="$WEBSITE_DIR/dist"
S3_BUCKET="audiospectrum-website"  # Replace with your actual S3 bucket name
CLOUDFRONT_DISTRIBUTION_ID="E1ABCDEFGHIJKL"  # Replace with your actual CloudFront distribution ID

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Copy website files to output directory
echo "Copying website files to output directory..."
cp -r "$WEBSITE_DIR/index.html" "$WEBSITE_DIR/styles.css" "$WEBSITE_DIR/script.js" "$OUTPUT_DIR/"

# Create downloads directory
mkdir -p "$OUTPUT_DIR/downloads"
mkdir -p "$OUTPUT_DIR/assets"

# Copy assets (in a real scenario, you would have actual assets)
echo "Copying assets..."
echo "Note: In a real deployment, you would copy actual assets here."

# Minify CSS and JS (requires minify tool)
if command -v minify &> /dev/null; then
    echo "Minifying CSS and JS files..."
    minify "$OUTPUT_DIR/styles.css" > "$OUTPUT_DIR/styles.min.css"
    minify "$OUTPUT_DIR/script.js" > "$OUTPUT_DIR/script.min.js"
    
    # Replace references in HTML
    sed -i 's/styles.css/styles.min.css/g' "$OUTPUT_DIR/index.html"
    sed -i 's/script.js/script.min.js/g' "$OUTPUT_DIR/index.html"
    
    # Remove original files
    rm "$OUTPUT_DIR/styles.css" "$OUTPUT_DIR/script.js"
else
    echo "Warning: 'minify' command not found. Skipping minification."
fi

# Deploy to S3 (requires AWS CLI)
if command -v aws &> /dev/null; then
    echo "Deploying to S3 bucket: $S3_BUCKET"
    aws s3 sync "$OUTPUT_DIR" "s3://$S3_BUCKET" --delete
    
    # Invalidate CloudFront cache
    echo "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*"
    
    echo "Deployment complete!"
else
    echo "Warning: AWS CLI not found. Skipping deployment to S3."
    echo "To deploy manually, upload the contents of the '$OUTPUT_DIR' directory to your web server."
fi

echo "Website files prepared in: $OUTPUT_DIR"