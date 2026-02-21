/**
 * Tailwind v4 Transformer
 *
 * Converts DTCG-aligned token JSON to Tailwind v4 CSS-first format.
 * Output: CSS with @import "tailwindcss", @theme block, and custom properties.
 */

import type { DTCGTokenGroup, DTCGRoot, TransformOptions } from '@syncupsuite/tokens';
import { flattenTokens, pathToProperty, resolveReference, sanitizeCssValue, sanitizeCssComment } from '@syncupsuite/tokens';
import { formatProperty, tokenValueToString } from './format';

/**
 * Maps semantic token paths (dot-separated) to Tailwind --color-* names.
 * This defines the consumer-facing Tailwind utility API:
 *   bg-canvas, text-foreground, bg-primary, border-border, ring-ring, etc.
 */
const SEMANTIC_COLOR_MAP: Array<{ tailwind: string; semanticPath: string }> = [
  // Backgrounds
  { tailwind: 'canvas', semanticPath: 'background.canvas' },
  { tailwind: 'surface', semanticPath: 'background.surface' },
  { tailwind: 'muted', semanticPath: 'background.muted' },
  // Text / foreground
  { tailwind: 'foreground', semanticPath: 'text.primary' },
  { tailwind: 'foreground-secondary', semanticPath: 'text.secondary' },
  { tailwind: 'foreground-muted', semanticPath: 'text.muted' },
  { tailwind: 'foreground-inverse', semanticPath: 'text.inverse' },
  // Interactive / primary
  { tailwind: 'primary', semanticPath: 'interactive.primary' },
  { tailwind: 'primary-hover', semanticPath: 'interactive.primary-hover' },
  { tailwind: 'primary-active', semanticPath: 'interactive.primary-active' },
  // Borders
  { tailwind: 'border', semanticPath: 'border.default' },
  { tailwind: 'border-strong', semanticPath: 'border.strong' },
  // Status
  { tailwind: 'error', semanticPath: 'status.error' },
  { tailwind: 'success', semanticPath: 'status.success' },
  { tailwind: 'warning', semanticPath: 'status.warning' },
  { tailwind: 'info', semanticPath: 'status.info' },
  // Focus
  { tailwind: 'ring', semanticPath: 'focus.ring' },
  { tailwind: 'focus-visible', semanticPath: 'accessibility.focus-visible' },
];

function extractThemeColors(colors: DTCGTokenGroup): Array<{ name: string; value: string; comment?: string }> {
  const entries: Array<{ name: string; value: string; comment?: string }> = [];
  const tokens = flattenTokens(colors);

  for (const [path, token] of tokens) {
    if (token.$type !== 'color') continue;
    const name = `--color-${path.join('-')}`;
    const raw = tokenValueToString(token.$value);
    const value = raw.startsWith('{') ? `var(--${path.join('-')})` : sanitizeCssValue(raw);
    entries.push({ name, value, comment: token.$description ? sanitizeCssComment(token.$description) : undefined });
  }

  return entries;
}

function extractThemeSpacing(spacingGroup: DTCGTokenGroup): Array<{ name: string; value: string; comment?: string }> {
  const entries: Array<{ name: string; value: string; comment?: string }> = [];
  const tokens = flattenTokens(spacingGroup);

  for (const [path, token] of tokens) {
    if (token.$type !== 'dimension') continue;
    // Replace dots in path segments (e.g. "0.5" → "0-5") to produce valid CSS property names
    const safePath = path.map(s => s.replace(/\./g, '-')).join('-');
    const name = `--spacing-${safePath}`;
    entries.push({ name, value: sanitizeCssValue(tokenValueToString(token.$value)), comment: token.$description ? sanitizeCssComment(token.$description) : undefined });
  }

  return entries;
}

