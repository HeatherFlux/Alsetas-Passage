import { setupDOM, cleanupDOM } from '../setup/dom.js';
import characterManager from '../../chrome/src/modules/characterManager.js';

describe('Character Manager', () => {
    beforeEach(() => {
        setupDOM();
    });

    afterEach(() => {
        cleanupDOM();
    });

    describe('isBetaPage', () => {
        test('detects beta page URL', () => {
            window.location = new URL('https://pathbuilder2e.com/beta/');
            expect(characterManager.isBetaPage()).toBe(true);
        });

        test('detects non-beta page URL', () => {
            window.location = new URL('https://pathbuilder2e.com/app/');
            expect(characterManager.isBetaPage()).toBe(false);
        });
    });

    describe('fetchCharacterName', () => {
        test('extracts character name from DOM', () => {
            document.body.innerHTML = `
        <div class="small-text grey-text button-text">Character Name</div>
        <div class="button-selection">Leshy</div>
      `;
            expect(characterManager.fetchCharacterName()).toBe('Leshy');
        });

        test('returns null when character name not found', () => {
            document.body.innerHTML = '<div>No character name here</div>';
            expect(characterManager.fetchCharacterName()).toBeNull();
        });

        test('handles missing next sibling', () => {
            document.body.innerHTML = `
        <div class="small-text grey-text button-text">Character Name</div>
      `;
            expect(characterManager.fetchCharacterName()).toBeNull();
        });
    });

    describe('fetchDiceTitle', () => {
        test('extracts dice title', () => {
            document.body.innerHTML = `
        <div id="dice-title">Attack Roll</div>
      `;
            expect(characterManager.fetchDiceTitle()).toBe('Attack Roll');
        });

        test('returns empty string when title not found', () => {
            document.body.innerHTML = '<div>No dice title</div>';
            expect(characterManager.fetchDiceTitle()).toBe('');
        });
    });

    describe('extractCharacterData', () => {
        test('extracts basic character info', () => {
            const html = `
        <div class="subtitle">Leshy</div>
        <div class="item-level-box">1</div>
        <div class="trait">Uncommon</div>
        <div class="trait">Plant</div>
      `;

            const data = characterManager.extractCharacterData(html);
            expect(data.name).toBe('Leshy');
            expect(data.level).toBe('1');
            expect(data.traits).toContain('Uncommon');
            expect(data.traits).toContain('Plant');
        });

        test('extracts ability scores', () => {
            const html = `
        <div>Str +0, Dex +2, Con +3, Int +2, Wis +2, Cha +0</div>
      `;

            const data = characterManager.extractCharacterData(html);
            expect(data.abilities).toBe('Str +0, Dex +2, Con +3, Int +2, Wis +2, Cha +0');
        });

        test('extracts skills', () => {
            const html = `
        <div class="button-mystery">
          <b>Medicine</b>
          <span>+5</span>
        </div>
        <div class="button-mystery">
          <b>Nature</b>
          <span>+3</span>
        </div>
      `;

            const data = characterManager.extractCharacterData(html);
            expect(data.skills).toContain('Medicine +5');
            expect(data.skills).toContain('Nature +3');
        });

        test('extracts combat stats', () => {
            const html = `
        <b>AC</b><span>17</span>
        <b>HP</b><span>19</span>
        <div class="button-mystery"><b>Fort</b><span>+6</span></div>
        <div class="button-mystery"><b>Ref</b><span>+7</span></div>
        <div class="button-mystery"><b>Will</b><span>+7</span></div>
      `;

            const data = characterManager.extractCharacterData(html);
            expect(data.ac).toBe('17');
            expect(data.hp).toBe('19');
            expect(data.fort).toBe('+6');
            expect(data.ref).toBe('+7');
            expect(data.will).toBe('+7');
        });

        test('handles missing data gracefully', () => {
            const html = '<div>Minimal character data</div>';
            const data = characterManager.extractCharacterData(html);

            expect(data.name).toBe('');
            expect(data.level).toBe('');
            expect(data.traits).toHaveLength(0);
            expect(data.skills).toHaveLength(0);
        });
    });
});