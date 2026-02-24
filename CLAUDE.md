# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A pnpm monorepo that builds culturally-grounded design token themes. Foundation JSON files (seed colors + cultural metadata) are processed through a pipeline that produces DTCG token trees, CSS custom properties, and Tailwind v4 `@theme` blocks. The published npm package is `@syncupsuite/themes`.

## Commands

```bash
pnpm install            # Install (requires pnpm@9.15.4)
pnpm build              # Build all packages (turbo, respects dependency order)
pnpm test               # Run all tests (vitest via turbo)
pnpm generate           # Regenerate all theme assets from foundation data
pnpm typecheck          # Type-check all packages
pnpm lint               # Lint all packages
pnpm clean              # Remove all dist/ outputs

# Single package
pnpm --filter @syncupsuite/tokens test
pnpm --filter @syncupsuite/foundations build

# Single test file
pnpm --filter @syncupsuite/tokens exec vitest run src/__tests__/validation.test.ts

# Publishing (requires NPM_TOKEN via Doppler)
doppler run --project syncupsuite-marketplace --config prd -- pnpm --filter @syncupsuite/themes publish --no-git-checks
doppler run --project syncupsuite-marketplace --config prd -- pnpm --filter @syncupsuite/transformers publish --no-git-checks
```

**Always use `pnpm publish`**, never `npm publish` — the `workspace:*` protocol in dependencies won't resolve correctly otherwise.

## Package Dependency Graph

```
@syncupsuite/tokens         ← DTCG types, utilities, validation, constants (zero deps)
       ↑
@syncupsuite/foundations    ← Color engine (OKLCH), cultural data, typography
@syncupsuite/transformers   ← CSS + Tailwind v4 output generators
       ↑
@syncupsuite/themes         ← Published theme bundles (consumer package)
```

Turbo enforces build order: tokens must build before foundations/transformers, which must build before themes.

## Theme Generation Pipeline

Adding a new theme requires **one file**: drop a foundation JSON in `packages/foundations/data/`, then run `pnpm generate`.

The generator (`scripts/generate-themes.ts`) auto-discovers all `*.json` files in `packages/foundations/data/` and for each:

1. Validates foundation data (required fields: `$name`, `$description`, `$extensions`, `seedColors`)
2. Calls `buildFoundation()` → produces full DTCG token tree + metadata
3. Validates: schema, WCAG AA contrast (20 pairs), completeness, performance budgets
4. Generates outputs in `packages/themes/src/{slug}/`:
   - `tokens.json` — complete DTCG token tree
   - `tokens.css` — CSS custom properties (light + dark mode via `[data-theme="dark"]`)
   - `tailwind.css` — Tailwind v4 `@theme` blocks (primitives + semantic color API)
   - `meta.json` — cultural story, philosophy, validation results
   - `_css.ts` + `index.ts` — programmatic access (auto-generated, do not edit)
5. Writes barrel files: `packages/themes/src/index.ts` and `packages/foundations/src/data.ts`

**If any theme fails validation, no barrel files are written and the process exits non-zero.**

## Token Architecture

Tokens follow the [DTCG specification](https://tr.designtokens.org/format/) with four layers:

- **Seed colors** — culturally-sourced hex values with provenance metadata
- **Primitives** — 9-step OKLCH lightness scales per seed + tinted neutrals (`primitive.color.*`)
- **Semantic** — Purpose-mapped tokens for light and dark modes (`semantic.light.*`, `semantic.dark.*`): background, text, interactive, border, status, focus, accessibility
- **Cross-domain** — Typography (font stacks, scale, weights), spacing (8px grid), border radius

The semantic layer uses `{references}` to primitives (e.g., `{primitive.color.hanada.500}`). References are resolved during CSS generation and contrast validation.

## Semantic Color API (Tailwind)

`SEMANTIC_COLOR_MAP` in `packages/transformers/src/tailwind-v4.ts` maps 18 semantic token paths to Tailwind `--color-*` utilities. This enables classes like `bg-canvas`, `text-foreground`, `bg-primary`, `hover:bg-primary-hover`, `border-border`, `ring-ring`, `text-error`. Dark mode works automatically — `var(--background-canvas)` resolves via `:root` or `[data-theme="dark"]`.

## Key Source Files

| File | Role |
|------|------|
| `packages/tokens/src/types.ts` | DTCG type definitions (`DTCGRoot`, `DTCGToken`, `BuiltTheme`, `SeedColor`) |
| `packages/tokens/src/constants.ts` | `CONTRAST_PAIRS` (20 pairs), `REQUIRED_SEMANTIC_TOKENS`, `PERF_BUDGETS`, `PROTECTED_TOKEN_PATHS` |
| `packages/tokens/src/validation.ts` | Schema, completeness, contrast, override, reference validation |
| `packages/tokens/src/utilities.ts` | `flattenTokens()`, `pathToProperty()`, `resolveReference()`, `sanitizeCssValue()` |
| `packages/foundations/src/engine.ts` | `buildFoundation()` — the core pipeline: seeds → primitives → semantic → cross-domain |
| `packages/foundations/src/color.ts` | OKLCH color math: `hexToOklch()`, `generateLightnessScale()`, `generateNeutrals()` |
| `packages/transformers/src/tailwind-v4.ts` | Tailwind v4 CSS output with `SEMANTIC_COLOR_MAP` |
| `packages/transformers/src/css.ts` | Plain CSS output with API contract banner |
| `scripts/generate-themes.ts` | File-system auto-discovery generator |

## Build Configuration

- **TypeScript**: strict mode, `ES2022` target, `bundler` module resolution (`tsconfig.base.json`)
- **tsup**: dual ESM + CJS output with declarations and sourcemaps
- **vitest**: test runner (no shared config file — each package uses defaults)
- **turbo**: `build` depends on `^build`, `test` depends on `build`
- No linter configured (no eslint/biome)

## Current Themes (12)

swiss-international, nihon-traditional, nordic-modern, tang-imperial, shuimo-modern, nihon-minimal, renaissance, art-deco, de-stijl, milanese-design, swiss-modernist, wiener-werkstaette

## ADRs

| ADR | Title | Status |
|-----|-------|--------|
| ADR-001 | OKLCH Color Scaling | Accepted |
| ADR-002 | Semantic Layer Isolation | Accepted |
| ADR-003 | Dark Mode via Semantic Inversion | Accepted |
| ADR-004 | Tier Stacking Governance | Accepted (deferred) |
| ADR-005 | CI Snapshot Matrix | Accepted |
| ADR-006 | Adapter Isolation | Accepted |
| ADR-007 | Registry Auto-Discovery | Accepted (Phase 1 done) |

## Dark-Primary Theme Handling

Themes with very dark primary colors (L < 0.2 in OKLCH, e.g., nihon-minimal, shuimo-modern) trigger `selectDarkInteractiveId()` in the engine. It picks the most chromatic seed color for dark mode interactive elements instead of the primary, ensuring sufficient contrast.