function extractThemeTypography(typographyGroup: DTCGTokenGroup): {
  families: Array<{ name: string; value: string; comment?: string }>;
  sizes: Array<{ name: string; value: string; comment?: string }>;
} {
  const families: Array<{ name: string; value: string; comment?: string }> = [];
  const sizes: Array<{ name: string; value: string; comment?: string }> = [];
  const tokens = flattenTokens(typographyGroup);

  for (const [path, token] of tokens) {
    if (path[0] === 'family') {
      const name = `--font-${path.slice(1).join('-')}`;
      families.push({ name, value: sanitizeCssValue(tokenValueToString(token.$value)), comment: token.$description ? sanitizeCssComment(token.$description) : undefined });
    } else if (path[0] === 'size') {
      const name = `--text-${path.slice(1).join('-')}`;
      sizes.push({ name, value: sanitizeCssValue(tokenValueToString(token.$value)), comment: token.$description ? sanitizeCssComment(token.$description) : undefined });
    }
  }

  return { families, sizes };
}

function extractThemeRadius(radiusGroup: DTCGTokenGroup): Array<{ name: string; value: string; comment?: string }> {
  const entries: Array<{ name: string; value: string; comment?: string }> = [];
  const tokens = flattenTokens(radiusGroup);

  for (const [path, token] of tokens) {
    const name = `--radius-${path.join('-')}`;
    entries.push({ name, value: sanitizeCssValue(tokenValueToString(token.$value)), comment: token.$description ? sanitizeCssComment(token.$description) : undefined });
  }

  return entries;
}

/**
 * Transform a DTCG token tree into Tailwind v4 CSS.
 */
