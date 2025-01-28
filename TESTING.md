# Testing Strategy for Alseta's Passage

## Overview
Since we don't own the Pathbuilder codebase but need to ensure our extension works reliably, we'll implement a multi-layered testing approach:

## 1. Mock Environment Testing

### HTML Fixtures
Create a local test environment that mimics Pathbuilder's DOM structure:

```html
<!-- test/fixtures/pathbuilder-mock.html -->
<!DOCTYPE html>
<html>
<body>
  <!-- Mock Pathbuilder DOM structure -->
  <div class="dice-tray">
    <div id="dice-title">Attack Roll</div>
    <div id="dice-history">
      <!-- Mock dice roll history -->
    </div>
  </div>
  
  <div class="listview-item">
    <div class="listview-title">Test Item</div>
    <div class="listview-detail">
      <div class="trait">Trait1</div>
      <div class="trait">Trait2</div>
      <!-- Other mock content -->
    </div>
  </div>
  
  <!-- Mock character data -->
  <div class="div-statblock">
    <!-- Character stats structure -->
  </div>
</body>
</html>
```

### Test Data Generator
Create scripts to generate realistic test data:

```javascript
// test/utils/mockDataGenerator.js
export function generateMockDiceRoll() {
  return {
    type: 'Attack',
    value: Math.floor(Math.random() * 20) + 1,
    modifier: '+5',
    timestamp: new Date().toISOString()
  };
}

export function generateMockCharacter() {
  return {
    name: 'Test Character',
    level: 5,
    traits: ['Fighter', 'Human'],
    // Other character data
  };
}
```

## 2. Unit Testing

### Test Individual Modules
Create unit tests for each utility and module:

```javascript
// test/unit/htmlUtils.test.js
describe('HTML Utils', () => {
  test('convertHtmlToMarkdown', () => {
    const input = '<b>Bold</b> and <i>italic</i>';
    expect(convertHtmlToMarkdown(input)).toBe('**Bold** and *italic*');
  });
});

// test/unit/characterManager.test.js
describe('Character Manager', () => {
  test('extractCharacterData', () => {
    const mockHtml = generateMockCharacterHtml();
    const result = characterManager.extractCharacterData(mockHtml);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('level');
  });
});
```

## 3. Integration Testing

### Mock Browser Environment
Use tools like Jest with jsdom to simulate browser environment:

```javascript
// test/setup/browser-env.js
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'https://pathbuilder2e.com/',
  referrer: 'https://pathbuilder2e.com/',
  contentType: 'text/html'
});

global.window = dom.window;
global.document = dom.window.document;
global.browser = {
  runtime: {
    sendMessage: jest.fn(),
    getURL: jest.fn()
  }
};
```

### Integration Test Scenarios
Test complete workflows:

```javascript
// test/integration/diceRoll.test.js
describe('Dice Roll Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = loadFixture('pathbuilder-mock.html');
  });

  test('dice roll capture and format', async () => {
    // Simulate dice roll
    const diceHistory = document.getElementById('dice-history');
    diceHistory.innerHTML = generateMockDiceRoll();
    
    // Trigger observer
    await waitForObserver();
    
    // Verify message formatting and sending
    expect(browser.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'logDiceHistory'
      })
    );
  });
});
```

## 4. End-to-End Testing

### Local Test Server
Create a simple server that serves mock Pathbuilder pages:

```javascript
// test/server/index.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.sendFile('pathbuilder-mock.html');
});

app.listen(3000, () => console.log('Test server running'));
```

### Automated Browser Testing
Use Puppeteer for automated browser testing:

```javascript
// test/e2e/extension.test.js
describe('Extension E2E', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    });
  });

  test('send to discord button functionality', async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
    
    // Wait for extension to initialize
    await page.waitForSelector('.discord-export-button');
    
    // Test button click and message sending
    await page.click('.discord-export-button');
    
    // Verify webhook call
    // This requires intercepting network requests
  });
});
```

## 5. Snapshot Testing

### DOM Snapshots
Create snapshots of key DOM manipulations:

```javascript
// test/snapshots/ui.test.js
describe('UI Snapshots', () => {
  test('export button injection', () => {
    document.body.innerHTML = loadFixture('listview-item.html');
    pageObserver.addDetailExportButton(document.querySelector('.listview-item'));
    expect(document.body.innerHTML).toMatchSnapshot();
  });
});
```

## Implementation Steps

1. Set up test environment:
```bash
npm install --save-dev jest jsdom puppeteer express
```

2. Create test directory structure:
```
test/
├── fixtures/
├── unit/
├── integration/
├── e2e/
├── utils/
└── server/
```

3. Add test scripts to package.json:
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest test/unit",
    "test:integration": "jest test/integration",
    "test:e2e": "jest test/e2e",
    "test:watch": "jest --watch"
  }
}
```

## Best Practices

1. **Data Isolation**: Use fresh fixtures for each test
2. **Async Handling**: Properly handle all asynchronous operations
3. **Error Cases**: Test both success and failure scenarios
4. **Network Mocking**: Mock Discord webhook calls
5. **State Reset**: Clean up after each test
6. **CI Integration**: Add tests to build pipeline

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

This testing strategy allows us to:
- Verify functionality without Pathbuilder source code
- Catch integration issues early
- Ensure consistent behavior across browsers
- Maintain confidence in refactoring
- Automate quality assurance