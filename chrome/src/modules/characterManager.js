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
     * @returns {string} Character name
     */
    fetchCharacterName() {
        const characterNameDiv = Array.from(document.querySelectorAll(".small-text.grey-text.button-text"))
            .find(div => div.textContent.trim() === "Character Name");
        const nextSiblingDiv = characterNameDiv?.nextElementSibling;
        const name = nextSiblingDiv && nextSiblingDiv.classList.contains("button-selection")
            ? nextSiblingDiv.textContent.trim()
            : "";
        console.log(`Fetched Character Name: ${name}`);
        return name;
    }

    /**
     * Fetches dice roll title from the page
     * @returns {string} Dice roll title
     */
    fetchDiceTitle() {
        const diceTitleDiv = document.getElementById("dice-title");
        const title = diceTitleDiv ? diceTitleDiv.textContent.trim() : "";
        console.log(`Fetched Dice Title: ${title}`);
        return title;
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

        const characterData = {
            name: safeExtract(tempDiv, '.subtitle', 0),
            level: safeExtract(tempDiv, '.item-level-box', 0),
            traits: Array.from(tempDiv.querySelectorAll('.trait')).map(trait => trait.innerText.trim()),
            skills: this._extractSkills(tempDiv),
            ...this._extractCombatStats(tempDiv),
            ...this._extractAbilityScores(tempDiv),
            ...this._extractInventoryAndSpells(tempDiv)
        };

        console.log("Extracted Character Data:", characterData);
        return characterData;
    }

    /**
     * Extracts and formats character skills
     * @private
     */
    _extractSkills(tempDiv) {
        return Array.from(tempDiv.querySelectorAll('.button-mystery')).map(skill => {
            const skillName = skill.querySelector('b')?.innerText || '';
            const skillValue = skill.querySelector('span')?.innerText || '';
            return `${skillName} ${skillValue}`.trim();
        });
    }

    /**
     * Extracts combat-related statistics
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
        return {
            abilities: tempDiv.innerText.match(/Str\s[+-]\d,\sDex\s[+-]\d,\sCon\s[+-]\d,\sInt\s[+-]\d,\sWis\s[+-]\d,\sCha\s[+-]\d/)?.[0] || ""
        };
    }

    /**
     * Extracts inventory and spell information
     * @private
     */
    _extractInventoryAndSpells(tempDiv) {
        return {
            items: this._findStatValueWithPrefix(tempDiv, 'Items'),
            spells: Array.from(tempDiv.querySelectorAll('b'))
                .find(b => b.innerText.includes("Spells"))
                ?.parentNode?.innerText
                .replace(Array.from(tempDiv.querySelectorAll('b'))
                    .find(b => b.innerText.includes("Spells")).innerText, "")
                .trim() || ""
        };
    }

    /**
     * Helper method to find stat values
     * @private
     */
    _findStatValue(tempDiv, statName) {
        return Array.from(tempDiv.querySelectorAll('b'))
            .find(b => b.innerText === statName)
            ?.nextElementSibling?.innerText.trim() || "";
    }

    /**
     * Helper method to find save values
     * @private
     */
    _findSaveValue(tempDiv, saveName) {
        return Array.from(tempDiv.querySelectorAll('.button-mystery'))
            .find(b => b.innerText.includes(saveName))
            ?.querySelector('span')?.innerText.trim() || "";
    }

    /**
     * Helper method to find stat values with prefix
     * @private
     */
    _findStatValueWithPrefix(tempDiv, prefix) {
        return Array.from(tempDiv.querySelectorAll('b'))
            .find(b => b.innerText === prefix)
            ?.nextSibling?.nodeValue.trim() || "";
    }
}

export default new CharacterManager();