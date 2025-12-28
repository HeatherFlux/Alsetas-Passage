# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alseta's Passage is a browser extension that integrates Pathbuilder2e with Discord, allowing players to share character actions, dice rolls, and information to Discord channels via webhooks.

Built with [WXT](https://wxt.dev/) - one TypeScript codebase compiles to Chrome (MV3) and Firefox (MV2).

## Commands

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev              # Chrome
npm run dev:firefox      # Firefox

# Build
npm run build            # Chrome
npm run build:firefox    # Firefox
npm run build:all        # Both

# Create distribution packages
npm run zip              # Chrome .zip
npm run zip:firefox      # Firefox .xpi
npm run zip:all          # Both

# Testing
npm run test             # Watch mode
npm run test:run         # Single run

# Type check
npm run compile
```

## Architecture

### Project Structure

```
├── entrypoints/
│   ├── background.ts      # Service worker (Chrome) / background script (Firefox)
│   ├── content.ts         # Content script injected on Pathbuilder
│   └── popup/             # Extension popup UI
│       ├── index.html
│       ├── main.ts
│       └── style.css
├── modules/
│   ├── characterManager.ts  # Extracts character data from Pathbuilder DOM
│   └── pageObserver.ts      # MutationObserver for button injection & dice history
├── utils/
│   ├── discord.ts         # Message formatting, roll extraction
│   ├── html.ts            # HTML sanitization, markdown conversion
│   ├── storage.ts         # Browser storage abstraction
│   └── ui.ts              # Button creation, toast notifications
├── assets/
│   └── toast.css          # Toast notification styles
├── public/                # Static files (icons)
└── wxt.config.ts          # WXT configuration
```

### Content Script Flow

1. `pageObserver.ts` sets up MutationObserver to detect Pathbuilder DOM changes
2. Injects "Send to Discord" buttons next to weapons/actions
3. Watches `#dice-history` for new rolls (no timestamp parsing needed!)
4. `characterManager.ts` extracts character name and roll context
5. Messages sent to background script → Discord webhook

### Dice History (No Timestamp Parsing!)

Pathbuilder formats rolls as: `<timestamp> Your <Roll Type>: <result>`

Instead of parsing locale-specific timestamps, we just find "Your " and extract after it:

```typescript
// utils/discord.ts
const yourIndex = rollText.indexOf('Your ');
const content = rollText.substring(yourIndex + 5);
```

### Browser Differences (Handled by WXT)

WXT automatically generates the correct manifest and API calls:
- Chrome: Manifest V3, service worker, `chrome` namespace
- Firefox: Manifest V2, background script, `browser` namespace

## Local Development

```bash
npm run dev        # Opens Chrome with extension loaded
npm run dev:firefox # Opens Firefox with extension loaded
```

The dev server provides hot module replacement for the popup and content scripts.

## Publishing

Push a version tag to trigger GitHub Actions:

```bash
git tag v2.1.0
git push origin v2.1.0
```

Required GitHub secrets:
- Chrome: `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`
- Firefox: `FIREFOX_JWT_ISSUER`, `FIREFOX_JWT_SECRET`

## Key Patterns

- **HTML Sanitization**: All Pathbuilder content sanitized before Discord (removes scripts, event handlers)
- **Discord Message Limit**: Messages truncated at 2000 characters
- **Element Markers**: Processed dice rolls marked with `data-alseta-processed` to prevent duplicates
