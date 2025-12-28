/**
 * Page observation and button injection for Pathbuilder2e
 */

import { createExportButton, showToast } from '../utils/ui';
import { extractAndFormatTraits, removeElementsFromHtml, convertHtmlToMarkdown } from '../utils/html';
import { formatDiceRoll, truncateMessage, DISCORD_MESSAGE_LIMIT } from '../utils/discord';
import characterManager from './characterManager';

// Mark for processed dice history items
const PROCESSED_MARKER = 'alseta-processed';

class PageObserver {
  private diceHistoryObserver: MutationObserver | null = null;
  private contentObserver: MutationObserver | null = null;

  /**
   * Initialize all observers
   */
  init(): void {
    console.log("Alseta's Passage: Initializing page observer");
    this.handleDynamicContent();
    this.observeDiceHistory();
  }

  /**
   * Add export button to a listview item
   */
  private addDetailExportButton(div: HTMLElement): void {
    const detailDiv = div.querySelector('.listview-detail');
    if (!detailDiv || detailDiv.querySelector('.discord-export-button')) {
      return;
    }

    const button = createExportButton();
    button.addEventListener('click', () => this.handleExportClick(div));
    detailDiv.appendChild(button);
  }

  /**
   * Prepare message for Discord, handling size limits
   */
  private prepareMessage(title: string, traits: string, content: string): string {
    let message = traits
      ? `**${title}**\n> **Traits:** ${traits}\n> ${content}`
      : `**${title}**\n> ${content}`;

    // Check and truncate if needed
    const messageSize = new TextEncoder().encode(message).length;
    if (messageSize > DISCORD_MESSAGE_LIMIT - 100) {
      const truncateAt = 1800 - title.length - (traits ? traits.length : 0);
      const truncatedContent = content.substring(0, truncateAt);
      message = traits
        ? `**${title}**\n> **Traits:** ${traits}\n> ${truncatedContent}...\n> (Content truncated)`
        : `**${title}**\n> ${truncatedContent}...\n> (Content truncated)`;
    }

    return message;
  }

