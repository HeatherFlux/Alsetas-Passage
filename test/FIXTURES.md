# Test Fixtures for Alseta's Passage

These fixtures are based on real-world observations of the Pathbuilder2e interface, specifically examining a Level 1 Leshy Investigator character.

## Basic Character Fixture

```html
<!-- test/fixtures/basic-character.html -->
<!DOCTYPE html>
<html>
<body>
  <!-- Character Header -->
  <div class="character-header">
    <div class="small-text grey-text button-text">Character Name</div>
    <div class="button-selection">Leshy</div>
    <div class="level">1</div>
  </div>

  <!-- Core Stats -->
  <div class="core-stats">
    <div class="ac">17</div>
    <div class="hp">19/19</div>
    <div class="ability-scores">
      <div class="str">+0</div>
      <div class="dex">+2</div>
      <div class="con">+3</div>
      <div class="int">+2</div>
      <div class="wis">+2</div>
      <div class="cha">+0</div>
    </div>
  </div>

  <!-- Class Features -->
  <div class="class-features">
    <div class="strategic-strike">
      <input type="checkbox" id="strategic-strike">
      <label>Strategic Strike: 1d6</label>
    </div>
  </div>
</body>
</html>
```

## Weapon Roll Fixture

```html
<!-- test/fixtures/weapon-roll.html -->
<!DOCTYPE html>
<html>
<body>
  <!-- Weapon Display -->
  <div class="listview-item">
    <div class="listview-title">Dagger</div>
    <div class="listview-detail">
      <div class="trait">Agile</div>
      <div class="trait">Finesse</div>
      <div class="trait">Thrown</div>
      <div class="trait">Versatile S</div>
    </div>
  </div>

  <!-- Roll Interface -->
  <div class="roll-interface">
    <div class="attack-bonus">+5</div>
    <div class="damage">1d4</div>
    <div class="critical-mod">-3</div>
    <div class="special-abilities">
      <div class="strategic-strike">1d6</div>
    </div>
  </div>
</body>
</html>
```

## Skill Check Fixture

```html
<!-- test/fixtures/skill-check.html -->
<!DOCTYPE html>
<html>
<body>
  <!-- Skill Display -->
  <div class="skill-row">
    <div class="skill-name">Medicine</div>
    <div class="skill-modifier">+5</div>
    <div class="proficiency">Trained</div>
  </div>

  <!-- Roll Interface -->
  <div class="roll-interface">
    <div class="modifier">+5</div>
    <div class="roll-type">Skill Check</div>
  </div>
</body>
</html>
```

## Dice History Fixture

```html
<!-- test/fixtures/dice-history.html -->
<!DOCTYPE html>
<html>
<body>
  <!-- Dice History Container -->
  <div id="dice-history">
    <div class="dice-roll">
      <div id="dice-title">Attack Roll</div>
      <div class="roll-result">15</div>
      <div class="roll-modifier">+5</div>
      <div class="special-ability">Strategic Strike: 8</div>
    </div>
  </div>
</body>
</html>
```

## Complete Character Sheet Fixture

```html
<!-- test/fixtures/complete-character.html -->
<!DOCTYPE html>
<html>
<body>
  <!-- Character Info -->
  <div class="character-info">
    <div class="ancestry">Leshy</div>
    <div class="background">Herbalist</div>
    <div class="class">Investigator</div>
    <div class="level">1</div>
  </div>

  <!-- Stats -->
  <div class="stats">
    <div class="ac">17</div>
    <div class="hp">19/19</div>
    <div class="class-dc">15</div>
  </div>

  <!-- Skills -->
  <div class="skills">
    <div class="skill">
      <div class="name">Medicine</div>
      <div class="modifier">+5</div>
    </div>
    <div class="skill">
      <div class="name">Lore: Herbalism</div>
      <div class="modifier">+5</div>
    </div>
  </div>

  <!-- Weapons -->
  <div class="weapons">
    <div class="weapon">
      <div class="name">Dagger</div>
      <div class="attack">+5</div>
      <div class="damage">1d4</div>
    </div>
  </div>
</body>
</html>
```

## Usage Instructions

1. Place these fixtures in the `test/fixtures` directory
2. Use in tests with the JSDOM setup:

```javascript
// test/setup/dom.js
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

export function loadFixture(fixtureName) {
  const fixturePath = path.join(__dirname, '../fixtures', fixtureName);
  const html = fs.readFileSync(fixturePath, 'utf8');
  const dom = new JSDOM(html);
  return dom.window.document;
}
```

3. Use in tests:

```javascript
// test/unit/characterManager.test.js
import { loadFixture } from '../setup/dom';

describe('Character Manager', () => {
  test('extracts character info', () => {
    const doc = loadFixture('complete-character.html');
    const info = characterManager.extractCharacterData(doc);
    expect(info.name).toBe('Leshy');
    expect(info.class).toBe('Investigator');
  });
});
```

These fixtures provide a reliable way to test the extension's functionality without requiring access to the live Pathbuilder2e application.