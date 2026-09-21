const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test.describe('Rotom-Calc — load and shell', () => {
  test('loads with Teams tab active by default', async ({ page }) => {
    await gotoApp(page);
    await expect(page).toHaveTitle(/Rotom-Calc/);
    await expect(page.locator('.tab-btn[data-tab="teams"]')).toHaveClass(/active/);
    await expect(page.locator('#view-teams')).toHaveClass(/active/);
  });

  test('all five tabs are present and clickable', async ({ page }) => {
    await gotoApp(page);
    const tabs = ['teams', 'calc', 'bench', 'stats', 'types'];
    for (const tab of tabs) {
      await expect(page.locator(`.tab-btn[data-tab="${tab}"]`)).toBeVisible();
    }
  });
});

test.describe('Rotom-Calc — tab navigation', () => {
  for (const [tab, viewId] of [
    ['calc', '#view-calc'],
    ['stats', '#view-stats'],
    ['types', '#view-types'],
    ['teams', '#view-teams'],
  ]) {
    test(`clicking "${tab}" tab activates ${viewId}`, async ({ page }) => {
      await gotoApp(page);
      await page.locator(`.tab-btn[data-tab="${tab}"]`).click();
      await expect(page.locator(`.tab-btn[data-tab="${tab}"]`)).toHaveClass(/active/);
      await expect(page.locator(viewId)).toHaveClass(/active/);
    });
  }
});

test.describe('Rotom-Calc — team import', () => {
  // A minimal, valid Pokémon Showdown export — enough to exercise the parser
  // without depending on any specific format/mod being loaded.
  const SAMPLE_EXPORT = `Landorus-Therian @ Choice Scarf
Ability: Intimidate
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- U-turn
- Stone Edge
- Stealth Rock`;

  test('pasting a Showdown export and importing adds a Pokémon to My Team', async ({ page }) => {
    await gotoApp(page);

    await expect(page.locator('#countMine')).toHaveText('0 / 12');

    await page.locator('#pasteMine').fill(SAMPLE_EXPORT);
    await page.locator('#importMine').click();

    // Count should move off "0 / 12" once the import parses successfully.
    await expect(page.locator('#countMine')).not.toHaveText('0 / 12');
    await expect(page.locator('#listMine')).toContainText('Landorus');
  });

  test('Opponent team import is independent of My Team', async ({ page }) => {
    await gotoApp(page);

    await page.locator('#pasteOpp').fill(SAMPLE_EXPORT);
    await page.locator('#importOpp').click();

    await expect(page.locator('#countOpp')).not.toHaveText('0 / 12');
    await expect(page.locator('#countMine')).toHaveText('0 / 12');
  });
});

test.describe('Rotom-Calc — settings panel', () => {
  test('opens settings and shows budget/cap fields', async ({ page }) => {
    await gotoApp(page);
    await page.locator('#btnSettings').click();
    await expect(page.locator('#settingsPanel')).toBeVisible();
    await expect(page.locator('#setBudget')).toHaveValue('66');
    await expect(page.locator('#setCap')).toHaveValue('32');
  });
});
