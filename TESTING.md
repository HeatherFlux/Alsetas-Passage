# Testing Strategy for Alseta's Passage

## Overview
Based on direct observation of the Pathbuilder2e interface, we've identified key elements and interactions that need testing. This document outlines our testing strategy that doesn't require access to the Pathbuilder codebase.

## Test Categories

### 1. DOM Structure Tests
Test the extension's ability to identify and interact with Pathbuilder's DOM elements:

```javascript
describe('DOM Structure', () => {
  test('identifies character name element', () => {
    // Test finding .small-text.grey-text.button-text
  });
  
  test('identifies dice history container', () => {
    // Test finding #dice-history
  });
  
  test('identifies weapon elements', () => {
    // Test finding .listview-item elements
  });
});
```

### 2. Button Injection Tests
Verify "Send to Discord" buttons are properly added:

```javascript
describe('Button Injection', () => {
  test('adds button to weapon rolls', () => {
    // Test button addition to weapon roll results
  });
  
  test('adds button to skill checks', () => {
    // Test button addition to skill check results
  });
  
  test('handles dynamic content loading', () => {
    // Test MutationObserver functionality
  });
});
```

### 3. Data Capture Tests
Test extraction of roll and character information:

```javascript
describe('Data Capture', () => {
  test('captures character context', () => {
    // Test character name and level extraction
  });
  
  test('captures roll details', () => {
    // Test roll result and modifier extraction
  });
  
  test('captures weapon traits', () => {
    // Test trait extraction and formatting
  });
});
```

## Test Fixtures

### 1. Basic Character View
```html
<!-- test/fixtures/basic-character.html -->
<div class="character-header">
  <div class="small-text grey-text button-text">Character Name</div>
  <div class="button-selection">Test Character</div>
  <div class="level">1</div>
</div>
```

### 2. Weapon Roll View
```html
<!-- test/fixtures/weapon-roll.html -->
<div class="listview-item">
  <div class="listview-title">Axe Musket - Melee</div>
  <div class="listview-detail">
    <div class="trait">Uncommon</div>
    <div class="trait">Critical Fusion</div>
  </div>
</div>
```

### 3. Dice Roll History
```html
<!-- test/fixtures/dice-history.html -->
<div id="dice-history">
  <div class="dice-roll">
    <div id="dice-title">Attack Roll</div>
    <div class="roll-result">15</div>
    <div class="roll-modifier">+8</div>
  </div>
</div>
```

## Test Scenarios

### 1. Character Context Tests
- No character loaded
- Character with basic info
- Character with full stats
- Character name changes

### 2. Roll Interaction Tests
- Weapon attack rolls
- Damage rolls
- Skill checks
- Saving throws
- Multiple rapid rolls

### 3. UI State Tests
- Initial page load
- Dynamic content loading
- Page navigation
- Error states

## Test Implementation

### 1. Setup Test Environment
```javascript
// test/setup.js
import { JSDOM } from 'jsdom';
import fs from 'fs';

const setupTestDOM = (fixturePath) => {
  const html = fs.readFileSync(fixturePath, 'utf8');
  const dom = new JSDOM(html);
  global.document = dom.window.document;
  global.window = dom.window;
};
```

### 2. Mock Browser APIs
```javascript
// test/mocks/browser-api.js
global.browser = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  }
};
```

### 3. Test Utilities
```javascript
// test/utils/dom-helpers.js
export const triggerMutation = (element) => {
  const observer = new MutationObserver(() => {});
  observer.observe(element, { childList: true, subtree: true });
  element.innerHTML += ' '; // Trigger mutation
};
```

## Test Organization

```
test/
├── fixtures/
│   ├── basic-character.html
│   ├── weapon-roll.html
│   └── dice-history.html
├── unit/
│   ├── htmlUtils.test.js
│   ├── characterManager.test.js
│   └── pageObserver.test.js
├── integration/
│   ├── buttonInjection.test.js
│   └── discordCommunication.test.js
└── setup/
    ├── jest.setup.js
    └── browser-mocks.js
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration

# Run with coverage
npm run test:coverage
```

## Continuous Integration

Add GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## Next Steps

1. Create test fixtures based on observed DOM structure
2. Implement basic unit tests for utilities
3. Add integration tests for critical paths
4. Set up CI pipeline with automated testing
5. Add test coverage reporting

This testing strategy allows us to:
- Verify extension functionality without Pathbuilder source code
- Catch integration issues early
- Ensure consistent behavior across browsers
- Maintain confidence in refactoring
- Automate quality assurance