# Rotom-Calc

Single-file HTML app — a Champions-format Pokémon draft calculator and battle
planning tool (damage calc, benchmarks, stat comparison, type matchups). All
logic is client-side JS embedded directly in `index.html`. No build step, no
bundler, no server-side code.

## Repo layout

```
index.html              — the entire app (HTML + CSS + JS, one file)
playwright.config.js     — Playwright config, loads index.html via file://
tests/helpers.js         — gotoApp() navigation helper
tests/rotom-calc.spec.js — the test suite
package.json / package-lock.json
.gitignore               — excludes node_modules/, test-results/, playwright-report/, desktop.ini
Archive/                 — not currently tracked in git (untracked, intentionally left out so far)
```

## Testing — a Playwright harness already exists here

**Do not scaffold a new test setup from scratch.** `playwright.config.js` and
`tests/` are already committed. Read `tests/rotom-calc.spec.js` before writing
new tests, both to match its style and to avoid duplicating existing coverage.

Setup (only needed once per machine):
```powershell
npm install
npx playwright install chromium
```

Run tests:
```powershell
npx playwright test
```

The app is loaded via `file://` (see `tests/helpers.js` — `gotoApp()`), not a
dev server, since it's a single static file with no relative asset fetches. If
assets are ever split out of `index.html`, this will need to switch to a real
`webServer` + `baseURL` setup, since `file://` pages can't fetch relative
resources under Chromium's default security model.

## Known gotchas

- **The "Benchmarks" nav tab is intentionally hidden at runtime.** The app has
  a `UNIFIED_DC_BM` build flag; when set, the standalone Benchmarks button
  (`.tab-btn[data-tab="bench"]`) is hidden via `style.display = 'none'` and its
  functionality is folded into the Damage Calculator tab as a sub-tab instead
  — the Calculator button's label also changes to "Calculators" in that case.
  This is expected app behavior, not a bug. A test asserting all 5 nav buttons
  are visible will fail for this reason (see the two tests at the top of
  `tests/rotom-calc.spec.js` that document and test this explicitly).
- **PowerShell on this machine is Windows PowerShell 5.1, not pwsh 7+.**
  `&&` command chaining is NOT valid syntax here and will throw a parser
  error. Use separate lines or `;` instead.
- **`claude` CLI PATH:** native install puts `claude.exe` in
  `C:\Users\mpanz\.local\bin`, which may need to be added to the user PATH
  manually and the terminal restarted before `claude` is recognized as a
  command.
- Git identity (`user.name`/`user.email`) is already configured globally on
  this machine — no need to reconfigure per-repo.

## Conventions

- Don't rename working variables or introduce new ones unprompted — match
  existing naming/structure when editing `index.html`.
- Keep test IDs/selectors matched to the actual DOM (`#pasteMine`,
  `#importMine`, `#countMine`, etc.) rather than inventing new hooks — the app
  wasn't built with test IDs in mind, so tests target real production
  selectors.
