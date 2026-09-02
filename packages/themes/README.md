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

## Quick Start (Copy-Paste Ready)

### Tailwind v4 + React

```bash
npm install @syncupsuite/themes
```

In your `tailwind.config.js`:

```javascript
import { swissInternational } from '@syncupsuite/themes';

export default {
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addBase }) {
      addBase([
        {
          '@layer base': swissInternational.tailwindCss,
        },
      ]);
    },
  ],
};
```

In your component:

```jsx
export default function App() {
  return (
    <div className="bg-canvas text-foreground min-h-screen p-8">
      <h1 className="text-2xl font-bold text-foreground mb-4">
        Swiss International Theme
      </h1>
      <button className="px-4 py-2 bg-primary text-canvas rounded hover:bg-primary-hover transition-colors">
        Click me
      </button>
    </div>
  );
}
```

### Plain CSS (HTML/CSS)

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/@syncupsuite/themes/swiss-international/tokens.css">
  <style>
    body {
      background-color: var(--background-canvas);
      color: var(--text-foreground);
      font-family: var(--typography-body);
      line-height: var(--line-height-body);
    }
    h1 {
      font-size: var(--type-scale-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-foreground);
    }
    button {
      background-color: var(--interactive-primary);
      color: var(--text-canvas);
      padding: var(--spacing-3) var(--spacing-4);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background-color 200ms ease-out;
    }
    button:hover {
      background-color: var(--interactive-primary-hover);
    }
    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: var(--background-canvas-dark);
        color: var(--text-foreground-dark);
      }
      button {
        background-color: var(--interactive-primary-dark);
        color: var(--text-canvas-dark);
      }
      button:hover {
        background-color: var(--interactive-primary-hover-dark);
      }
    }
  </style>
</head>
<body>
  <h1>Swiss International Theme</h1>
  <button>Click me</button>
</body>
</html>
```

### All 12 themes at a glance

Each theme is imported identically:

```typescript
import {
  swissInternational,
  nihonTraditional,
  nordicModern,
  tangImperial,
  shuimoModern,
  nihonMinimal,
  renaissance,
  artDeco,
  deStijl,
  milaneseDesign,
  swissModernist,
  wienerWerkstaette,
} from '@syncupsuite/themes';
```

Use in your stylesheet:

```css
/* Swap themes by changing import or generating CSS at runtime */
@import '@syncupsuite/themes/tangimperial/tokens.css';
/* or */
@import '@syncupsuite/themes/art-deco/tailwind.css';
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
