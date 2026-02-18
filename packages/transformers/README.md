# @syncupsuite/transformers

Token transformers — converts DTCG token trees to Tailwind v4 CSS and plain CSS custom properties.

## Install

```bash
npm install @syncupsuite/transformers
```

## Usage

### Tailwind v4 (`@theme` block)

```typescript
import { transformToTailwindV4 } from '@syncupsuite/transformers';
import { swissInternational } from '@syncupsuite/themes';

const css = transformToTailwindV4(swissInternational.tokens, {
  prefix: '',          // CSS property prefix (default: '')
  includeComments: true,
});

// Output: Tailwind v4 @theme block with CSS custom properties
// @theme {
//   --color-primary-50: #f0f4ff;
//   --color-primary-500: #3B5BDB;
//   ...
// }
```

### Plain CSS custom properties

```typescript
import { transformToCSS } from '@syncupsuite/transformers';
import { nihonTraditional } from '@syncupsuite/themes';

const css = transformToCSS(nihonTraditional.tokens, {
  selector: ':root',   // CSS selector (default: ':root')
  prefix: '',
  includeComments: true,
});

// Output: CSS custom properties block
// :root {
//   --color-hanada-50: #e8eef4;
//   --color-hanada-500: #2E4B6D;
//   ...
// }
```

### TransformOptions

```typescript
interface TransformOptions {
  prefix?: string;           // Prepend to all property names
  includeComments?: boolean; // Include $description as CSS comments
  selector?: string;         // Wrapper selector (transformToCSS only)
}
```

## What transformers handle

- Decimal spacing keys (`0.5` → `--spacing-half`, not `--spacing-0.5` with dot)
- `@theme` vs `:root` wrapper selection
- `--primitive-color-*` ↔ `--color-*` reference resolution
- CSS value sanitization (injection prevention)
- Semantic `var()` reference chain preservation

## Related packages

| Package | Description |
|---------|-------------|
| [`@syncupsuite/tokens`](https://npmjs.com/package/@syncupsuite/tokens) | DTCG types, utilities, validation |
| [`@syncupsuite/foundations`](https://npmjs.com/package/@syncupsuite/foundations) | Cultural data + color engine |
| [`@syncupsuite/themes`](https://npmjs.com/package/@syncupsuite/themes) | Pre-built theme packs (includes CSS files) |

## License

MIT
