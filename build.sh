#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print with color
print_green() {
    echo -e "${GREEN}$1${NC}"
}

print_red() {
    echo -e "${RED}$1${NC}"
}

print_blue() {
    echo -e "${BLUE}$1${NC}"
}

# Function to check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_red "Error: $1 is required but not installed."
        exit 1
    fi
}

# Check required commands
check_command "zip"

# Function to get version from manifest
get_version() {
    local manifest_path=$1
    if [ ! -f "$manifest_path" ]; then
        print_red "Error: manifest.json not found at $manifest_path"
        exit 1
    }
    version=$(grep -o '"version": "[^"]*"' "$manifest_path" | cut -d'"' -f4)
    echo $version
}

# Clean previous builds
clean_builds() {
    print_blue "Cleaning previous builds..."
    rm -f alsetas-passage-*.zip alsetas-passage-*.xpi
    rm -rf chrome/build firefox/build
}

# Build Chrome extension
build_chrome() {
    print_blue "\nBuilding Chrome extension..."
    
    # Get Chrome version
    chrome_version=$(get_version "chrome/manifest.json")
    print_blue "Chrome version: $chrome_version"
    
    # Execute Chrome build script
    cd chrome
    if [ -f "build.sh" ]; then
        chmod +x build.sh
        ./build.sh
        if [ $? -eq 0 ]; then
            print_green "Chrome extension built successfully!"
            # Move the built package to root
            mv "alsetas-passage-v${chrome_version}.zip" ../
        else
            print_red "Chrome build failed!"
            exit 1
        fi
    else
        print_red "Chrome build.sh not found!"
        exit 1
    fi
    cd ..
}

# Build Firefox extension
build_firefox() {
    print_blue "\nBuilding Firefox extension..."
    
    # Get Firefox version
    firefox_version=$(get_version "firefox/manifest.json")
    print_blue "Firefox version: $firefox_version"
    
    # Execute Firefox build script
    cd firefox
    if [ -f "build.sh" ]; then
        chmod +x build.sh
        ./build.sh
        if [ $? -eq 0 ]; then
            print_green "Firefox extension built successfully!"
            # Move the built package to root
            mv "alsetas-passage-firefox-v${firefox_version}.xpi" ../
        else
            print_red "Firefox build failed!"
            exit 1
        fi
    else
        print_red "Firefox build.sh not found!"
        exit 1
    fi
    cd ..
}

# Main build process
main() {
    print_blue "Starting Alseta's Passage build process..."
    
    # Clean previous builds
    clean_builds
    
    # Build both extensions
    build_chrome
    build_firefox
    
    # Final success message
    print_green "\nBuild process completed successfully!"
    print_blue "\nBuilt packages:"
    ls -1 alsetas-passage-*.{zip,xpi} 2>/dev/null
}

# Run the build process
main