# @syncupsuite/themes

**Worry-free design super-powers.**

One import. Your app gets a complete, culturally-grounded design identity — colors, typography, spacing, dark mode, accessibility-ready tokens. You pick a theme with a story. You don't hire a designer.

## Quick Start

```bash
npm install @syncupsuite/themes
```

### With Tailwind v4

```css
/* app.css */
@import "@syncupsuite/themes/swiss-international/tailwind.css";
```

### With plain CSS

```css
/* app.css */
@import "@syncupsuite/themes/swiss-international/tokens.css";
```

### Programmatic access

```typescript
import { swissInternational } from '@syncupsuite/themes'

// Full token tree (DTCG format)
console.log(swissInternational.tokens)

// Pre-built CSS string
console.log(swissInternational.css)

// Foundation metadata and cultural story
console.log(swissInternational.meta.foundation.story)
```

## Themes

### Swiss International

Clean, precise, grid-based. Born from the Basel and Zurich schools of the 1950s.

Best for: Finance, legal, data-heavy apps, SaaS dashboards.

| Token | Light | Dark |
|-------|-------|------|
| Background | White/near-white | Deep neutral |
| Text | Near-black | Near-white |
| Accent | Signal Red (#E8322E) | Signal Red (lighter) |
| Radius | None (sharp corners) | None |

### Nihon no Iro (Traditional Japanese)

Warm, layered, natural. Colors from centuries of textile dyeing, ceramics, and seasonal observation.

Best for: Luxury, craftsmanship, mindfulness, wellness apps.

| Token | Light | Dark |
|-------|-------|------|
| Background | Shironeri (refined silk white) | Deep indigo |
| Text | Deep warm neutral | Warm near-white |
| Accent | Hanada indigo (#2E4B6D) | Hanada (lighter) |
| Radius | Subtle (2-6px) | Subtle |

## Packages

| Package | Description |
|---------|-------------|
| `@syncupsuite/tokens` | DTCG types, utilities, validation (zero deps) |
| `@syncupsuite/foundations` | Cultural data + color/typography engine |
| `@syncupsuite/transformers` | CSS and Tailwind v4 output |
| `@syncupsuite/themes` | Pre-built, ready-to-use theme packs |

## Architecture

Themes are built from cultural foundations using a 4-layer pipeline:

1. **Seed Colors** — Historically verifiable colors with provenance
2. **Primitives** — Expanded 9-step lightness scales + tinted neutrals
3. **Semantic** — Purpose-mapped tokens (background, text, interactive, status) for light + dark
4. **Cross-domain** — Typography, spacing (8px grid), border radius

Every token follows the [DTCG specification](https://tr.designtokens.org/format/) with vendor extensions for cultural metadata.

## What ships with each theme

- `tokens.json` — Complete DTCG token tree
- `tokens.css` — CSS custom properties (light + dark)
- `tailwind.css` — Tailwind v4 `@theme` block + semantic properties
- `meta.json` — Cultural story, philosophy, provenance, validation

## Accessibility

All themes ship with:
- Protected status colors (error, success, warning) that cannot be overridden at T1/T2 level
- Focus ring tokens for keyboard accessibility
- Required semantic tokens validated at build time
- Semantic token structure designed for WCAG 2.1 AA targets (automated contrast validation planned — see [ADR-005](docs/adr/ADR-005-ci-snapshot-matrix.md))

## License

MIT
