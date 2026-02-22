# Roadmap — @syncupsuite/themes

**Generated**: 2026-02-22
**Phases**: 4 (2 complete, 1 active, 1 vision)

---

## Phase 1 — Pipeline Foundation [COMPLETE]

**Goal**: Establish the 4-package architecture and build tooling.

- [x] `@syncupsuite/tokens` — DTCG types, validation, utilities
- [x] `@syncupsuite/foundations` — color engine (OKLCH), cultural data, semantic builder
- [x] `@syncupsuite/transformers` — CSS + Tailwind v4 output generators
- [x] `@syncupsuite/themes` — consumer package with subpath exports
- [x] Monorepo: pnpm + Turborepo, tsup (dual CJS+ESM), TypeScript strict
- [x] 2 themes: swiss-international, nihon-traditional
- [x] Published to npm as `@syncupsuite` scope

---

## Phase 2 — Theme Library & Consumer API [COMPLETE]

**Goal**: Expand theme catalog, add quality gates, make themes consumable by Tailwind sites.

- [x] 6 new themes: nordic-modern, tang-imperial, shuimo-modern, nihon-minimal, renaissance, art-deco (gt-pm002, c581a84)
- [x] WCAG contrast validation — 20 critical pairs, all 8 themes pass (gt-pg004, 851db1d)
- [x] Semantic Color API — SEMANTIC_COLOR_MAP in tailwind-v4.ts (d77d67d)
  - `bg-canvas`, `bg-surface`, `text-foreground`, `bg-primary`, `border-border`, `ring-ring` etc.
- [x] CSS API contract banner in tokens.css output
- [x] Auto-discovery generator (ADR-007 Phase 1)
- [x] Published: themes@0.3.1, transformers@0.2.1

---

## Phase 3 — Quality & Developer Experience [ACTIVE]

**Goal**: Production-grade quality gates, complete theme catalog, developer onboarding.

### 3.1 — Visual Regression Testing (ADR-005)

Implement Playwright snapshot matrix for all 8 themes. 20 snapshots per theme covering key UI patterns (buttons, cards, forms, typography, status indicators). Enforced at build time.

### 3.2 — BSU Theme Absorption

Port the 4 themes running in BrandSyncUp production into the npm package:
- Wiener Werkstatte
- Milanese Design
- De Stijl
- Swiss Modernist

Each needs cultural provenance, seed color documentation, and WCAG validation through the standard pipeline.

### 3.3 — Adapter Isolation (ADR-006)

Refactor transformers to operate on a flat token list via `flattenRoot()`. Implement the adapter interface so new output formats can be added without touching core logic. Target: CSS, Tailwind v4, JSON, CLI adapters.

### 3.4 — Developer Onboarding

- Mirror CONTRIBUTING.md from webplatform4sync to themes repo
- Refresh root README with all 8 themes, semantic color API docs, dark mode guide
- Per-package README updates reflecting current API surface

---

## Phase 4 — Ecosystem Extensibility [VISION]

**Goal**: Enable community themes, tier stacking, and framework independence.

### 4.1 — Registry Phase 2 (ADR-007)

npm package discovery — themes published as separate `@syncupsuite/theme-*` packages are auto-discovered and registered. Enables community contribution without monorepo access.

### 4.2 — Tier Stacking (ADR-004)

Implement `mergeTokenTrees()` for T0/T1/T2 override hierarchy. T0 (platform) sets protected tokens (accessibility floor). T1 (partner) applies brand overrides. T2 (customer) fine-tunes within policy constraints.

### 4.3 — Additional Adapters

- Tailwind v3 transformer (for projects not yet on v4)
- JSON flat output for Style Dictionary consumers
- CLI adapter for quick theme inspection

### 4.4 — Registry Phase 3 (ADR-007)

HTTP registry for theme discovery — enables cross-organization theme sharing and marketplace integration.

---

## Timeline View

```
Phase 1 ████████████████  COMPLETE (v0.1.x – v0.2.0)
Phase 2 ████████████████  COMPLETE (v0.2.1 – v0.3.1)
Phase 3 ████░░░░░░░░░░░░  ACTIVE
Phase 4 ░░░░░░░░░░░░░░░░  VISION (post Stage 3 success)
```
