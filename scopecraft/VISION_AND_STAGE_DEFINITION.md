# Vision & Stage Definition — @syncupsuite/themes

**Generated**: 2026-02-22
**Current stage**: Stage 3 (Platform Maturation) — themes-specific work is advanced

---

## Vision

`@syncupsuite/themes` is the canonical design token pipeline for the SyncupSuite orchestration framework. It provides culturally-grounded, WCAG-compliant design tokens that flow from cultural research through a 4-package pipeline into production-ready CSS, Tailwind v4, and programmatic outputs.

In Stage 4, this pipeline becomes the **visual identity infrastructure** for any platform built on the open source framework — not just BrandSyncUp and LegalSyncUp.

---

## Where We Are

### Completed (Stages 1-2 + Stage 3 themes work)

- 4-package pipeline: tokens → foundations + transformers → themes
- 12 culturally-grounded themes published to npm (v0.4.0)
- Semantic Color API — `bg-canvas`, `text-foreground`, `bg-primary` etc. via Tailwind @theme
- WCAG contrast validation (20 critical pairs, all 12 themes pass)
- Auto-discovery generator (ADR-007 Phase 1) — drop JSON, run `pnpm generate`
- Dual CJS+ESM output, TypeScript strict, ES2022
- 233 tests across 4 packages
- 7 accepted ADRs providing strategic direction through Stage 4

### What Remains (themes-specific)

| Item | ADR | Complexity | Stage |
|------|-----|-----------|-------|
| Visual regression testing (Playwright snapshots) | ADR-005 | M | 3 |
| Adapter isolation + flattenRoot API | ADR-006 | M | 3 |
| Absorb 4 BSU production themes | — | M | 3 |
| Mirror CONTRIBUTING.md to themes repo | — | S | 3 |
| Registry Phase 2 (npm package discovery) | ADR-007 | L | 4 |
| Tier stacking (`mergeTokenTrees`) | ADR-004 | L | 4 |
| Tailwind v3 transformer | — | M | 4 |
| JSON + CLI adapters | ADR-006 | M | 4 |
| Registry Phase 3 (HTTP discovery) | ADR-007 | XL | 4 |

---

## Stage Completion Criteria

### Stage 3 — themes (completion target)

- [x] 3+ themes published to npm (12 delivered)
- [x] WCAG contrast validation automated
- [x] Semantic color consumer API for Tailwind
- [x] Theme contribution guide published (webplatform4sync)
- [ ] Visual regression testing baseline (ADR-005)
- [x] BSU production themes absorbed into npm package (v0.4.0, dda439c)
- [ ] CONTRIBUTING.md in themes repo

### Stage 4 — themes (entry criteria)

- [ ] At least one community-contributed theme accepted
- [ ] Registry Phase 2 operational (npm discovery)
- [ ] `mergeTokenTrees` function for T1/T2 tier stacking
- [ ] Framework extraction — themes usable independently of SyncupSuite
