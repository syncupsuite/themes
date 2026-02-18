# @syncupsuite/themes

Pre-built, culturally-grounded design themes. Production-ready CSS and TypeScript.

Zero runtime dependencies. Security-audited. 195 tests.

## Install

```bash
npm install @syncupsuite/themes
```

## CSS usage

Import directly into your stylesheet (Tailwind v4, Vite, or any CSS bundler):

```css
/* Swiss International — modernist grid, geometric sans-serif */
@import '@syncupsuite/themes/swiss-international/tailwind.css';

/* Nihon Traditional — Edo-period Japanese colour palette */
@import '@syncupsuite/themes/nihon-traditional/tailwind.css';
```

Or import plain CSS custom properties (`:root` block, no Tailwind):

```css
@import '@syncupsuite/themes/swiss-international/tokens.css';
@import '@syncupsuite/themes/nihon-traditional/tokens.css';
```

## TypeScript usage

```typescript
import { swissInternational } from '@syncupsuite/themes';

// swissInternational.css         — plain CSS string
// swissInternational.tailwindCss — Tailwind v4 @theme block string
// swissInternational.tokens      — DTCG token tree (JSON)
// swissInternational.meta        — theme metadata and validation summary

import { nihonTraditional } from '@syncupsuite/themes';
```

## Available themes

| Theme | Import | Cultural basis |
|-------|--------|----------------|
| Swiss International | `swiss-international` | Swiss graphic design — Neue Haas Grotesk, grid systems, International Typographic Style |
| Nihon Traditional | `nihon-traditional` | Nihon no Dentou Iro — 465 traditional Japanese colours catalogued from the Edo period |

## Token structure

Each theme exports a four-layer token system:

```
primitive.color.*       — 9-step lightness scales per seed color (50–900)
primitive.color.neutral — Hue-tinted neutrals (not dead grays)
semantic.light.*        — Purpose-mapped tokens for light mode
semantic.dark.*         — Purpose-mapped tokens for dark mode
typography.*            — Font stacks, type scale, weights, line heights
spacing.*               — 8px grid (0–24 steps)
radius.*                — Border radius scale (none → full)
```

Semantic tokens use CSS custom property references — dark mode is a parallel semantic mapping, not a filter:

```css
/* Light mode */
--background-canvas: var(--primitive-color-neutral-50);

/* Dark mode */
[data-theme="dark"] --background-canvas: var(--primitive-color-neutral-900);
```

## Build your own theme

The `theme-inspired-tokens` Claude Code skill (available in the [webplatform4sync marketplace](https://github.com/syncupsuite/webplatform4sync)) walks through building custom cultural foundations from scratch using `@syncupsuite/foundations` and `@syncupsuite/transformers`.

## Package ecosystem

| Package | Description |
|---------|-------------|
| [`@syncupsuite/tokens`](https://npmjs.com/package/@syncupsuite/tokens) | DTCG types, utilities, validation — zero deps |
| [`@syncupsuite/foundations`](https://npmjs.com/package/@syncupsuite/foundations) | Cultural data + color/typography engine |
| [`@syncupsuite/transformers`](https://npmjs.com/package/@syncupsuite/transformers) | CSS and Tailwind v4 output |
| `@syncupsuite/themes` | **This package** — pre-built theme packs |

## License

MIT
