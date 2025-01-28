/**
 * Character data management module
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
        const characterNameDiv = Array.from(
            document.querySelectorAll(".small-text.grey-text.button-text")
        ).find(div => div.textContent.trim() === "Character Name");

        if (characterNameDiv) {
            const nextSiblingDiv = characterNameDiv.nextElementSibling;
            if (nextSiblingDiv && nextSiblingDiv.classList.contains("button-selection")) {
                return nextSiblingDiv.textContent;
            }
        }
        return null;
    }

    /**
     * Fetches dice roll title
     * @returns {string} Dice roll title
     */
    fetchDiceTitle() {
        const diceTitleDiv = document.getElementById("dice-title");
        return diceTitleDiv ? diceTitleDiv.textContent : "";
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

        // Extract basic info
        const characterData = {
            name: safeExtract(tempDiv, '.subtitle', 0),
            level: safeExtract(tempDiv, '.item-level-box', 0),
            traits: this._extractTraits(tempDiv),
            skills: this._extractSkills(tempDiv),
            ...this._extractCombatStats(tempDiv),
            ...this._extractAbilityScores(tempDiv),
            ...this._extractInventoryAndSpells(tempDiv),
            ...this._extractLoreAndKnowledge(tempDiv)
        };

        return characterData;
    }

    /**
     * Extracts traits from element
     * @private
     */
    _extractTraits(tempDiv) {
        return Array.from(tempDiv.querySelectorAll('.trait'))
            .map(trait => trait.innerText.trim());
    }

    /**
     * Extracts skills from element
     * @private
     */
    _extractSkills(tempDiv) {
        return Array.from(tempDiv.querySelectorAll('.button-mystery'))
            .map(skill => {
                const skillName = skill.querySelector('b')?.innerText || '';
                const skillValue = skill.querySelector('span')?.innerText || '';
                return `${skillName} ${skillValue}`.trim();
            });
    }

    /**
     * Extracts combat statistics
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
        const abilitiesMatch = tempDiv.innerText.match(
            /Str\s[+-]\d,\sDex\s[+-]\d,\sCon\s[+-]\d,\sInt\s[+-]\d,\sWis\s[+-]\d,\sCha\s[+-]\d/
        );
        return {
            abilities: abilitiesMatch ? abilitiesMatch[0] : ""
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
     * Extracts lore and knowledge information
     * @private
     */
    _extractLoreAndKnowledge(tempDiv) {
        const bElements = tempDiv.querySelectorAll('b');
        return {
            recallKnowledge: bElements[0]?.nextSibling?.nodeValue?.trim() || "",
            unspecificLore: bElements[1]?.nextSibling?.nodeValue?.trim() || "",
            specificLore: bElements[2]?.nextSibling?.nodeValue?.trim() || ""
        };
    }

    /**
     * Helper method to find stat values
     * @private
     */
    _findStatValue(tempDiv, statName) {
        const node = Array.from(tempDiv.querySelectorAll('b'))
            .find(b => b.innerText === statName);
        return node?.nextElementSibling?.innerText.trim() || "";
    }

    /**
     * Helper method to find save values
     * @private
     */
    _findSaveValue(tempDiv, saveName) {
        const node = Array.from(tempDiv.querySelectorAll('.button-mystery'))
            .find(b => b.innerText.includes(saveName));
        return node?.querySelector('span')?.innerText.trim() || "";
    }

    /**
     * Helper method to find stat values with prefix
     * @private
     */
    _findStatValueWithPrefix(tempDiv, prefix) {
        const node = Array.from(tempDiv.querySelectorAll('b'))
            .find(b => b.innerText === prefix);
        return node?.nextSibling?.nodeValue.trim() || "";
    }

    /**
     * Helper method to extract spells
     * @private
     */
    _extractSpells(tempDiv) {
        const spellsNode = Array.from(tempDiv.querySelectorAll('b'))
            .find(b => b.innerText.includes("Spells"));
        return spellsNode ?
            spellsNode.parentNode.innerText.replace(spellsNode.innerText, "").trim() :
            "";
    }
}

export default new CharacterManager();