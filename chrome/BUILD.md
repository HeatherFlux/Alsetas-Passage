# Building Alseta's Passage Chrome Extension

## Overview
This document outlines the build process for creating a Chrome extension package that can be submitted to the Chrome Web Store.

## Directory Structure
```
chrome/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.css
├── toast.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon512.png
└── src/
    ├── utils/
    │   ├── htmlUtils.js
    │   ├── discordUtils.js
    │   └── uiUtils.js
    └── modules/
        ├── characterManager.js
        ├── discordManager.js
        └── pageObserver.js
```

## Build Process

### Manual Build Steps
1. Create a new directory called `build`
2. Copy all required files maintaining the directory structure:
   - manifest.json
   - background.js
   - content.js
   - popup.html
   - popup.css
   - toast.css
   - icons/ directory
   - src/ directory
3. Create a zip file of the build directory
4. The zip file can then be submitted to the Chrome Web Store

### Automated Build Script
We can create a simple shell script `build.sh` that automates this process:

```bash
#!/bin/bash

# Create clean build directory
rm -rf build
mkdir -p build

# Copy all required files
cp manifest.json build/
cp background.js build/
cp content.js build/
cp popup.html build/
cp popup.css build/
cp toast.css build/
cp -r icons build/
cp -r src build/

# Create zip file
cd build
zip -r ../alsetas-passage.zip .
cd ..

# Clean up
rm -rf build

echo "Build complete! Extension package created as alsetas-passage.zip"
```

## Why This Approach?
1. **Simplicity**: Keeps the build process straightforward and transparent
2. **Chrome Extension Compatibility**: Maintains direct file references which is important for Chrome extension review
3. **ES Module Support**: Works with Chrome's native ES module support in Manifest V3
4. **Easy to Debug**: Source files remain unminified and easily inspectable
5. **Review Process**: Makes the Chrome Web Store review process smoother as code is not obfuscated or bundled

## Submission Process
1. Run the build script to create the zip file
2. Log into the Chrome Web Store Developer Dashboard
3. Upload the generated zip file
4. Fill in required store listing information
5. Submit for review

## Development Tips
- Keep the source files organized in the src/ directory
- Use clear, descriptive file names
- Maintain proper documentation
- Test the extension thoroughly before submission
- Keep a changelog for version updates

## Future Improvements
- Add version number updating
- Add automatic manifest version incrementing
- Add validation checks before building
- Add source code linting
- Add automatic testing before build