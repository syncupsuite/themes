# Changelog

All notable changes to the `@syncupsuite/themes` monorepo packages.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0).

All four packages (`@syncupsuite/tokens`, `@syncupsuite/foundations`, `@syncupsuite/transformers`, `@syncupsuite/themes`) are versioned and released together.

---

## [Unreleased]

### Planned (non-breaking)
- Per-theme subpath bundle splitting (`@syncupsuite/themes/swiss-international`, `@syncupsuite/themes/nihon-traditional`) for tree-shakeable imports
- assertHex support for 3-digit and 8-digit hex (currently 6-digit only)

---

## [0.2.0] — 2026-02-19

**Breaking change**: All generated token color values change due to OKLCH color math migration. CSS output hex values differ from 0.1.x for all non-seed color steps (50–900 and neutrals). Seed colors at step 500 are preserved exactly.

### Changed — Breaking

- **`@syncupsuite/foundations`**: `generateLightnessScale` and `generateNeutrals` now use OKLCH color math (ADR-001). Perceptually uniform lightness scales across all hues. Equal numeric steps in OKLCH lightness produce equal perceived brightness changes — HSL does not have this property.
  - Lightness is interpolated outward from the seed: lighter steps (50–400) interpolate toward L=0.97; darker steps (600–900) interpolate toward L=0.12. This guarantees monotonically ordered scales regardless of where the seed's native lightness falls.
  - Chroma scales proportionally: reduced at light extremes (0.25× at step 50, rising to 1× at step 400); reduced at dark extremes (falling to 0.6× at step 900).
  - Seed hex is preserved exactly at step 500.
  - Neutral chroma: 8% of seed chroma, clamped to 0.01–0.04, producing soft hue-tinted neutrals.

- **`@syncupsuite/themes`**: Swiss International and Nihon Traditional CSS files regenerated with OKLCH-computed values. All `--primitive-color-*` hex values change. Semantic token names, structure, and `var()` references are unchanged.

### Added

- **`@syncupsuite/foundations`**: `hexToOklch(hex) → OKLCH` and `oklchToHex(oklch) → string` exported from `@syncupsuite/foundations`.
- **`@syncupsuite/foundations`**: `OKLCH` type exported alongside existing `HSL`.
- **`@syncupsuite/foundations`**: 20 new tests for OKLCH conversion, scale monotonicity, gamut clipping, hue preservation, and neutral chroma bounds. Foundations package: 35 → 55 tests.
- **ADR-007 Phase 1** (non-breaking, also in this release): filesystem auto-discovery in `scripts/generate-themes.ts`. Adding theme 3 = drop JSON in `packages/foundations/data/`, run `pnpm generate`. Touch points: 6 → 1.

### Deprecated

- `hexToHsl` and `hslToHex` in `@syncupsuite/foundations` — retained for backward compatibility, marked `@deprecated`. Use `hexToOklch` / `oklchToHex` for new code.

### Migration guide for 0.1.x consumers

If you use `@syncupsuite/themes` **CSS imports only** (most users): update `npm install @syncupsuite/themes@0.2.0` and regenerate any visual snapshots. Token names and semantic structure are unchanged — only color values.

If you use `@syncupsuite/foundations` to build custom foundations: your generated token values will change after updating. Re-run `buildFoundation()` and update any snapshots that store hex values.

---

## [0.1.1] — 2026-02-18

### Fixed — Critical (P0)

- **`@syncupsuite/transformers`**: Decimal spacing keys (e.g. `0.5`) now produce valid CSS property names. Previously generated `--spacing-0.5` with a literal dot, which is invalid.
- **`@syncupsuite/transformers`**: `@theme --color-*` and `--primitive-color-*` are now correctly connected. In 0.1.0, all semantic `var()` references were broken because the primitive alias layer was missing from the Tailwind v4 output.

### Fixed — Security (P1)

- **`@syncupsuite/tokens`**: `UNSAFE_CSS_VALUE` regex extended to block additional injection patterns: `javascript:`, `data:`, `-moz-binding`, `behavior:`, `;`, `</`.
- **`@syncupsuite/tokens`**: `sanitizeCssValue` was fully bypassed for values containing `{` (token references). New `formatCssValue()` validates all literal segments in reference-containing values.
- **`@syncupsuite/tokens`**: `validateSchema` now rejects empty string `$value` fields.

### Fixed — Architecture