export function transformToTailwindV4(
  tokens: DTCGRoot,
  options: TransformOptions = {},
): string {
  const {
    darkMode = true,
    darkModeStrategy = 'class',
    includeComments = true,
    prefix = '',
  } = options;

  const sections: string[] = [];

  sections.push('@import "tailwindcss";');
  sections.push('');

  // @theme block
  const themeEntries: string[] = [];

  if (tokens.primitive?.color) {
    themeEntries.push('  /* --- Colors --- */');
    const colors = extractThemeColors(tokens.primitive.color as DTCGTokenGroup);
    for (const entry of colors) {
      if (includeComments && entry.comment) themeEntries.push(`  /* ${entry.comment} */`);
      themeEntries.push(`  ${entry.name}: ${entry.value};`);
    }
    themeEntries.push('');
  }

  if (tokens.primitive?.spacing) {
    themeEntries.push('  /* --- Spacing (8px grid) --- */');
    const spacing = extractThemeSpacing(tokens.primitive.spacing as DTCGTokenGroup);
    for (const entry of spacing) {
      if (includeComments && entry.comment) themeEntries.push(`  /* ${entry.comment} */`);
      themeEntries.push(`  ${entry.name}: ${entry.value};`);
    }
    themeEntries.push('');
  }

  if (tokens.primitive?.typography) {
    const { families, sizes } = extractThemeTypography(tokens.primitive.typography as DTCGTokenGroup);
    if (families.length > 0) {
      themeEntries.push('  /* --- Font Families --- */');
      for (const entry of families) {
        if (includeComments && entry.comment) themeEntries.push(`  /* ${entry.comment} */`);
        themeEntries.push(`  ${entry.name}: ${entry.value};`);
      }
      themeEntries.push('');
    }
    if (sizes.length > 0) {
      themeEntries.push('  /* --- Font Sizes --- */');
      for (const entry of sizes) {
        if (includeComments && entry.comment) themeEntries.push(`  /* ${entry.comment} */`);
        themeEntries.push(`  ${entry.name}: ${entry.value};`);
      }
      themeEntries.push('');
    }
  }

  if (tokens.primitive?.radius) {
    themeEntries.push('  /* --- Border Radius --- */');
    const radii = extractThemeRadius(tokens.primitive.radius as DTCGTokenGroup);
    for (const entry of radii) {
      if (includeComments && entry.comment) themeEntries.push(`  /* ${entry.comment} */`);
      themeEntries.push(`  ${entry.name}: ${entry.value};`);
    }
    themeEntries.push('');
  }

  if (themeEntries.length > 0) {
    sections.push('@theme {');
    sections.push(themeEntries.join('\n'));
    sections.push('}');
    sections.push('');
  }

  // Semantic color @theme — maps semantic tokens to Tailwind --color-* utilities
  if (tokens.semantic?.light) {
    const semanticEntries: string[] = [];
    const lightTokens = flattenTokens(tokens.semantic.light);
    const availablePaths = new Set(lightTokens.map(([path]) => path.join('.')));

    for (const { tailwind, semanticPath } of SEMANTIC_COLOR_MAP) {
      if (availablePaths.has(semanticPath)) {
        const cssVar = pathToProperty(semanticPath);
        semanticEntries.push(`  --color-${tailwind}: var(${cssVar});`);
      }
    }

    if (semanticEntries.length > 0) {
      sections.push('/* === Semantic Color API — theme-aware Tailwind utilities === */');
      sections.push('@theme {');
      sections.push(semanticEntries.join('\n'));
      sections.push('}');
      sections.push('');
    }
  }

  // :root — primitive color aliases + light mode semantic tokens
  // Tailwind @theme uses --color-* convention for utility classes (bg-neutral-50, text-primary-500).
  // DTCG semantic tokens reference {primitive.color.*} which resolveReference converts to
  // var(--primitive-color-*). These aliases bridge the two naming conventions so both work.
  const hasPrimitiveColors = !!tokens.primitive?.color;
  const hasLightSemantics = !!(tokens.semantic?.light && flattenTokens(tokens.semantic.light).length > 0);

  if (hasPrimitiveColors || hasLightSemantics) {
    sections.push('/* Primitive aliases + light mode semantic tokens */');
    sections.push(':root {');

    if (hasPrimitiveColors) {
      if (includeComments) sections.push('  /* --primitive-color-* aliases → @theme --color-* (for semantic var() resolution) */');
      const colorTokens = flattenTokens(tokens.primitive!.color as DTCGTokenGroup);
      for (const [path, token] of colorTokens) {
        if (token.$type !== 'color') continue;
        const themeName = `--color-${path.join('-')}`;
        const primitiveName = `--primitive-color-${path.join('-')}`;
        sections.push(`  ${primitiveName}: var(${themeName});`);
      }
      sections.push('');
    }

    if (hasLightSemantics) {
      if (includeComments) sections.push('  /* Semantic tokens */');
      const lightTokens = flattenTokens(tokens.semantic!.light!);
      for (const [path, token] of lightTokens) {
        sections.push(formatProperty(path, token, prefix, includeComments));
      }
    }

    sections.push('}');
    sections.push('');
  }

  // Dark mode
  if (darkMode && tokens.semantic?.dark) {
    const darkTokens = flattenTokens(tokens.semantic.dark);
    if (darkTokens.length > 0) {
      const selector =
        darkModeStrategy === 'media'
          ? '@media (prefers-color-scheme: dark)'
          : '[data-theme="dark"]';

      sections.push('/* Dark mode semantic tokens */');

      if (darkModeStrategy === 'media') {
        sections.push(`${selector} {`);
        sections.push('  :root {');
        for (const [path, token] of darkTokens) {
          const prop = pathToProperty(path.join('.'), prefix);
          const raw = tokenValueToString(token.$value);
          const value = raw.startsWith('{')
            ? resolveReference(raw, prefix)
            : sanitizeCssValue(raw);
          if (includeComments && token.$description) sections.push(`    /* ${sanitizeCssComment(token.$description)} */`);
          sections.push(`    ${prop}: ${value};`);
        }
        sections.push('  }');
        sections.push('}');
      } else {
        sections.push(`${selector} {`);
        for (const [path, token] of darkTokens) {
          sections.push(formatProperty(path, token, prefix, includeComments));
        }
        sections.push('}');
      }
      sections.push('');
    }
  }

  return sections.join('\n');
}
