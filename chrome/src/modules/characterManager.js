/**
 * Module for managing character data and extraction
 */

import { sanitizeHTML, safeExtract } from '../utils/htmlUtils.js';

class CharacterManager {
    constructor() {
        this.characterName = "";
        this.diceTitle = "";
    }

    /**
     * Checks if current page is beta version
     * @returns {boolean} Whether the page is beta
     */
    isBetaPage() {
        return window.location.href.includes("/beta/");
    }

    /**
     * Fetches character name from the page
     * @returns {string|null} Character name or null if not found
     */
    fetchCharacterName() {
        const characterNameDiv = Array.from(document.querySelectorAll(".small-text.grey-text.button-text"))
            .find(div => div.textContent.trim() === "Character Name");

        if (!characterNameDiv) return null;

        const nextSiblingDiv = characterNameDiv.nextElementSibling;
        if (!nextSiblingDiv || !nextSiblingDiv.classList.contains("button-selection")) {
            return null;
        }

        return nextSiblingDiv.textContent.trim();
    }

    /**
     * Fetches dice roll title from the page
     * @returns {string} Dice roll title
     */
    fetchDiceTitle() {
        const diceTitleDiv = document.getElementById("dice-title");
        return diceTitleDiv ? diceTitleDiv.textContent.trim() : "";
    }

    /**
     * Extracts character data from HTML content
     * @param {string} htmlContent - The HTML content to extract from
     * @returns {Object} Extracted character data
     */
    extractCharacterData(htmlContent) {
        const sanitizedContent = sanitizeHTML(htmlContent);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedContent;

        return {
            name: this._extractName(tempDiv),
            level: this._extractLevel(tempDiv),
            traits: this._extractTraits(tempDiv),
            skills: this._extractSkills(tempDiv),
            ...this._extractCombatStats(tempDiv),
            ...this._extractAbilityScores(tempDiv),
            ...this._extractInventoryAndSpells(tempDiv)
        };
    }

    /**
     * Extracts character name
     * @private
     */
    _extractName(tempDiv) {
        return safeExtract(tempDiv, '.subtitle') || '';
    }

    /**
     * Extracts character level
     * @private
     */
    _extractLevel(tempDiv) {
        return safeExtract(tempDiv, '.item-level-box') || '';
    }

    /**
     * Extracts traits
     * @private
     */
    _extractTraits(tempDiv) {
        return Array.from(tempDiv.querySelectorAll('.trait'))
            .map(trait => trait.textContent.trim());
    }

    /**
     * Extracts skills
     * @private
     */
    _extractSkills(tempDiv) {
        return Array.from(tempDiv.querySelectorAll('.button-mystery'))
            .map(skill => {
                const name = skill.querySelector('b')?.textContent || '';
                const value = skill.querySelector('span')?.textContent || '';
                return `${name} ${value}`.trim();
            })
            .filter(skill => skill !== '');
    }

    /**
     * Extracts combat stats
     * @private
     */
    _extractCombatStats(tempDiv) {
        return {
            ac: this._findStatValue(tempDiv, 'AC'),
            hp: this._findStatValue(tempDiv, 'HP'),
            fort: this._findSaveValue(tempDiv, 'Fort'),
            ref: this._findSaveValue(tempDiv, 'Ref'),
            will: this._findSaveValue(tempDiv, 'Will'),
            speed: this._findStatValueWithPrefix(tempDiv, 'Speed'),
            melee: this._findStatValueWithPrefix(tempDiv, 'Melee'),
            ranged: this._findStatValueWithPrefix(tempDiv, 'Ranged')
        };
    }

    /**
     * Extracts ability scores
     * @private
     */
    _extractAbilityScores(tempDiv) {
        const text = tempDiv.textContent || '';
        const match = text.match(/Str\s[+-]\d,\sDex\s[+-]\d,\sCon\s[+-]\d,\sInt\s[+-]\d,\sWis\s[+-]\d,\sCha\s[+-]\d/);
        return {
            abilities: match ? match[0] : ""
        };
    }

    /**
     * Extracts inventory and spells
     * @private
     */
    _extractInventoryAndSpells(tempDiv) {
        return {
            items: this._findStatValueWithPrefix(tempDiv, 'Items'),
            spells: this._extractSpells(tempDiv)
        };
    }

    /**
     * Helper method to find stat values
     * @private
     */
    _findStatValue(tempDiv, statName) {
        const node = Array.from(tempDiv.querySelectorAll('b'))
            .find(b => b.textContent === statName);
        return node?.nextElementSibling?.textContent.trim() || "";
    }

    /**
     * Helper method to find save values
     * @private
     */
    _findSaveValue(tempDiv, saveName) {
        const node = Array.from(tempDiv.querySelectorAll('.button-mystery'))
            .find(b => b.textContent?.includes(saveName));
        return node?.querySelector('span')?.textContent.trim() || "";
    }

    /**
     * Helper method to find stat values with prefix
     * @private
     */
    _findStatValueWithPrefix(tempDiv, prefix) {
        const node = Array.from(tempDiv.querySelectorAll('b'))
            .find(b => b.textContent === prefix);
        return node?.nextSibling?.nodeValue?.trim() || "";
    }

    /**
     * Helper method to extract spells
     * @private
     */
    _extractSpells(tempDiv) {
        const spellsNode = Array.from(tempDiv.querySelectorAll('b'))
            .find(b => b.textContent?.includes("Spells"));
        return spellsNode ?
            spellsNode.parentNode.textContent.replace(spellsNode.textContent, "").trim() :
            "";
    }
}

export default new CharacterManager();
