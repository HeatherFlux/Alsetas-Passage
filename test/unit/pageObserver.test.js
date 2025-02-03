import pageObserver from '../../firefox/src/modules/pageObserver.js';
import characterManager from '../../firefox/src/modules/characterManager.js';

// Mock dependencies
jest.mock('../../firefox/src/modules/characterManager.js', () => ({
  __esModule: true,
  default: {
    fetchCharacterName: jest.fn().mockReturnValue('Test Character'),
    fetchDiceTitle: jest.fn().mockReturnValue('Test Roll'),
    isBetaPage: jest.fn().mockReturnValue(false)
  }
}));

describe('Page Observer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
    browser.runtime.sendMessage.mockClear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
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

      // The actual message format includes "Untitled" when title is missing
      expect(browser.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'sendToDiscord',
          message: expect.any(String)
        })
      );
    });
  });

  describe('Dynamic Content Handling', () => {
    beforeEach(() => {
      pageObserver.cleanup();
    });

    test('tracks observer creation and cleanup', () => {
      // Create test element
      document.body.innerHTML = `
        <div id="dice-history">
          <div>Initial Roll</div>
        </div>
      `;

      // Add a single observer
      pageObserver.observeDiceHistory();

      const observers = Array.from(pageObserver.observers);
      expect(observers.length).toBe(1);
      expect(observers[0].observe).toHaveBeenCalled();

      // Cleanup should work
      pageObserver.cleanup();
      expect(observers[0].disconnect).toHaveBeenCalled();
      expect(pageObserver.observers.size).toBe(0);
    });

    test('observes and handles new content', () => {
      pageObserver.handleDynamicContent();

      document.body.innerHTML = `
        <div class="listview-item">
          <div class="listview-detail">New Content</div>
        </div>
      `;

      const observer = Array.from(pageObserver.observers)[0];
      expect(observer).toBeTruthy();

      observer.callback([{
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

      const div = document.querySelector('.listview-item');
      div.click();

      jest.advanceTimersByTime(500);

      const button = document.querySelector('.discord-export-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Dice History Observation', () => {
    beforeEach(() => {
      pageObserver.cleanup();
    });

    test('observes dice history changes', async () => {
      document.body.innerHTML = `
        <div id="dice-history">
          <div>Initial Roll</div>
        </div>
      `;

      pageObserver.observeDiceHistory();

      const observer = Array.from(pageObserver.observers)[0];
      expect(observer).toBeTruthy();

      const newRoll = document.createElement('div');
      newRoll.innerHTML = 'New Roll: 15';

      browser.runtime.sendMessage.mockResolvedValueOnce({ status: 'ok' });

      observer.callback([{
        type: 'childList',
        addedNodes: [newRoll],
        removedNodes: []
      }]);

      await Promise.resolve();

      // Verify that a message was sent with the expected structure
      expect(browser.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          action: expect.stringMatching(/^log(CharacterName|DiceHistory)$/),
          data: expect.any(String),
          history: expect.any(String),
          title: expect.any(String)
        })
      );
    });

    test('handles missing dice history div', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      pageObserver.observeDiceHistory();
      expect(consoleSpy).toHaveBeenCalledWith('Dice history div not found');
      expect(pageObserver.observers.size).toBe(0);
    });
  });
});