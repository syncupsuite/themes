# @syncupsuite/foundations

Cultural design foundations — the data and engine layer of the `@syncupsuite/themes` pipeline.

This package provides:
- Two pre-built cultural foundation datasets (Swiss International, Nihon Traditional)
- The color expansion engine (seed color → 9-step lightness scale)
- Harmony mode generation (Golden Ratio, Complementary, Triadic, Analogous)
- Typography mapping (hue-based font stack selection)

## Install

```bash
npm install @syncupsuite/foundations
```

## Usage

### Use a pre-built foundation dataset

```typescript
import { nihonTraditionalData, swissInternationalData } from '@syncupsuite/foundations';
import { buildFoundation } from '@syncupsuite/foundations';

const result = buildFoundation(swissInternationalData);
// result.primitives — expanded color scales
// result.semanticLight — light mode semantic token map
// result.semanticDark — dark mode semantic token map
// result.crossDomain — typography, spacing, radius tokens
```

### Build from a custom foundation

```typescript
import { buildFoundation } from '@syncupsuite/foundations';
import type { FoundationData } from '@syncupsuite/foundations';

const myFoundation: FoundationData = {
  name: 'my-foundation',
  story: 'Rooted in...',
  philosophy: '...',
  era: '...',
  seedColors: [
    {
      name: 'primary',
      hex: '#3B5BDB',
      description: '...',
      provenance: { tradition: '...', source: '...' },
    },
  ],
  harmonyMode: 'golden-ratio',
};

const result = buildFoundation(myFoundation);
```

### Color utilities

```typescript
import {
  hexToHsl,
  hslToHex,
  generateLightnessScale,  // 9-step scale from a base hex
  generateNeutrals,         // Neutral palette from a seed color
  generateHarmonyAccents,   // Accent colors using harmony mode
  getHue,                   // Extract hue from hex
} from '@syncupsuite/foundations';
```

### Typography mapping

```typescript
import {
  getFontStacks,           // Get font stacks for a hue
  hueToTypographyCategory, // 'warm' | 'cool' | 'neutral'
  TYPE_SCALE,              // xs → 4xl size values
  WEIGHT_SCALE,            // normal / medium / semibold / bold
  LINE_HEIGHT_SCALE,       // tight / normal / relaxed
} from '@syncupsuite/foundations';
```

## Foundation data

Two cultural foundations are included:

**Swiss International** (`swissInternationalData`)
- Inspired by Swiss graphic design tradition (Neue Haas Grotesk, grid systems)
- Cool primary palette, geometric sans-serif typography
- Sharp radius defaults

**Nihon Traditional** (`nihonTraditionalData`)
- Rooted in the 465 traditional colors of Japan's Edo period (Nihon no Dentou Iro)
- Seed colors include Hanada (indigo), Beni (crimson), Yamabuki (golden yellow)
- Warm-neutral palette, humanist typography

## Color expansion

Each seed color expands into a 9-step lightness scale (50–900) using HSL manipulation:

> **Note**: OKLCH migration is planned before themes 3-10 (ADR-001). OKLCH produces perceptually uniform lightness scales across hues where HSL does not. Custom foundations built on this version may require value recalculation after the migration.

## Related packages

| Package | Description |
|---------|-------------|
| [`@syncupsuite/tokens`](https://npmjs.com/package/@syncupsuite/tokens) | DTCG types, utilities, validation |
| [`@syncupsuite/transformers`](https://npmjs.com/package/@syncupsuite/transformers) | CSS and Tailwind v4 output |
| [`@syncupsuite/themes`](https://npmjs.com/package/@syncupsuite/themes) | Pre-built theme packs ready to use |

## License

MIT
