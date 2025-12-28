/**
 * Character data extraction from Pathbuilder2e DOM
 */

import { sanitizeHTML, safeExtract } from '../utils/html';

export interface CharacterData {
  name: string;
  level: string;
  traits: string[];
  skills: string[];
  ac: string;
  hp: string;
  fort: string;
  ref: string;
  will: string;
  speed: string;
  melee: string;
  ranged: string;
  abilities: string;
  items: string;
  spells: string;
}

class CharacterManager {
  /**
   * Check if current page is Pathbuilder beta version
   */
  isBetaPage(): boolean {
    return window.location.href.includes('/beta/');
  }

  /**
   * Fetch character name from the active build tab
   * Looks for the character name in the top bar's active build section
   */
  fetchCharacterName(): string | null {
    console.log("[Alseta] fetchCharacterName: Starting search...");

    // The active build section has multiple .button-active-build elements:
    // First one is "X" (close button), second one is "Character Name - Class Level"
    const activeSection = document.querySelector('#active-builds .active-build-section-active');
    console.log("[Alseta] fetchCharacterName: activeSection found:", !!activeSection);

    if (activeSection) {
      const buttons = activeSection.querySelectorAll('.button-active-build');
      console.log("[Alseta] fetchCharacterName: Found", buttons.length, "buttons");

      // Find the one that contains " - " (the character name format)
      for (const button of buttons) {
        const text = button.textContent?.trim() || '';
        console.log("[Alseta] fetchCharacterName: Checking button text:", JSON.stringify(text));
        if (text.includes(' - ')) {
          // Format: "Yo Yo - Mystic 7" -> extract "Yo Yo"
          const dashIndex = text.lastIndexOf(' - ');
          const name = text.substring(0, dashIndex).trim();
          console.log("[Alseta] fetchCharacterName: Found name:", name);
          return name;
        }
      }
    }

    // Fallback: Try the old method with "Character Name" label
    console.log("[Alseta] fetchCharacterName: Trying fallback method...");
    const characterNameDiv = Array.from(document.querySelectorAll('.small-text.grey-text.button-text'))
      .find(div => div.textContent?.trim() === 'Character Name');

    if (!characterNameDiv) {
      console.log("[Alseta] fetchCharacterName: Fallback - no 'Character Name' label found");
      return null;
    }

    const nextSiblingDiv = characterNameDiv.nextElementSibling;
    if (!nextSiblingDiv || !nextSiblingDiv.classList.contains('button-selection')) {
      console.log("[Alseta] fetchCharacterName: Fallback - no sibling with .button-selection");
      return null;
    }

    const fallbackName = nextSiblingDiv.textContent?.trim() || null;
    console.log("[Alseta] fetchCharacterName: Fallback name:", fallbackName);
    return fallbackName;
  }

  /**
   * Fetch the current dice roll title
   */
  fetchDiceTitle(): string {
    const diceTitleDiv = document.getElementById('dice-title');
    return diceTitleDiv?.textContent?.trim() || '';
  }

  /**
   * Fetch the current dice result total
   */
  fetchDiceResult(): string {
    const diceResultDiv = document.getElementById('dice-result');
    if (!diceResultDiv) return '';
    // Remove "TOTAL: " prefix
    return diceResultDiv.textContent?.replace('TOTAL:', '').trim() || '';
  }

  /**
   * Fetch the dice summary (e.g., "1d20+15")
   */
  fetchDiceSummary(): string {
    const diceSummaryDiv = document.getElementById('dice-summary');
    return diceSummaryDiv?.textContent?.trim() || '';
  }

  /**
   * Extract full character data from HTML content
   */
  extractCharacterData(htmlContent: string): CharacterData {
    const sanitizedContent = sanitizeHTML(htmlContent);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;

    return {
      name: this.extractName(tempDiv),
      level: this.extractLevel(tempDiv),
      traits: this.extractTraits(tempDiv),
      skills: this.extractSkills(tempDiv),
      ...this.extractCombatStats(tempDiv),
      ...this.extractAbilityScores(tempDiv),
      ...this.extractInventoryAndSpells(tempDiv),
    };
  }

  private extractName(tempDiv: HTMLElement): string {
    return safeExtract(tempDiv, '.subtitle') || '';
  }

  private extractLevel(tempDiv: HTMLElement): string {
    return safeExtract(tempDiv, '.item-level-box') || '';
  }

  private extractTraits(tempDiv: HTMLElement): string[] {
    return Array.from(tempDiv.querySelectorAll('.trait'))
      .map(trait => trait.textContent?.trim() || '');
  }

  private extractSkills(tempDiv: HTMLElement): string[] {
    return Array.from(tempDiv.querySelectorAll('.button-mystery'))
      .map(skill => {
        const name = skill.querySelector('b')?.textContent || '';
        const value = skill.querySelector('span')?.textContent || '';
        return `${name} ${value}`.trim();
      })
      .filter(skill => skill !== '');
  }

  private extractCombatStats(tempDiv: HTMLElement): Pick<CharacterData, 'ac' | 'hp' | 'fort' | 'ref' | 'will' | 'speed' | 'melee' | 'ranged'> {
    return {
      ac: this.findStatValue(tempDiv, 'AC'),
      hp: this.findStatValue(tempDiv, 'HP'),
      fort: this.findSaveValue(tempDiv, 'Fort'),
      ref: this.findSaveValue(tempDiv, 'Ref'),
      will: this.findSaveValue(tempDiv, 'Will'),
      speed: this.findStatValueWithPrefix(tempDiv, 'Speed'),
      melee: this.findStatValueWithPrefix(tempDiv, 'Melee'),
      ranged: this.findStatValueWithPrefix(tempDiv, 'Ranged'),
    };
  }

  private extractAbilityScores(tempDiv: HTMLElement): Pick<CharacterData, 'abilities'> {
    const text = tempDiv.textContent || '';
    const match = text.match(/Str\s[+-]\d,\sDex\s[+-]\d,\sCon\s[+-]\d,\sInt\s[+-]\d,\sWis\s[+-]\d,\sCha\s[+-]\d/);
    return {
      abilities: match ? match[0] : '',
    };
  }

  private extractInventoryAndSpells(tempDiv: HTMLElement): Pick<CharacterData, 'items' | 'spells'> {
    return {
      items: this.findStatValueWithPrefix(tempDiv, 'Items'),
      spells: this.extractSpells(tempDiv),
    };
  }

  private findStatValue(tempDiv: HTMLElement, statName: string): string {
    const node = Array.from(tempDiv.querySelectorAll('b'))
      .find(b => b.textContent === statName);
    return node?.nextElementSibling?.textContent?.trim() || '';
  }

  private findSaveValue(tempDiv: HTMLElement, saveName: string): string {
    const node = Array.from(tempDiv.querySelectorAll('.button-mystery'))
      .find(b => b.textContent?.includes(saveName));
    return node?.querySelector('span')?.textContent?.trim() || '';
  }

  private findStatValueWithPrefix(tempDiv: HTMLElement, prefix: string): string {
    const node = Array.from(tempDiv.querySelectorAll('b'))
      .find(b => b.textContent === prefix);
    return node?.nextSibling?.nodeValue?.trim() || '';
  }

  private extractSpells(tempDiv: HTMLElement): string {
    const spellsNode = Array.from(tempDiv.querySelectorAll('b'))
      .find(b => b.textContent?.includes('Spells'));
    return spellsNode
      ? (spellsNode.parentNode?.textContent?.replace(spellsNode.textContent || '', '').trim() || '')
      : '';
  }
}

export const characterManager = new CharacterManager();
export default characterManager;
