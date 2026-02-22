# Contributing to @syncupsuite/themes

How to add new themes to the design token pipeline.

---

## Prerequisites

- Node.js >= 18
- pnpm 9.15.4 (`corepack enable && corepack prepare pnpm@9.15.4`)
- Clone the repo and run `pnpm install`

---

## Adding a New Theme

The pipeline is **single-touch**: create one foundation JSON file, run the generator, and everything else (tokens, CSS, Tailwind, metadata) is produced automatically.

### 1. Create the foundation file

Add a JSON file to `packages/foundations/data/{theme-name}.json`.

Use kebab-case for the filename. See any existing foundation (e.g., `nordic-modern.json`) for the full shape. The required structure:

```jsonc
{
  "$name": "theme-name",
  "$description": "One-line description with cultural context",
  "$extensions": {
    "syncupsuite.foundation": {
      "story": "2-3 sentences: where this design tradition comes from",
      "philosophy": "The core design principle, in the culture's own terms",
      "era": "e.g. 1920s-1940s",
      "harmonyMode": "analogous | complementary | triadic | split-complementary",
      "radiusTendency": "sharp | moderate | round",
      "typographyCategory": "geometric-sans | humanist-sans | transitional-serif | slab-serif | neo-grotesque"
    }
  },
  "seedColors": [
    {
      "hex": "#2B5F83",
      "name": "Local-language color name",
      "tradition": "Why this color — traceable cultural origin",
      "source": "Published reference (book, museum, archive)"
    }
    // 5-7 seed colors total
  ]
}
```

### 2. Cultural provenance requirements (non-negotiable)

Every theme must have documented cultural origins. This is what separates these themes from generic color palettes.

- **5-7 seed colors**, each with a traceable cultural origin
- **Story**: Where the design tradition comes from (not "I liked these colors")
- **Philosophy**: A design principle rooted in the culture (e.g., "Lagom" for Nordic, "Ma" for Japanese)
- **Source**: Published reference for each color (book, exhibition catalog, museum collection)

"This blue comes from traditional indigo dyeing (ai-zome), documented in *The Colors of Japan* by Sadao Hibi" is good.

"This is a nice blue" is insufficient.

### 3. Generate

```bash
pnpm generate
```

This runs `scripts/generate-themes.ts` and produces for your theme:
- `tokens.json` (DTCG token tree)
- `tokens.css` (CSS custom properties, light + dark)
- `tailwind.css` (Tailwind v4 `@theme` block)
- `meta.json` (cultural metadata + validation results)

### 4. Build and test

```bash
pnpm build
pnpm test
```

All 4 packages must pass. Tests validate:
- Token structure conforms to DTCG spec
- **20 AA contrast pairs** meet WCAG 2.1 requirements (4.5:1 for text, 3:1 for large text/UI)
- Required semantic tokens are present (background, text, interactive, status colors)
- Light and dark modes are both generated
- Status colors (error, success, warning) are protected and present

### 5. Review contrast warnings

Some themes produce contrast warnings that are inherent to their source palettes (e.g., De Stijl's primary yellow). These are acceptable **only** when the affected tokens are not used for text-on-background pairs. Document any warnings in your PR description.

---

## Package architecture

```
packages/
├── tokens/          # DTCG type definitions, zero runtime deps
├── foundations/     # Color engine + cultural data (your JSON goes here)
├── transformers/    # CSS + Tailwind v4 output generators
└── themes/          # Published theme bundles (auto-generated)
```

Build order is enforced by Turborepo: tokens -> foundations + transformers -> themes.

---

## What NOT to edit manually

- Anything in `packages/themes/` output directories -- these are generated
- CSS files with timestamps -- regenerate instead of hand-editing
- `tokens.json` files -- always regenerate from foundation JSON

---

## Validation checklist

Before opening a PR:

- [ ] Foundation JSON has 5-7 seed colors with cultural provenance
- [ ] `pnpm generate` completes without errors
- [ ] `pnpm build` succeeds across all packages
- [ ] `pnpm test` passes (233+ tests, all 20 AA contrast pairs per theme)
- [ ] No secrets or credentials in the commit
- [ ] PR description includes the theme's cultural story and any contrast warnings
