#!/bin/bash

# Logo Processing Script for Dumu Waks
# Creates transparent, scalable logo versions
# Requires: ImageMagick, and optionally potrace for SVG conversion

LOGO_SOURCE="../LOGO.jpg"
PUBLIC_DIR="./public"
IMAGES_DIR="$PUBLIC_DIR/images"
FAVICONS_DIR="$PUBLIC_DIR/favicons"

# Colors to remove (white/light backgrounds)
# Adjust fuzz value (0-100) for more/less aggressive background removal
FUZZ_VALUE=15

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed."
    echo "Please install it first:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    echo "  Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

echo "🎨 Processing logo for Dumu Waks with transparency..."
echo ""

# Create directories if they don't exist
mkdir -p "$IMAGES_DIR"
mkdir -p "$FAVICONS_DIR"

# Copy original logo
echo "📁 Copying original logo..."
cp "$LOGO_SOURCE" "$IMAGES_DIR/logo.jpg"

# Create transparent versions
echo "✨ Creating transparent PNG versions..."

# Function to create transparent logo at specific size
create_transparent_logo() {
    local size=$1
    local output=$2
    local description=$3

    echo "  → $description ($size px)"

    # Remove white/light background and make transparent
    convert "$LOGO_SOURCE" \
        -fuzz ${FUZZ_VALUE}% \
        -transparent white \
        -trim \
        +repage \
        -resize ${size}x${size}\> \
        -gravity center \
        -background none \
        -extent ${size}x${size} \
        "$output"
}

# Full size logo (transparent, keep aspect ratio)
create_transparent_logo 500 "$IMAGES_DIR/logo-full.png" "Full size logo"

# Medium logo for headers
create_transparent_logo 200 "$IMAGES_DIR/logo-medium.png" "Medium logo (navbar/footer)"

# Small logo for mobile
create_transparent_logo 120 "$IMAGES_DIR/logo-small.png" "Small logo (mobile)"

# Square logo for social media (transparent)
echo "  → Square logo for social media (512x512 px)"
convert "$LOGO_SOURCE" \
    -fuzz ${FUZZ_VALUE}% \
    -transparent white \
    -trim \
    +repage \
    -resize 512x512^ \
    -gravity center \
    -background none \
    -extent 512x512 \
    "$IMAGES_DIR/logo-square.png"

# Loading screen logo (larger, transparent)
create_transparent_logo 300 "$IMAGES_DIR/logo-loading.png" "Loading screen logo"

# Try to create SVG (scalable vector) if potrace is available
echo ""
echo "🔄 Attempting SVG conversion..."
echo "  ⚠️  Note: Automated SVG conversion often creates all-black silhouettes"
echo "  ⚠️  For best results, manually convert using Illustrator/Inkscape or online tools"
echo ""

if command -v potrace &> /dev/null; then
    echo "  ℹ️  potrace found but SKIPPING automated conversion"
    echo "  ℹ️  Reason: Simple black/white tracing doesn't preserve logo details"
    echo ""
    echo "  📝 For professional SVG, use one of these methods:"
    echo "     1. Vectorizer.ai (https://vectorizer.ai) - AI-powered, best quality"
    echo "     2. Adobe Illustrator - Image Trace feature"
    echo "     3. Inkscape - Path > Trace Bitmap"
    echo "     4. Vector Magic (https://vectormagic.com) - Professional results"
    echo ""
    echo "  💡 After creating SVG, save it as: $IMAGES_DIR/logo.svg"
else
    echo "  ⚠ potrace not found - SVG conversion skipped"
    echo ""
    echo "  📝 To create professional SVG manually:"
    echo "     1. Visit https://vectorizer.ai and upload LOGO.jpg"
    echo "     2. Download the SVG result"
    echo "     3. Save as: $IMAGES_DIR/logo.svg"
    echo ""
    echo "  Alternative tools:"
    echo "     - Vector Magic: https://vectormagic.com"
    echo "     - Convertio: https://convertio.co/jpg-svg/"
    echo "     - Adobe Illustrator (Image Trace)"
    echo "     - Inkscape (Path > Trace Bitmap)"
fi

echo ""

