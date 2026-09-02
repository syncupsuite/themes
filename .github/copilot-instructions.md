# Copilot Instructions: @syncupsuite/themes

This is a **pnpm monorepo** that transforms culturally-grounded design foundations into production-ready design tokens and theme packages.

## Commands

```bash
# Install (requires pnpm@9.15.4)
pnpm install

# Build, test, lint, typecheck, and clean all packages
pnpm build              # Builds respecting turbo dependency order
pnpm test               # Runs vitest suite for all packages
pnpm typecheck          # Type-check all packages (TypeScript strict mode)
pnpm lint               # Lints all packages (currently no linter configured)
pnpm clean              # Removes all dist/ outputs

# Work with a single package
pnpm --filter @syncupsuite/tokens test
pnpm --filter @syncupsuite/foundations build

# Run a specific test file
pnpm --filter @syncupsuite/tokens exec vitest run src/__tests__/validation.test.ts

# Regenerate all theme assets from foundation data
pnpm generate
```

**Publishing note:** Always use `pnpm publish` (never `npm publish`) — the `workspace:*` protocol in dependencies won't resolve correctly otherwise.

## Architecture Overview

The monorepo consists of four packages in **strict dependency order**:

```
@syncupsuite/tokens          ← DTCG types, validation, utilities (zero deps)
         ↑
@syncupsuite/foundations     ← Color engine (OKLCH), cultural data, typography
@syncupsuite/transformers    ← CSS + Tailwind v4 output generators
         ↑
@syncupsuite/themes          ← Published theme bundles (consumer-facing)
```

Turbo enforces this order: `tokens` must build before `foundations`/`transformers`, which must build before `themes`.

## Theme Generation Pipeline

Adding a new theme requires **one file**: drop a foundation JSON in `packages/foundations/data/`, then run `pnpm generate`.

The generator (`scripts/generate-themes.ts`):
1. **Discovers** all `*.json` files in `packages/foundations/data/`
2. **Validates** required fields: `$name`, `$description`, `$extensions`, `seedColors`
3. **Builds** full DTCG token tree via `buildFoundation()` → produces primitives + semantic tokens
4. **Validates**: schema, WCAG AA contrast (20 token pairs), completeness, performance budgets
5. **Generates** outputs in `packages/themes/src/{slug}/`:
   - `tokens.json` — Complete DTCG token tree
   - `tokens.css` — CSS custom properties (light + dark mode via `[data-theme="dark"]`)
   - `tailwind.css` — Tailwind v4 `@theme` blocks with semantic color API
   - `meta.json` — Cultural story, philosophy, validation results
   - `_css.ts` + `index.ts` — Programmatic access (auto-generated, **do not edit**)
6. **Writes** barrel files: `packages/themes/src/index.ts` and `packages/foundations/src/data.ts`

**Critical:** If any theme fails validation, no barrel files are written and the process exits non-zero.

## Token Architecture

All tokens follow the [DTCG specification](https://tr.designtokens.org/format/) with four layers:

- **Seed colors** — Culturally-sourced hex values with provenance metadata
- **Primitives** — 9-step OKLCH lightness scales per seed + tinted neutrals (`primitive.color.*`)
- **Semantic** — Purpose-mapped tokens for light and dark modes (`semantic.light.*`, `semantic.dark.*`): background, text, interactive, border, status, focus, accessibility
- **Cross-domain** — Typography (font stacks, scale, weights), spacing (8px grid), border radius

The semantic layer uses `{references}` to primitives (e.g., `{primitive.color.hanada.500}`). References are resolved during CSS generation and contrast validation.

## Key Source Files

| File | Role |
|------|------|
| `packages/tokens/src/types.ts` | DTCG type definitions (`DTCGRoot`, `DTCGToken`, `BuiltTheme`, `SeedColor`) |
| `packages/tokens/src/constants.ts` | `CONTRAST_PAIRS` (20 pairs), `REQUIRED_SEMANTIC_TOKENS`, `PERF_BUDGETS`, `PROTECTED_TOKEN_PATHS` |
| `packages/tokens/src/validation.ts` | Schema, completeness, contrast, override, reference validation |
| `packages/tokens/src/utilities.ts` | `flattenTokens()`, `pathToProperty()`, `resolveReference()`, `sanitizeCssValue()` |
| `packages/foundations/src/engine.ts` | `buildFoundation()` — core pipeline: seeds → primitives → semantic → cross-domain |
| `packages/foundations/src/color.ts` | OKLCH color math: `hexToOklch()`, `generateLightnessScale()`, `generateNeutrals()` |
| `packages/transformers/src/tailwind-v4.ts` | Tailwind v4 output with `SEMANTIC_COLOR_MAP` (18 semantic token paths to `--color-*` utilities) |
| `packages/transformers/src/css.ts` | Plain CSS output with API contract banner |
| `scripts/generate-themes.ts` | File-system auto-discovery theme generator |

## Key Conventions

### Semantic Color API (Tailwind v4)

`SEMANTIC_COLOR_MAP` in `packages/transformers/src/tailwind-v4.ts` maps 18 semantic token paths to Tailwind `--color-*` utilities. This enables classes like:
- `bg-canvas`, `bg-surface`
- `text-foreground`, `text-muted`
- `bg-primary`, `hover:bg-primary-hover`
- `border-border`, `ring-ring`
- `text-error`, `text-success`, `text-warning`

Dark mode works automatically — `var(--background-canvas)` resolves via `:root` (light) or `[data-theme="dark"]` (dark).

### Dark Primary Handling

Themes with very dark primary colors (L < 0.2 in OKLCH, e.g., `nihon-minimal`, `shuimo-modern`) trigger `selectDarkInteractiveId()` in the engine. It picks the most chromatic seed color for dark mode interactive elements instead of the primary, ensuring sufficient contrast.

### Auto-generated Files

**Never edit** `_css.ts` and `index.ts` in theme directories — these are auto-generated by `pnpm generate`. Edit the foundation JSON in `packages/foundations/data/` instead.

### Build Configuration

- **TypeScript**: strict mode, `ES2022` target, `bundler` module resolution (`tsconfig.base.json`)
- **tsup**: Dual ESM + CJS output with declarations and sourcemaps
- **vitest**: Test runner (no shared config — each package uses defaults)
- **turbo**: `build` depends on `^build`, `test` depends on `build`
- **No linter** configured (no eslint/biome)

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