- **`@syncupsuite/themes`**: `@syncupsuite/foundations` and `@syncupsuite/transformers` moved from `dependencies` to `devDependencies`. Consumers no longer pull build-time packages as runtime dependencies.

### Added — Performance

- **`@syncupsuite/themes`**: `sideEffects: false` in `package.json` — enables tree-shaking for bundler consumers.
- **`@syncupsuite/transformers`**: `PERF_BUDGETS` constants are now enforced during theme generation. Build fails if token tree depth or CSS output exceeds budget.

### Added — Architecture Decision Records

Seven ADRs written covering major design decisions (lives in `docs/adr/`):

| ADR | Topic |
|-----|-------|
| ADR-001 | OKLCH Color Scaling (planned migration) |
| ADR-002 | Semantic Layer Isolation |
| ADR-003 | Dark Mode Semantic Inversion |
| ADR-004 | Tier Stacking Governance |
| ADR-005 | CI Snapshot Matrix |
| ADR-006 | Adapter Isolation |
| ADR-007 | Registry Auto-Discovery |

### Added — Tests

112 new tests added (83 → 195, all passing):

| Package | Before | After | New test files |
|---------|--------|-------|----------------|
| `@syncupsuite/tokens` | 21 | 98 | `sanitize-security.test.ts` (45), `validate-references.test.ts` (15), `validate-override-extended.test.ts` (17) |
| `@syncupsuite/foundations` | 35 | 35 | — |
| `@syncupsuite/transformers` | 14 | 49 | `format-integration.test.ts` (22), `tailwind-prefix-regression.test.ts` (13) |
| `@syncupsuite/themes` | 13 | 13 | — |

---

## [0.1.0] — 2026-02-18

Initial public release of all four packages.

### Added — `@syncupsuite/tokens`

- DTCG-aligned TypeScript types: `DTCGToken`, `DTCGTokenGroup`, `DTCGRoot`, `BuiltTheme`, `CulturalFoundation`, `SeedColor`
- Token utilities: `flattenTokens`, `pathToProperty`, `resolveReference`, `walkTokens`, `isToken`
- CSS utilities: `sanitizeCssValue`, `sanitizeCssComment`, `assertHex`, `slugify`
- Validation: `validateSchema`, `validateCompleteness`, `validateContrast`, `validateOverride`, `validateReferences`
- Constants: `PROTECTED_TOKEN_PATHS`, `REQUIRED_SEMANTIC_TOKENS`, `PERF_BUDGETS`

### Added — `@syncupsuite/foundations`

- `buildFoundation()` — full pipeline from cultural foundation data to token tree
- Color engine: `hexToHsl`, `hslToHex`, `generateLightnessScale`, `generateNeutrals`, `getHue`
- Harmony modes: Golden Ratio (default), Complementary, Triadic, Analogous, Monochromatic
- `generateHarmonyAccents()` — derives accent colors from seed using harmony mode
- Typography: `getFontStacks`, `hueToTypographyCategory`, `TYPE_SCALE`, `WEIGHT_SCALE`, `LINE_HEIGHT_SCALE`
- Foundation data: `nihonTraditionalData` (Nihon no Dentou Iro), `swissInternationalData`

### Added — `@syncupsuite/transformers`

- `transformToTailwindV4()` — outputs Tailwind v4 `@theme` block
- `transformToCSS()` — outputs plain CSS custom properties (`:root` selector)

### Added — `@syncupsuite/themes`

- `swissInternational` — Swiss International Style theme
  - Primitive color scales for: Rot, Blau, Gelb, Grün, Grau
  - Light + dark semantic token maps
  - Typography: Inter / Inter (geometric sans)
  - Sharp radius defaults
  - CSS files: `tailwind.css`, `tokens.css`, `tokens.json`, `meta.json`
- `nihonTraditional` — Nihon Traditional (Nihon no Dentou Iro) theme
  - Primitive color scales for: Hanada (indigo), Beni (crimson), Yamabuki (golden yellow), Midori (green), Hai (ash neutral)
  - Light + dark semantic token maps
  - Typography: Noto Serif JP / Noto Sans JP
  - Subtle radius defaults
  - CSS files: `tailwind.css`, `tokens.css`, `tokens.json`, `meta.json`

---

[Unreleased]: https://github.com/syncupsuite/themes/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/syncupsuite/themes/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/syncupsuite/themes/releases/tag/v0.1.0