# Favicon sizes (with transparency)
echo "🎯 Creating favicons with transparency..."

# Function to create transparent favicon at specific size
create_transparent_favicon() {
    local size=$1
    local output=$2

    convert "$LOGO_SOURCE" \
        -fuzz ${FUZZ_VALUE}% \
        -transparent white \
        -trim \
        +repage \
        -resize ${size}x${size}^ \
        -gravity center \
        -background none \
        -extent ${size}x${size} \
        "$output"
}

# PNG favicons for modern browsers
echo "  → PNG favicons (16x16, 32x32, 96x96)"
create_transparent_favicon 16 "$FAVICONS_DIR/favicon-16x16.png"
create_transparent_favicon 32 "$FAVICONS_DIR/favicon-32x32.png"
create_transparent_favicon 96 "$FAVICONS_DIR/favicon-96x96.png"

# Standard favicon.ico (multi-size)
echo "  → favicon.ico (16x16, 32x32, 48x48)"
create_transparent_favicon 48 "$FAVICONS_DIR/favicon-48x48.png"
convert "$FAVICONS_DIR/favicon-16x16.png" \
        "$FAVICONS_DIR/favicon-32x32.png" \
        "$FAVICONS_DIR/favicon-48x48.png" \
        "$PUBLIC_DIR/favicon.ico"
rm "$FAVICONS_DIR/favicon-48x48.png"

# Apple Touch Icons (with slight padding for better appearance)
echo "  → Apple Touch Icons"
convert "$LOGO_SOURCE" \
    -fuzz ${FUZZ_VALUE}% \
    -transparent white \
    -trim \
    +repage \
    -resize 160x160\> \
    -gravity center \
    -background none \
    -extent 180x180 \
    "$FAVICONS_DIR/apple-touch-icon.png"

convert "$LOGO_SOURCE" \
    -fuzz ${FUZZ_VALUE}% \
    -transparent white \
    -trim \
    +repage \
    -resize 136x136\> \
    -gravity center \
    -background none \
    -extent 152x152 \
    "$FAVICONS_DIR/apple-touch-icon-152x152.png"

convert "$LOGO_SOURCE" \
    -fuzz ${FUZZ_VALUE}% \
    -transparent white \
    -trim \
    +repage \
    -resize 149x149\> \
    -gravity center \
    -background none \
    -extent 167x167 \
    "$FAVICONS_DIR/apple-touch-icon-167x167.png"

# Android Chrome icons (transparent)
echo "  → Android Chrome icons"
create_transparent_favicon 192 "$FAVICONS_DIR/android-chrome-192x192.png"
create_transparent_favicon 512 "$FAVICONS_DIR/android-chrome-512x512.png"

# Microsoft tile (transparent)
echo "  → Microsoft tile"
create_transparent_favicon 144 "$FAVICONS_DIR/mstile-144x144.png"

echo ""
echo "✅ Logo processing complete!"
echo ""
echo "📦 Generated files:"
echo "  ├── Logo variants (transparent PNG): $IMAGES_DIR/"
echo "  │   ├── logo-full.png (500x500)"
echo "  │   ├── logo-medium.png (200x200)"
echo "  │   ├── logo-small.png (120x120)"
echo "  │   ├── logo-square.png (512x512)"
echo "  │   └── logo-loading.png (300x300)"
if [ -f "$IMAGES_DIR/logo.svg" ]; then
echo "  │   └── logo.svg (scalable vector)"
fi
echo "  ├── Favicons: $FAVICONS_DIR/"
echo "  │   └── Multiple sizes for all devices"
echo "  └── Main favicon: $PUBLIC_DIR/favicon.ico"
echo ""
echo "💡 Tips:"
echo "  - All PNGs have transparent backgrounds"
echo "  - Adjust FUZZ_VALUE in script if background removal is too aggressive/weak"
echo "  - For best results, manually create SVG using vector graphics software"
echo ""
echo "🚀 Next steps:"
echo "  1. Verify logos look good with transparency"
echo "  2. Start the dev server: npm run dev"
echo "  3. Check browser console for any image loading errors"
echo "  4. Test on light and dark backgrounds"
