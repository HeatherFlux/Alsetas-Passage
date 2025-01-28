# Testing Implementation Plan

## Phase 1: Essential Unit Tests
Focus on core functionality that can break the extension:

1. HTML Parsing & Formatting
```javascript
// Priority Tests:
- HTML to Markdown conversion
- Trait extraction
- Message formatting
- HTML sanitization
```

2. Character Data Extraction
```javascript
// Priority Tests:
- Basic character info extraction
- Stats parsing
- Error handling for missing data
```

## Phase 2: Mock Environment
Create minimal working test environment:

1. Basic HTML Fixture
```html
<!-- Start with essential elements -->
<div class="dice-tray">
  <div id="dice-title">Attack Roll</div>
  <div id="dice-history"></div>
</div>

<div class="listview-item">
  <div class="listview-title">Test Item</div>
  <div class="listview-detail">
    <div class="trait">Test Trait</div>
  </div>
</div>
```

2. Simple Test Server
```javascript
// Serve only essential mock pages
- Main character view
- Dice rolling interface
```

## Phase 3: Integration Points
Test critical integration points:

1. Discord Communication
```javascript
// Priority Tests:
- Message formatting
- Webhook handling
- Error scenarios
```

2. DOM Observers
```javascript
// Priority Tests:
- Dice roll detection
- Character updates
- Dynamic content loading
```

## Implementation Order

### Week 1: Foundation
1. Set up Jest with jsdom
2. Create basic HTML fixtures
3. Implement first unit tests for htmlUtils

### Week 2: Core Testing
1. Add characterManager tests
2. Create mock data generators
3. Implement basic integration tests

### Week 3: Integration
1. Set up test server
2. Add DOM observer tests
3. Implement Discord communication tests

## Success Metrics
- 80% code coverage for utility functions
- All critical paths tested
- Automated test runs in CI
- Reduced regression issues

## Minimal Viable Test Suite
Start with these essential tests:

1. HTML Utils
```javascript
- convertHtmlToMarkdown()
- sanitizeHTML()
- extractAndFormatTraits()
```

2. Character Manager
```javascript
- extractCharacterData()
- fetchCharacterName()
- isBetaPage()
```

3. Page Observer
```javascript
- handleButtonClick()
- logDiceHistory()
- addDetailExportButton()
```

## Next Steps

1. Create initial test structure:
```
test/
├── fixtures/
│   ├── basic-character.html
│   └── dice-roll.html
├── unit/
│   ├── htmlUtils.test.js
│   └── characterManager.test.js
└── integration/
    └── diceRoll.test.js
```

2. Set up development environment:
```bash
npm init
npm install --save-dev jest jsdom
```

3. Create first test implementation:
```javascript
// test/unit/htmlUtils.test.js
describe('HTML Utils', () => {
  test('converts HTML to markdown', () => {
    const input = '<b>Test</b>';
    expect(convertHtmlToMarkdown(input)).toBe('**Test**');
  });
});
```

## Immediate Actions
1. Set up test environment
2. Create basic HTML fixtures
3. Implement first utility tests
4. Add CI workflow for automated testing

This phased approach allows us to:
- Start testing quickly with minimal setup
- Focus on critical functionality first
- Build a reliable test foundation
- Gradually expand test coverage
