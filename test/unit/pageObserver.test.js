const pageObserver = require('../../chrome/src/modules/pageObserver.js');

// Mock dependencies
jest.mock('../../chrome/src/modules/characterManager.js', () => ({
  fetchCharacterName: jest.fn().mockReturnValue('Test Character'),
  fetchDiceTitle: jest.fn().mockReturnValue('Test Roll')
}));

describe('Page Observer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.chrome = {
      runtime: {
        sendMessage: jest.fn().mockResolvedValue({ status: 'ok' }),
        getURL: jest.fn(path => `chrome-extension://mock-id/${path}`),
        onMessage: {
          addListener: jest.fn(),
          removeListener: jest.fn(),
        }
      }
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete global.chrome;
    pageObserver.cleanup();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Button Injection', () => {
    test('adds export button to detail div', () => {
      document.body.innerHTML = `
                <div class="listview-item">
                    <div class="listview-detail">Content</div>
                </div>
            `;

      const div = document.querySelector('.listview-item');
      pageObserver.addDetailExportButton(div);

      const button = document.querySelector('.discord-export-button');
      expect(button).toBeTruthy();
      expect(button.textContent).toBe('Send To Discord');
    });

    test('does not add duplicate buttons', () => {
      document.body.innerHTML = `
                <div class="listview-item">
                    <div class="listview-detail">
                        <button class="discord-export-button">Send To Discord</button>
                        Content
                    </div>
                </div>
            `;

      const div = document.querySelector('.listview-item');
      pageObserver.addDetailExportButton(div);

      const buttons = document.querySelectorAll('.discord-export-button');
      expect(buttons).toHaveLength(1);
    });

    test('handles missing detail div', () => {
      document.body.innerHTML = '<div class="listview-item"></div>';
      const div = document.querySelector('.listview-item');
      pageObserver.addDetailExportButton(div);

      const button = document.querySelector('.discord-export-button');
      expect(button).toBeFalsy();
    });
  });

  describe('Button Click Handling', () => {
    test('sends message to Discord on button click', async () => {
      document.body.innerHTML = `
                <div class="listview-item">
                    <div class="listview-title">Test Item</div>
                    <div class="listview-detail">
                        <div class="trait">Test Trait</div>
                        Content
                    </div>
                </div>
            `;

      const div = document.querySelector('.listview-item');
      pageObserver.addDetailExportButton(div);

      const button = document.querySelector('.discord-export-button');
      await button.click();

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'sendToDiscord',
          message: expect.stringContaining('Test Item')
        })
      );
    });
  });

  describe('Dynamic Content Handling', () => {
    test('observes and handles new content', () => {
      pageObserver.handleDynamicContent();

      // Add new content
      document.body.innerHTML = `
                <div class="listview-item">
                    <div class="listview-detail">New Content</div>
                </div>
            `;

      // Trigger mutation observer
      const observer = pageObserver.contentObserver;
      observer.trigger([{
        type: 'childList',
        addedNodes: [document.querySelector('.listview-item')],
        removedNodes: []
      }]);

      const button = document.querySelector('.discord-export-button');
      expect(button).toBeTruthy();
    });

    test('handles hidden details becoming visible', () => {
      document.body.innerHTML = `
                <div class="listview-item">
                    <div class="listview-detail hidden">Hidden Content</div>
                </div>
            `;

      pageObserver.handleDynamicContent();

      const detailDiv = document.querySelector('.listview-detail');
      detailDiv.classList.remove('hidden');

      // Simulate click event
      const div = document.querySelector('.listview-item');
      div.click();

      // Wait for timeout
      jest.advanceTimersByTime(500);

      const button = document.querySelector('.discord-export-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Dice History Observation', () => {
    test('observes dice history changes', () => {
      document.body.innerHTML = `
                <div id="dice-history">
                    <div>Initial Roll</div>
                </div>
            `;

      pageObserver.observeDiceHistory();

      // Add new roll
      const diceHistory = document.getElementById('dice-history');
      const newRoll = document.createElement('div');
      newRoll.innerHTML = 'New Roll: 15';

      // Trigger mutation observer
      const observer = pageObserver.diceHistoryObserver;
      observer.trigger([{
        type: 'childList',
        addedNodes: [newRoll],
        removedNodes: []
      }]);

      expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    });

    test('handles missing dice history div', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      pageObserver.observeDiceHistory();
      expect(consoleSpy).toHaveBeenCalledWith('Dice history div not found');
    });
  });
});