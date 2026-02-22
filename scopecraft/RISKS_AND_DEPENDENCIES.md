# Risks & Dependencies — @syncupsuite/themes

**Generated**: 2026-02-22

---

## Risk Register

### R1 — BSU theme source data access

**Severity**: Medium
**Likelihood**: Low
**Phase**: 3.2

The 4 BSU production themes (Wiener Werkstatte, Milanese Design, De Stijl, Swiss Modernist) live in the `habitusnet/syncup` monorepo. Iris needs Felix to extract or provide the foundation data (seed colors, cultural metadata). If the themes were created ad-hoc without structured foundation JSON, they may need reverse-engineering.

**Mitigation**: Coordinate with Felix early. Check if BSU themes already follow the foundation JSON schema or need conversion. If conversion is needed, scope as a separate story.

### R2 — npm token expiry

**Severity**: High
**Likelihood**: Certain (date-bound)
**Phase**: All

The npm publish token in Doppler (`syncupsuite-marketplace/prd`) expires **2026-05-21**. If not rotated before expiry, all theme publishing stops.

**Mitigation**: Set calendar reminder for 2026-05-01. Agustin rotates via npm.com + updates Doppler. Document rotation procedure.

### R3 — Playwright snapshot maintenance burden

**Severity**: Medium
**Likelihood**: Medium
**Phase**: 3.1

160 baseline screenshots (20 per theme x 8 themes) create CI fragility. Font rendering differences across OS versions, anti-aliasing changes, or sub-pixel shifts can cause false failures.

**Mitigation**: Use generous threshold (0.1% pixel diff). Consider component-level snapshots (smaller, more stable) over full-page screenshots. Pin CI runner OS version.

### R4 — Tailwind v4 API instability

**Severity**: Low
**Likelihood**: Low
**Phase**: Ongoing

Tailwind v4 is relatively new. The CSS-first `@theme` API could change in minor releases, breaking the semantic color output.

**Mitigation**: Pin Tailwind version in consuming projects. The themes package itself has no Tailwind runtime dependency — it just generates CSS that Tailwind reads. Monitor Tailwind changelog.

### R5 — Community theme quality

**Severity**: Medium
**Likelihood**: Medium
**Phase**: 4.1

Community-contributed themes may not meet the cultural grounding and WCAG standards of the built-in themes. Low-quality themes damage the brand.

**Mitigation**: Registry Phase 2 includes a validation script. Community themes must pass the same pipeline as built-in themes (schema, contrast, completeness, perf budgets). Cultural provenance is reviewed by maintainers before acceptance.

### R6 — Breaking changes in adapter refactor

**Severity**: Medium
**Likelihood**: Low
**Phase**: 3.3

Refactoring transformers to the adapter interface (ADR-006) could break consumers who import internal functions.

**Mitigation**: Preserve existing public function signatures as wrappers. Only internal implementation changes. Bump as minor version, not major.

---

## Dependency Map

### Internal Dependencies

```
@syncupsuite/tokens (leaf — zero deps)
    ↑
@syncupsuite/foundations (depends on tokens)
@syncupsuite/transformers (depends on tokens)
    ↑
@syncupsuite/themes (depends on tokens runtime; foundations + transformers devDependencies)
```

**Build order enforced by Turborepo**: tokens → foundations + transformers (parallel) → themes

### External Dependencies

| Dependency | Used By | Version | Risk |
|-----------|---------|---------|------|
| tsup | All packages | ^8.3.0 | Low — stable build tool |
| vitest | All packages | ^4.0.18 | Low — test runner |
| typescript | All packages | ^5.7.0 | Low — strict mode locked |
| pnpm | Monorepo | 9.15.4 | Low — pinned |
| Turborepo | Monorepo | 2.8.9 | Low — cache layer only |

No runtime dependencies in any published package (zero-dep design).

### Cross-Repo Dependencies

| Dependency | Direction | Notes |
|-----------|-----------|-------|
| `habitusnet/syncup` (BSU/LSU) | Consumes themes | BSU has 4 themes not yet in npm; LSU adopted via gt-tk001 |
| `syncupsuite/webplatform4sync` | Documents themes | Theme contribution guide, `diagnose-tokens` subcommand |
| `syncupsuite/syncupsuite-com` | Showcases themes | ThemePreview component uses swiss-international |
| `syncupsuite/hn-platform4sync` | References themes | Stack conventions reference themes package |

### Blocked-By Relationships

| Item | Blocked By | Status |
|------|-----------|--------|
| BSU theme absorption (3.2) | Felix providing source data | Not started |
| Registry Phase 2 (4.1) | Phase 3 complete | Vision |
| Tier stacking (4.2) | Phase 3 complete + BrandSyncUp integration | Vision |
| Community themes | Registry Phase 2 + CONTRIBUTING.md | Vision |
