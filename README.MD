# Alseta's Passage: A Pathbuilder Discord Bot

A browser extension that creates a seamless integration between Pathbuilder2e and Discord, allowing players to easily share their character actions, rolls, and information in Discord channels.

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
├── build.sh              # Main build script for all extensions
├── chrome/              # Chrome extension implementation
│   ├── manifest.json    # Extension manifest
│   ├── background.js    # Background service worker
│   ├── content.js       # Content script
│   ├── build.sh        # Chrome-specific build script
│   └── src/            # Source code
│       ├── utils/      # Utility functions
│       └── modules/    # Feature modules
├── firefox/            # Firefox extension implementation
│   ├── manifest.json   # Extension manifest
│   ├── background.js   # Background script
│   ├── content.js      # Content script
│   ├── build.sh       # Firefox-specific build script
│   └── src/           # Source code
│       ├── utils/     # Utility functions
│       └── modules/   # Feature modules
└── test/              # Test suite
    ├── fixtures/      # Test HTML fixtures
    ├── unit/         # Unit tests
    └── integration/  # Integration tests
```

## Development

### Prerequisites

- Node.js and npm for testing
- Chrome and Firefox browsers for development
- Discord webhook URL(s) for testing
- `zip` command-line utility for building packages

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/alsetas-passage.git
cd alsetas-passage
```

2. Load the extension in Chrome:
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select the `chrome` directory

3. Load the extension in Firefox:
- Open Firefox and navigate to `about:debugging`
- Click "This Firefox"
- Click "Load Temporary Add-on" and select any file in the `firefox` directory

### Building Extensions

To build both Chrome and Firefox extensions:

```bash
./build.sh
```

This will:
- Clean previous builds
- Build Chrome extension (.zip)
- Build Firefox extension (.xpi)
- Place built packages in the root directory

To build individual extensions:

```bash
# For Chrome
cd chrome
./build.sh

# For Firefox
cd firefox
./build.sh
```

### Testing

The project includes a comprehensive test suite. See [TESTING.md](TESTING.md) for detailed testing documentation and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the testing roadmap.

To run tests:

```bash
# Install test dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
```

## Browser Store Submissions

### Chrome Web Store

1. Build the extension:
```bash
./build.sh
```

2. Submit `alsetas-passage-v{version}.zip` to the Chrome Web Store

### Firefox Add-ons

1. Build the extension:
```bash
./build.sh
```

2. Submit `alsetas-passage-firefox-v{version}.xpi` to Firefox Add-ons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

This project is licensed under the terms of the LICENSE file included in the repository.

## Support

For bug reports and feature requests, please:
1. Check the existing issues
2. Join our Discord server: https://discord.gg/jWEEqX8qkc
3. Create a new issue with detailed information