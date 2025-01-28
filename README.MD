# Alseta's Passage: A Pathbuilder Discord Bot

A Chrome/Firefox extension that creates a seamless integration between Pathbuilder2e and Discord, allowing players to easily share their character actions, rolls, and information in Discord channels.

## Features

- Adds "Send to Discord" buttons to Pathbuilder2e interface
- Captures and formats dice rolls and character actions
- Supports multiple Discord webhooks
- Works with both main and beta versions of Pathbuilder
- Provides visual feedback through toast notifications
- Maintains character context in messages

## Project Structure

```
.
├── chrome/                 # Chrome extension implementation
│   ├── manifest.json      # Extension manifest
│   ├── background.js      # Background service worker
│   ├── content.js         # Content script
│   ├── popup.html        # Extension popup interface
│   ├── popup.css         # Popup styles
│   ├── toast.css         # Toast notification styles
│   ├── build.sh          # Build script
│   ├── icons/            # Extension icons
│   └── src/              # Source code
│       ├── utils/        # Utility functions
│       │   ├── htmlUtils.js    # HTML manipulation utilities
│       │   ├── discordUtils.js # Discord message formatting
│       │   └── uiUtils.js      # UI components and notifications
│       └── modules/      # Feature modules
│           ├── characterManager.js # Character data management
│           ├── discordManager.js   # Discord communication
│           └── pageObserver.js     # Dynamic content handling
├── firefox/              # Firefox extension implementation
└── README.md            # This file

```

## Development

### Prerequisites

- Chrome browser for testing
- Discord webhook URL(s) for testing
- Access to pathbuilder2e.com

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/alsetas-passage.git
cd alsetas-passage
```

2. Load the extension in Chrome:
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode" in the top right
- Click "Load unpacked" and select the `chrome` directory

3. Test the extension:
- Visit pathbuilder2e.com
- Open the extension popup and add your Discord webhook
- Try the "Send to Discord" buttons on various elements

### Code Organization

The extension uses a modular architecture with ES modules:

#### Utils
- **htmlUtils.js**: HTML manipulation and sanitization functions
- **discordUtils.js**: Discord message formatting and webhook handling
- **uiUtils.js**: UI components and toast notifications

#### Modules
- **characterManager.js**: Manages character data extraction and tracking
- **discordManager.js**: Handles Discord webhook communication
- **pageObserver.js**: Manages dynamic content and page observations

#### Main Files
- **content.js**: Main content script that initializes the extension
- **background.js**: Background service worker for webhook handling
- **popup.html/css**: Extension popup interface

### Making Changes

1. Edit the relevant files in the `src` directory
2. Test changes locally using the loaded unpacked extension
3. Use the browser's developer tools to debug:
   - Content script console logs are visible in the page's console
   - Background script logs are visible in the extension's developer tools

## Building for Release

### Build Process

The extension uses a simple build script that maintains code transparency for the Chrome Web Store review process.

1. Navigate to the chrome directory:
```bash
cd chrome
```

2. Run the build script:
```bash
./build.sh
```

The script will:
- Create a clean build directory
- Copy all required files
- Create a versioned zip file (e.g., alsetas-passage-v1.1.0.zip)
- Clean up temporary files

### Chrome Web Store Submission

1. Build the extension as described above
2. Visit the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Upload the generated zip file
4. Fill in store listing information
5. Submit for review

## Code Overview

### Content Script Flow

1. **Initialization**:
   - Injects required CSS assets
   - Sets up enhanced console logging
   - Initializes page observers

2. **Dynamic Content Handling**:
   - Observes DOM changes for new elements
   - Adds "Send to Discord" buttons to relevant elements
   - Manages event listeners to prevent duplicates

3. **Character Data Management**:
   - Tracks character name and dice roll context
   - Extracts character stats and information
   - Maintains state for proper message formatting

4. **Discord Integration**:
   - Formats messages for Discord
   - Handles webhook communication
   - Provides feedback through toast notifications

### Message Flow

1. User triggers action (click or roll)
2. Content script captures and formats data
3. Background script receives message
4. Discord webhook receives formatted message
5. User gets visual feedback via toast

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

This project is licensed under the terms of the LICENSE file included in the repository.