  /**
   * Handle export button click
   */
  private async handleExportClick(div: HTMLElement): Promise<void> {
    const title = div.querySelector('.listview-title')?.textContent?.trim() || '';
    const detailDiv = div.querySelector('.listview-detail') as HTMLElement;
    if (!detailDiv) return;

    const { traits, traitDivs } = extractAndFormatTraits(detailDiv);
    const content = convertHtmlToMarkdown(
      removeElementsFromHtml(detailDiv.innerHTML, traitDivs)
    );

    const message = this.prepareMessage(title, traits, content);

    try {
      const response = await browser.runtime.sendMessage({
        action: 'sendToDiscord',
        message,
      });

      if (response?.status === 'ok') {
        showToast('Sent to Discord!');
      } else {
        console.error('Failed to send message:', response);
        showToast('Failed to send to Discord');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Error sending to Discord');
    }
  }

  /**
   * Handle dynamic content changes (new listview items)
   */
  private handleDynamicContent(): void {
    if (this.contentObserver) {
      this.contentObserver.disconnect();
    }

    this.contentObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.classList?.contains('listview-item')) {
              this.addDetailExportButton(element);
            }
            // Also check for nested listview items
            element.querySelectorAll?.('.listview-item').forEach((item) => {
              this.addDetailExportButton(item as HTMLElement);
            });
          }
        });
      });
    });

    this.contentObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Handle items already on the page
    document.querySelectorAll('.listview-item').forEach((item) => {
      this.addDetailExportButton(item as HTMLElement);
    });
  }

  /**
   * Observe dice history for new rolls
   * Uses element markers instead of timestamp parsing!
   */
  private observeDiceHistory(): void {
    const diceHistoryDiv = document.getElementById('dice-history');
    if (!diceHistoryDiv) {
      console.log("Alseta's Passage: Dice history div not found, will retry...");
      // Retry after DOM is more loaded
      setTimeout(() => this.observeDiceHistory(), 1000);
      return;
    }

    if (this.diceHistoryObserver) {
      this.diceHistoryObserver.disconnect();
    }

    // Mark existing items as processed so we don't spam on page load
    diceHistoryDiv.querySelectorAll('.dice-history-item').forEach((item) => {
      item.setAttribute(`data-${PROCESSED_MARKER}`, 'true');
    });

    this.diceHistoryObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.classList?.contains('dice-history-item') &&
                  !element.hasAttribute(`data-${PROCESSED_MARKER}`)) {
                // Mark as processed
                element.setAttribute(`data-${PROCESSED_MARKER}`, 'true');
                // Handle the new roll
                this.handleDiceRoll(element);
              }
            }
          });
        }
      });
    });

    this.diceHistoryObserver.observe(diceHistoryDiv, {
      childList: true,
    });

    console.log("Alseta's Passage: Dice history observer active");
  }

  /**
   * Handle a new dice roll
   * Simple: get character, title, and the text content
   */
  private async handleDiceRoll(rollNode: HTMLElement): Promise<void> {
    console.log("[Alseta] handleDiceRoll: New roll detected");
    console.log("[Alseta] handleDiceRoll: rollNode HTML:", rollNode.innerHTML);

    const characterName = characterManager.fetchCharacterName() || 'Unknown Character';
    const diceTitle = characterManager.fetchDiceTitle() || 'Dice';

    // Process HTML for cleaner output:
    // 1. Convert <br> to newlines
    // 2. Format superscript-damage spans: "19d20" -> "19 (d20)"
    // 3. Format sup tags for damage types: "4Slashing" -> "4 Slashing"
    const clonedNode = rollNode.cloneNode(true) as HTMLElement;

    // Replace <br> with newlines
    clonedNode.querySelectorAll('br').forEach(br => br.replaceWith('\n'));

    // Format die notation: 19<span class="superscript-damage">d20</span> -> 19 (d20)
    clonedNode.querySelectorAll('span.superscript-damage').forEach(span => {
      const text = span.textContent || '';
      // If it's a die type (d4, d6, d8, d10, d12, d20), wrap in parens with space before
      if (/^d\d+$/.test(text)) {
        span.replaceWith(` (${text})`);
      } else {
        // For damage types like "Slashing", "Piercing", add space before
        span.replaceWith(` ${text}`);
      }
    });

    // Handle <sup> tags (damage type wrappers) - just get their processed content
    clonedNode.querySelectorAll('sup').forEach(sup => {
      sup.replaceWith(sup.textContent || '');
    });

    const rollText = clonedNode.textContent?.trim() || '';

    console.log("[Alseta] handleDiceRoll: characterName =", characterName);
    console.log("[Alseta] handleDiceRoll: diceTitle =", diceTitle);
    console.log("[Alseta] handleDiceRoll: rollText =", JSON.stringify(rollText));

    // Format the message
    const message = formatDiceRoll(characterName, diceTitle, rollText);
    console.log("[Alseta] handleDiceRoll: Final message:", message);

    try {
      const response = await browser.runtime.sendMessage({
        action: 'sendToDiscord',
        message: truncateMessage(message),
      });

      console.log("[Alseta] handleDiceRoll: Discord response:", response);
      if (response?.status !== 'ok') {
        console.error("[Alseta] handleDiceRoll: Failed to send dice roll:", response);
      }
    } catch (error) {
      console.error("[Alseta] handleDiceRoll: Error sending dice roll:", error);
    }
  }

  /**
   * Clean up all observers
   */
  cleanup(): void {
    if (this.diceHistoryObserver) {
      this.diceHistoryObserver.disconnect();
      this.diceHistoryObserver = null;
    }
    if (this.contentObserver) {
      this.contentObserver.disconnect();
      this.contentObserver = null;
    }
  }
}

export const pageObserver = new PageObserver();
export default pageObserver;
