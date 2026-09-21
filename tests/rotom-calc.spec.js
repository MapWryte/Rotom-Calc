const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test.describe('Rotom-Calc — load and shell', () => {
  test('loads with Teams tab active by default', async ({ page }) => {
    await gotoApp(page);
    await expect(page).toHaveTitle(/Rotom-Calc/);
    await expect(page.locator('.tab-btn[data-tab="teams"]')).toHaveClass(/active/);
    await expect(page.locator('#view-teams')).toHaveClass(/active/);
  });

  test('visible nav tabs are present and clickable', async ({ page }) => {
    await gotoApp(page);
    // "bench" is intentionally excluded: in the unified-DC-BM build the app hides
    // the standalone Benchmarks nav button at runtime and folds it into the
    // Damage Calculator tab as a sub-tab instead (see the app's own UNIFIED_DC_BM
    // branch). Asserting it's visible here would be testing against a build
    // configuration the app doesn't currently ship with.
    const tabs = ['teams', 'calc', 'stats', 'types'];
    for (const tab of tabs) {
      await expect(page.locator(`.tab-btn[data-tab="${tab}"]`)).toBeVisible();
    }
  });

  test('Benchmarks nav button is hidden, folded into the Calculator tab', async ({ page }) => {
    await gotoApp(page);
    await expect(page.locator('.tab-btn[data-tab="bench"]')).toBeHidden();
    // When folded in, the Calculator tab is relabeled "Calculators" to reflect
    // that it now covers multiple sub-tabs (Damage Spreads, Full Matchup, Speed
    // Check, To KO, To Survive — Benchmarks among them).
    await expect(page.locator('.tab-btn[data-tab="calc"]')).toHaveText('Calculators');
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
