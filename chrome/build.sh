#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print with color
print_green() {
    echo -e "${GREEN}$1${NC}"
}

print_red() {
    echo -e "${RED}$1${NC}"
}

# Version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

# Cleanup any existing build
if [ -d "build" ]; then
    print_green "Cleaning up existing build directory..."
    rm -rf build
fi

if [ -f "alsetas-passage.zip" ]; then
    print_green "Removing existing zip file..."
    rm alsetas-passage.zip
fi

# Create build directory
print_green "Creating build directory..."
mkdir -p build

# Copy all required files
print_green "Copying files to build directory..."

# Core files
files=(
    "manifest.json"
    "background.js"
    "content.js"
    "popup.html"
    "popup.css"
    "toast.css"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "build/"
        print_green "✓ Copied $file"
    else
        print_red "✗ Missing $file"
        exit 1
    fi
done

# Copy directories
directories=(
    "icons"
    "src"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        cp -r "$dir" "build/"
        print_green "✓ Copied $dir directory"
    else
        print_red "✗ Missing $dir directory"
        exit 1
    fi
done

# Create zip file
print_green "Creating extension package..."
cd build
zip -r "../alsetas-passage-v${VERSION}.zip" .
cd ..

# Verify zip was created
if [ -f "alsetas-passage-v${VERSION}.zip" ]; then
    print_green "✓ Successfully created alsetas-passage-v${VERSION}.zip"
else
    print_red "✗ Failed to create zip file"
    exit 1
fi

# Cleanup
print_green "Cleaning up build directory..."
rm -rf build

print_green "Build complete! Extension package created as alsetas-passage-v${VERSION}.zip"
print_green "Ready for Chrome Web Store submission!"