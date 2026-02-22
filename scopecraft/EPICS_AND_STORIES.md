# Epics & Stories — @syncupsuite/themes

**Generated**: 2026-02-22
**Scope**: Phase 3 (active) and Phase 4 (vision)

---

## Epic 1: Visual Regression Testing

**ADR**: ADR-005 (CI Snapshot Matrix)
**Phase**: 3.1
**Complexity**: M
**Owner**: Iris

### Story 1.1 — Playwright test harness

Set up Playwright in the themes monorepo with a minimal HTML test page that renders theme tokens as visual components (buttons, cards, forms, text, status badges).

**Acceptance criteria**:
- Playwright config in `packages/themes/playwright.config.ts`
- Test page in `packages/themes/tests/visual/` that renders all semantic token categories
- Page accepts `?theme=swiss-international` query param to load different themes
- Runs headless in CI

### Story 1.2 — Snapshot baseline for all 12 themes

Capture baseline screenshots for all 12 themes (20 snapshots each = 240 total).

**Acceptance criteria**:
- 20 snapshot scenarios per theme (backgrounds, text hierarchy, interactive states, borders, status colors, focus rings, dark mode variants)
- Baselines committed to `packages/themes/tests/visual/__snapshots__/`
- `pnpm test:visual` script runs comparison
- CI fails on pixel drift beyond threshold (configurable)

### Story 1.3 — Performance budget enforcement at build time

Integrate performance budget checks into the generator so they fail the build (not just warn).

**Acceptance criteria**:
- Generator exits with non-zero code if `maxCssGzipped` or `maxProperties` exceeded
- Current budgets: 20,480B gzipped, 500 properties
- Budget overrides per-theme configurable in foundation JSON

---

## Epic 2: BSU Theme Absorption

**Phase**: 3.2
**Complexity**: M
**Owner**: Iris (coordination with Felix for source data)

### Story 2.1 — Extract BSU production theme data

Extract foundation JSON for the 4 BSU production themes from the monorepo source. Each needs cultural provenance documentation and seed color verification.

**Acceptance criteria**:
- Foundation JSON files for: wiener-werkstatte, milanese-design, de-stijl, swiss-modernist
- Cultural story fields populated in each foundation
- Seed colors trace to verifiable cultural references

### Story 2.2 — Pipeline integration and validation

Run the 4 new themes through the standard pipeline: `pnpm generate` → schema → contrast → completeness → perf budgets.

**Acceptance criteria**:
- All 4 themes pass schema validation
- All 4 themes pass 20 WCAG AA contrast pairs
- All 4 themes pass completeness check
- All 4 themes within performance budgets
- Total theme count: 12

### Story 2.3 — Publish patch release

Bump `@syncupsuite/themes` and publish with 12 themes.

**Acceptance criteria**:
- Version bump (patch or minor as appropriate)
- `pnpm publish` via Doppler
- npm listing shows 12 themes in package contents

---

## Epic 3: Adapter Isolation

**ADR**: ADR-006 (Adapter Isolation)
**Phase**: 3.3
**Complexity**: M
**Owner**: Iris

### Story 3.1 — Implement `flattenRoot()` API

Create a function in `@syncupsuite/tokens` that flattens a `DTCGRoot` into a flat token list that adapters consume.

**Acceptance criteria**:
- `flattenRoot(tokens: DTCGRoot): FlatToken[]` exported from tokens package
- Each FlatToken has: `path`, `value`, `type`, `description`, `extensions`
- References resolved to final values
- Unit tests for all token types (color, dimension, fontFamily)

### Story 3.2 — Define adapter interface

Create a TypeScript interface that all output adapters implement.

**Acceptance criteria**:
- `Adapter` interface: `transform(tokens: FlatToken[], options: AdapterOptions): string`
- Existing `transformToCSS` and `transformToTailwindV4` refactored to implement the interface
- No breaking changes to public API (existing function signatures preserved as wrappers)

### Story 3.3 — JSON adapter

Implement a JSON output adapter that produces a flat key-value map suitable for Style Dictionary or other tooling.

**Acceptance criteria**:
- `transformToJSON(tokens: DTCGRoot, options?): string` exported
- Output is `{ "--background-canvas": "#FBF8F1", ... }` flat map
- Includes both light and dark mode tokens
- Tests covering all token types

---

## Epic 4: Developer Onboarding

**Phase**: 3.4
**Complexity**: S
**Owner**: Iris

### Story 4.1 — CONTRIBUTING.md in themes repo

Mirror the theme contribution guide from webplatform4sync to themes/CONTRIBUTING.md. Adapt for direct contributor context (foundation JSON structure, pnpm generate workflow, validation requirements).

**Acceptance criteria**:
- `CONTRIBUTING.md` at themes repo root
- Documents: foundation JSON format, seed color requirements, cultural provenance, validation pipeline
- References ADR-001 (OKLCH), ADR-002 (semantic isolation), ADR-003 (dark mode)

### Story 4.2 — README refresh

Update root README and per-package READMEs to reflect current state (12 themes, Semantic Color API, dark mode, Tailwind integration).

**Acceptance criteria**:
- Root README lists all 12 themes with descriptions
- Semantic color API usage examples (`bg-canvas`, `text-foreground`, etc.)
- Dark mode section (`[data-theme="dark"]`)
- Per-package READMEs accurate for current exports

---

## Epic 5: Registry Phase 2 (npm Discovery)

**ADR**: ADR-007 Phase 2
**Phase**: 4.1
**Complexity**: L
**Owner**: Iris

### Story 5.1 — npm package convention for community themes

Define naming convention and package structure for community theme packages (`@syncupsuite/theme-*` or `syncupsuite-theme-*`).

**Acceptance criteria**:
- Naming convention documented
- Required package.json fields defined (keywords, main/exports)
- Validation script that checks community packages against schema
- Template package for contributors

### Story 5.2 — Registry discovery function

Implement registry that discovers installed theme packages via `node_modules` scanning or package.json dependencies.

**Acceptance criteria**:
- `discoverThemes()` function exported from themes package
- Finds all packages matching naming convention
- Returns unified theme manifest with metadata
- Works in both Node.js and edge runtime contexts

---

## Epic 6: Tier Stacking

**ADR**: ADR-004 (Tier Stacking Governance)
**Phase**: 4.2
**Complexity**: L
**Owner**: Iris (coordination with Felix for BrandSyncUp integration)

### Story 6.1 — `mergeTokenTrees()` function

Implement the token merge function that applies T1/T2 overrides to a T0 base while respecting protected token paths.

**Acceptance criteria**:
- `mergeTokenTrees(base: DTCGRoot, overrides: Partial<DTCGRoot>, tier: 'T1' | 'T2'): DTCGRoot`
- Protected tokens (accessibility constraints) cannot be overridden at any tier
- T2 overrides cannot modify T1-locked tokens
- `$extensions.syncupsuite.protected` flag respected
- Comprehensive tests for override hierarchy, protection enforcement, edge cases

### Story 6.2 — Tier stacking validation

Add validation that ensures merged token trees still pass WCAG contrast requirements.

**Acceptance criteria**:
- `validateMergedTheme()` runs contrast checks on the merged output
- Provides clear error messages identifying which override broke which constraint
- Integrated into generator as optional merge step
