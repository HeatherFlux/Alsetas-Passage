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
check_command "node"

# Function to get version from manifest
get_version() {
    local manifest_path=$1
    if [ ! -f "$manifest_path" ]; then
        print_red "Error: manifest.json not found at $manifest_path"
        exit 1
    fi
    version=$(grep -o '"version": "[^"]*"' "$manifest_path" | cut -d'"' -f4)
    echo $version
}
    

# Clean previous builds
clean_builds() {
    print_blue "Cleaning previous builds..."
    rm -f alsetas-passage-*.zip alsetas-passage-*.xpi
    rm -rf chrome/build firefox/build
}

# Update build info with current timestamp and hash
update_build_info() {
    local target=$1
    print_blue "Updating build info for $target..."
    node updateBuildInfo.js $target
    if [ $? -ne 0 ]; then
        print_red "Failed to update build info for $target"
        exit 1
    fi
}

# Function to create extension package
create_package() {
    local type=$1
    local version=$2
    local build_dir="$type/build"
    
    # Create build directory
    mkdir -p "$build_dir"
    
    # Copy necessary files
    print_blue "Copying files to build directory..."
    cp "$type/manifest.json" "$build_dir/"
    cp "$type/background.js" "$build_dir/"
    cp "$type/content.bundle.js" "$build_dir/"
    cp "$type/popup.html" "$build_dir/"
    cp "$type/popup.css" "$build_dir/"
    cp "$type/toast.css" "$build_dir/"
    cp -r "$type/icons" "$build_dir/"
    
    # Create package based on type
    if [ "$type" = "chrome" ]; then
        cd "$build_dir"
        zip -r "../../alsetas-passage-v${version}.zip" ./*
        cd ../..
        print_green "✓ Successfully created alsetas-passage-v${version}.zip"
    else
        cd "$build_dir"
        zip -r "../../alsetas-passage-firefox-v${version}.xpi" ./*
        cd ../..
        print_green "✓ Successfully created alsetas-passage-firefox-v${version}.xpi"
    fi
    
    # Clean up build directory
    rm -rf "$build_dir"
}

# Function to create source package with code and XPI
create_source_package() {
    local firefox_version=$1
    print_blue "\nCreating Firefox source package..."
    
    # Create zip with source code and XPI
    zip -r "alsetas-passage-firefox-source-v${firefox_version}.zip" firefox "alsetas-passage-firefox-v${firefox_version}.xpi"
    
    if [ $? -eq 0 ]; then
        print_green "✓ Successfully created alsetas-passage-firefox-source-v${firefox_version}.zip"
    else
        print_red "Failed to create source package!"
    fi
}

# Build Chrome extension
build_chrome() {
    print_blue "\nBuilding Chrome extension..."
    
    # Get Chrome version
    chrome_version=$(get_version "chrome/manifest.json")
    print_blue "Chrome version: $chrome_version"
    
    # Update build info
    update_build_info "chrome"
    
    # Bundle with webpack
    npx webpack --config webpack.config.js --env target=chrome
    if [ $? -eq 0 ]; then
        print_green "Chrome bundle created successfully!"
        create_package "chrome" "$chrome_version"
    else
        print_red "Chrome webpack build failed!"
        exit 1
    fi
}

# Build Firefox extension
build_firefox() {
    print_blue "\nBuilding Firefox extension..."
    
    # Get Firefox version
    firefox_version=$(get_version "firefox/manifest.json")
    print_blue "Firefox version: $firefox_version"
    
    # Update build info
    update_build_info "firefox"
    
    # Bundle with webpack
    npx webpack --config webpack.config.js --env target=firefox
    if [ $? -eq 0 ]; then
        print_green "Firefox bundle created successfully!"
        create_package "firefox" "$firefox_version"
        
        # Create source package after Firefox build
        create_source_package "$firefox_version"
    else
        print_red "Firefox webpack build failed!"
        exit 1
    fi
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