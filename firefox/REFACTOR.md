# Firefox Extension Refactoring Plan

## Key Differences from Chrome Version

### 1. Manifest Requirements
- Uses Manifest V2 (Chrome uses V3)
- Requires `browser_specific_settings` with gecko ID
- Uses `browser_action` instead of `action`
- Background scripts array instead of service worker

### 2. API Differences
- Uses `browser` namespace instead of `chrome`
- Promises-based API (Chrome uses callbacks)
- Different storage API implementation
- Different message passing mechanisms

## Refactoring Strategy

### 1. Module Structure
Keep the same modular structure as Chrome but with Firefox-specific adaptations:
```
firefox/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.css
├── toast.css
├── build.sh
├── icons/
└── src/
    ├── utils/
    │   ├── browserUtils.js    # Firefox-specific browser APIs
    │   ├── htmlUtils.js       # Shared HTML utilities
    │   ├── discordUtils.js    # Shared Discord utilities
    │   └── uiUtils.js         # Shared UI utilities
    └── modules/
        ├── characterManager.js # Shared character management
        ├── discordManager.js   # Firefox-specific Discord handling
        └── pageObserver.js     # Shared page observation
```

### 2. Browser API Abstraction
Create a browser utility layer to handle Firefox-specific APIs:
```javascript
// browserUtils.js
export async function getStorage(keys) {
  return browser.storage.sync.get(keys);
}

export async function sendMessage(message) {
  return browser.runtime.sendMessage(message);
}

export function getURL(path) {
  return browser.runtime.getURL(path);
}
```

### 3. Module Adaptations

#### Background Script
- Replace service worker with traditional background script
- Use Firefox's promise-based APIs
- Implement Firefox-specific message handling

#### Content Script
- Use Firefox's browser namespace
- Adapt message passing to use promises
- Keep core functionality identical to Chrome

#### Discord Manager
- Adapt to Firefox's storage API
- Use Firefox's message passing system
- Maintain same webhook functionality

### 4. Build Process Adaptations

Create Firefox-specific build script that:
- Maintains Firefox manifest version
- Includes gecko ID
- Creates .xpi package for Firefox submission
- Validates Firefox-specific requirements

## Implementation Steps

1. Create Firefox Browser Utils
- Implement Firefox-specific API wrappers
- Create compatibility layer for shared code

2. Port Modules
- Copy shared utilities (HTML, UI)
- Adapt Discord manager for Firefox
- Update imports to use browser utils

3. Update Core Files
- Modify manifest.json for Firefox
- Update background script implementation
- Adapt content script for Firefox APIs

4. Create Build System
- Implement Firefox-specific build script
- Add Firefox package validation
- Create submission-ready .xpi generation

5. Testing
- Test on Firefox Developer Edition
- Verify all features work with Firefox APIs
- Ensure proper error handling

## Firefox-Specific Considerations

### Security
- Review Firefox's CSP requirements
- Validate content script permissions
- Check storage API usage

### Performance
- Test message passing performance
- Verify storage API efficiency
- Monitor memory usage

### Distribution
- Package as .xpi file
- Include source code for AMO review
- Follow Firefox add-on guidelines

## Migration Notes

1. Storage API
```javascript
// Chrome
chrome.storage.sync.get(keys, callback);

// Firefox
await browser.storage.sync.get(keys);
```

2. Message Passing
```javascript
// Chrome
chrome.runtime.sendMessage(message, callback);

// Firefox
await browser.runtime.sendMessage(message);
```

3. Extension URLs
```javascript
// Chrome
chrome.runtime.getURL(path);

// Firefox
browser.runtime.getURL(path);
```

## Testing Requirements

1. Firefox-Specific
- Test on Firefox Developer Edition
- Verify manifest v2 compatibility
- Check gecko ID implementation

2. Functional Testing
- Verify all features work in Firefox
- Test storage synchronization
- Validate message passing

3. Performance Testing
- Monitor memory usage
- Check load times
- Verify API responsiveness

## Next Steps

1. Create browser utils module
2. Port shared utilities
3. Implement Firefox-specific modules
4. Create Firefox build script
5. Test and validate
6. Prepare for Firefox Add-on submission