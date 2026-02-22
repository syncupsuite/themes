# Open Questions — @syncupsuite/themes

**Generated**: 2026-02-22

---

## Q1 — BSU theme data format

**Priority**: Medium
**Blocks**: Epic 2 (BSU Theme Absorption)
**Owner**: Iris + Felix

Do the 4 BSU production themes (Wiener Werkstatte, Milanese Design, De Stijl, Swiss Modernist) follow the foundation JSON schema used by the themes pipeline? Or were they created with a different format (e.g., raw CSS variables, Style Dictionary config) that needs conversion?

**Resolution path**: Felix inspects `habitusnet/syncup/su-brandsyncup-com/` for theme data format. If conversion is needed, Iris scopes a conversion story.

**Status**: Resolved (2026-02-22). All 4 BSU themes were converted to foundation JSON and absorbed via the standard pipeline (commit dda439c, published in v0.4.0). The BSU DTCG files were OUTPUT format; seed colors, harmony mode, radius, and typography were reverse-engineered into foundation JSON INPUT format.

---

## Q2 — Visual regression CI runner

**Priority**: Low
**Blocks**: Epic 1 (Visual Regression Testing)
**Owner**: Iris

Which CI environment should run Playwright visual tests? GitHub Actions runners have different font rendering between Ubuntu versions. Font differences cause false snapshot failures.

**Options**:
- A) Pin to `ubuntu-22.04` and accept minor rendering differences
- B) Use Docker container with exact font stack
- C) Use Percy/Chromatic cloud service (adds cost)

**Recommended**: Option A — simplest, sufficient for token-level visual validation. Pixel threshold handles minor OS differences.

---

## Q3 — Community theme naming convention

**Priority**: Low
**Blocks**: Epic 5 (Registry Phase 2)
**Owner**: Iris

Should community themes use scoped packages (`@syncupsuite/theme-*`) or unscoped (`syncupsuite-theme-*`)? Scoped keeps them in the org namespace but requires npm org membership. Unscoped is open but risks namespace squatting.

**Resolution path**: Decide during Phase 4 planning. Consider npm org team invitation workflow vs. keyword-based discovery.

---

## Q4 — Tailwind v3 transformer priority

**Priority**: Low
**Blocks**: Nothing currently
**Owner**: Iris

Stage 3 docs mention a Tailwind v3 transformer for projects not yet on v4. Is there actual demand? Tailwind v4 has been stable since late 2025. Building a v3 transformer adds maintenance burden for a shrinking audience.

**Resolution path**: Monitor npm download patterns and GitHub issues. Only build if explicit demand surfaces. The plain CSS output (`tokens.css`) already works universally.

---

## Q5 — Theme bundle splitting

**Priority**: Low
**Blocks**: Performance at scale
**Owner**: Iris

Stage 4 docs mention per-theme bundle splitting. Currently `@syncupsuite/themes` bundles all 12 themes into a single package (677KB ESM, 408KB compressed tarball). Should themes be split into individual packages, or is tree-shaking sufficient?

**Measured at 12 themes (2026-02-22)**:
- ESM bundle: 677KB (`dist/index.js`)
- CJS bundle: 678KB (`dist/index.cjs`)
- Published tarball: 408KB (`.tgz`)
- Total dist (uncompressed): 3.1MB (includes source maps + type declarations)

**Resolution path**: Total dist is well under 1MB for the published JS. The 3.1MB uncompressed includes source maps. Tree-shaking already works for programmatic access; CSS/JSON files are per-theme via subpath exports. No split needed yet. Re-evaluate if theme count exceeds 20.
