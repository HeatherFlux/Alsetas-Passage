# Alseta's Passage

A browser extension that integrates Pathbuilder2e with Discord, allowing players to share character actions, dice rolls, and information to Discord channels via webhooks.

Built with [WXT](https://wxt.dev/) for unified Chrome/Firefox development.

## Features

- Adds "Send to Discord" buttons to Pathbuilder2e interface
- Automatically sends dice rolls to Discord as they happen
- Supports multiple Discord webhooks
- Works with both main and beta versions of Pathbuilder
- Visual feedback through toast notifications

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Run in dev mode (Chrome)
npm run dev

# Run in dev mode (Firefox)
npm run dev:firefox
```

### Building

```bash
# Build for Chrome
npm run build

# Build for Firefox
npm run build:firefox

# Build both
npm run build:all

# Create distribution packages
npm run zip:all
```

### Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:run -- --coverage
```

## Project Structure

```
├── entrypoints/           # Extension entry points
│   ├── background.ts      # Service worker / background script
│   ├── content.ts         # Content script for Pathbuilder
│   └── popup/             # Popup UI
├── modules/               # Feature modules
│   ├── characterManager.ts
│   └── pageObserver.ts
├── utils/                 # Utility functions
│   ├── discord.ts         # Discord message formatting
│   ├── html.ts            # HTML manipulation
│   ├── storage.ts         # Browser storage abstraction
│   └── ui.ts              # UI components
├── assets/                # Static assets
├── public/                # Icons
└── wxt.config.ts          # WXT configuration
```

## Key Improvements over Previous Version

### No More Timestamp Parsing!

The previous version tried to parse locale-specific timestamps from Pathbuilder's dice history, requiring 267 lines of tests covering Japanese 午前, Chinese 上午, Korean 오전, German nachm., French h/m/s format, and dozens more variations.

The new approach: **just keep the timestamp**. It varies by locale/machine, but that's fine - it provides useful context in Discord messages without any parsing headaches.

### Unified Codebase

WXT handles all browser differences automatically:
- Chrome gets Manifest V3 with service workers
- Firefox gets Manifest V2 with background scripts
- The `browser` API is normalized across both

## Automated Publishing

GitHub Actions workflow publishes to stores when you push a version tag:

```bash
git tag v2.1.0
git push origin v2.1.0
```

### Required Secrets

For Chrome Web Store:
- `CHROME_EXTENSION_ID`
- `CHROME_CLIENT_ID`
- `CHROME_CLIENT_SECRET`
- `CHROME_REFRESH_TOKEN`

For Firefox Add-ons:
- `FIREFOX_JWT_ISSUER`
- `FIREFOX_JWT_SECRET`

See [WXT submit documentation](https://wxt.dev/guide/publishing.html) for details on obtaining these credentials.

## License

MIT
