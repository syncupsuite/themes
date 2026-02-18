# @syncupsuite/tokens

DTCG-aligned design token types, utilities, and validation. Zero runtime dependencies.

This is the foundation layer of the `@syncupsuite/themes` pipeline — used by all other packages.

## Install

```bash
npm install @syncupsuite/tokens
```

## What's in this package

### Types

W3C Design Token Community Group (DTCG) aligned TypeScript types:

```typescript
import type {
  DTCGToken,        // A single token: { $type, $value, $description }
  DTCGTokenGroup,   // A group of tokens or nested groups
  DTCGRoot,         // The root token tree
  CulturalFoundation, // A cultural design foundation definition
  SeedColor,        // A seed color with provenance
  BuiltTheme,       // The output of a built theme (tokens + CSS + meta)
} from '@syncupsuite/tokens';
```

### Utilities

```typescript
import {
  flattenTokens,     // Flatten a nested token tree to { path: token } map
  pathToProperty,    // Convert 'color.primary.500' → '--color-primary-500'
  resolveReference,  // Resolve '{color.primary.500}' reference in a token tree
  walkTokens,        // Walk all tokens in a tree, calling a visitor function
  isToken,           // Type guard: is this a token or a group?
  sanitizeCssValue,  // Validate and sanitize a CSS value string
  formatCssValue,    // Format a token value for CSS output (handles references)
  assertHex,         // Assert a value is a valid 6-digit hex color
  slugify,           // Convert a string to a CSS-safe slug
} from '@syncupsuite/tokens';
```

### Validation

```typescript
import {
  validateSchema,       // Check all tokens have $type, $value, $description
  validateCompleteness, // Check all required semantic tokens are present
  validateContrast,     // Check contrast ratios meet WCAG targets
  validateOverride,     // Check a token override doesn't touch protected paths
  validateReferences,   // Check all {references} resolve in the token tree
} from '@syncupsuite/tokens';
```

### Constants

```typescript
import {
  PROTECTED_TOKEN_PATHS,      // Paths that cannot be overridden (error, focus, a11y)
  REQUIRED_SEMANTIC_TOKENS,   // Semantic tokens every theme must define
  PERF_BUDGETS,               // Size and depth budgets enforced at build time
} from '@syncupsuite/tokens';
```

## Security

v0.1.1 includes security hardening for the CSS generation pipeline:
- `sanitizeCssValue` blocks CSS injection patterns (`javascript:`, `data:`, `expression()`, etc.)
- `formatCssValue` validates all literal segments in reference-containing values
- `validateSchema` rejects empty `$value` strings
- 98 tests covering utilities, validation, and security cases

## Related packages

| Package | Description |
|---------|-------------|
| [`@syncupsuite/foundations`](https://npmjs.com/package/@syncupsuite/foundations) | Cultural design data + color/typography engine |
| [`@syncupsuite/transformers`](https://npmjs.com/package/@syncupsuite/transformers) | CSS and Tailwind v4 output |
| [`@syncupsuite/themes`](https://npmjs.com/package/@syncupsuite/themes) | Pre-built theme packs (Swiss International, Nihon Traditional) |

## License

MIT
