# Metrics & PMF — @syncupsuite/themes

**Generated**: 2026-02-22

---

## North Star Metric

**Theme adoption rate**: Number of projects actively consuming `@syncupsuite/themes` from npm.

This measures whether the token pipeline delivers enough value for developers to choose it over manual CSS variables, other token systems, or no design system at all.

---

## Leading Indicators

### L1 — npm weekly downloads

**Target**: 50+ weekly downloads by Stage 3 completion
**Current**: Internal consumption only (BSU, LSU, syncupsuite-com)
**Measurement**: `npm info @syncupsuite/themes` or npm stats API

### L2 — Theme count in package

**Target**: 12 themes (8 built + 4 BSU absorption)
**Current**: 8 themes published (v0.3.1)
**Measurement**: `packages/themes/src/*/meta.json` count

### L3 — Consumer API coverage

**Target**: 100% of semantic tokens exposed via Tailwind @theme
**Current**: 18/18 semantic color mappings shipped (d77d67d)
**Measurement**: SEMANTIC_COLOR_MAP length in tailwind-v4.ts

### L4 — WCAG compliance rate

**Target**: 100% of themes pass all 20 contrast pairs
**Current**: 8/8 themes pass (100%)
**Measurement**: Generator output — `contrast: PASS` for all themes

### L5 — Test coverage health

**Target**: 200+ tests, zero failures
**Current**: 233 tests, all passing
**Measurement**: `pnpm test` output

---

## PMF Signals

### Signal 1 — External usage (strongest signal)

A developer outside SyncupSuite installs `@syncupsuite/themes` and ships a site with it. This is the clearest proof that the token pipeline provides independent value.

**How to detect**: npm download spikes not correlated with internal deploys. GitHub issues from unknown users. Star/fork activity.

### Signal 2 — Community theme contribution

Someone submits a pull request adding a new culturally-grounded theme following the contribution guide. This proves the pipeline is extensible and the docs are sufficient.

**How to detect**: GitHub PRs from external contributors on `syncupsuite/themes`.

### Signal 3 — Marketplace-driven adoption

Developers install the Claude Code marketplace plugin, use the `theme-inspired-tokens` skill, and adopt `@syncupsuite/themes` as a result. The marketplace becomes a discovery channel.

**How to detect**: Correlation between webplatform4sync installs and themes npm downloads. PostHog events on syncupsuite.com marketplace page.

### Signal 4 — Multi-theme usage

A single project uses 2+ themes (e.g., different themes per tenant). This validates the multi-tenant design token model and the semantic abstraction layer.

**How to detect**: GitHub code search for multiple theme imports. Support requests about theme switching.

---

## Anti-Signals (Watch For)

| Anti-signal | What it means | Response |
|------------|---------------|----------|
| Downloads flat despite marketing | Value proposition unclear | Improve docs, add examples, blog post |
| Issues about missing tokens | Semantic API gaps | Add tokens to SEMANTIC_COLOR_MAP |
| Complaints about cultural names | Primitive names confuse consumers | Validate semantic API is front-and-center |
| Themes used but tailwind.css ignored | Consumers prefer raw CSS | Ensure tokens.css is equally documented |
| BSU/LSU not upgrading to latest | Internal friction with pipeline | Investigate upgrade path, coordinate with Felix |

---

## Milestones

| Milestone | Metric | Target | Status |
|-----------|--------|--------|--------|
| Internal adoption | BSU + LSU consuming from npm | 2/2 | Done (LSU via gt-tk001) |
| Theme diversity | 8+ themes in package | 8 | Done (v0.3.1) |
| Consumer API | Semantic Tailwind utilities | 18 mappings | Done (d77d67d) |
| Quality gate | WCAG contrast automated | 20 pairs | Done (851db1d) |
| External adoption | 1 external project | 1 | Pending |
| Community contribution | 1 accepted theme PR | 1 | Pending (needs CONTRIBUTING.md + registry) |
| Scale | 12+ themes | 12 | Pending (BSU absorption) |
