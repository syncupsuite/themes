/**
 * Tailwind v4 Transformer
 *
 * Converts DTCG-aligned token JSON to Tailwind v4 CSS-first format.
 * Output: CSS with @import "tailwindcss", @theme block, and custom properties.
 */

import type { DTCGToken, DTCGTokenGroup, DTCGRoot, TransformOptions } from '@syncupsuite/tokens';
import { flattenTokens, pathToProperty, resolveReference, sanitizeCssValue, sanitizeCssComment } from '@syncupsuite/tokens';

function tokenValueToString(value: DTCGToken['$value']): string {
  if (typeof value === 'string') return value;
  return String(value);
}

function formatProperty(
  path: string[],
  token: DTCGToken,
  prefix: string,
  includeComments: boolean,
): string {
  const prop = pathToProperty(path.join('.'), prefix);
  const raw = tokenValueToString(token.$value);
  const value = raw.startsWith('{')
    ? resolveReference(raw, prefix)
    : sanitizeCssValue(raw);

  const lines: string[] = [];
  if (includeComments && token.$description) {
    lines.push(`  /* ${sanitizeCssComment(token.$description)} */`);
  }
  lines.push(`  ${prop}: ${value};`);
  return lines.join('\n');
}

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
    const name = `--spacing-${path.join('-')}`;
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

  // :root — light mode semantic tokens
  if (tokens.semantic?.light) {
    const lightTokens = flattenTokens(tokens.semantic.light);
    if (lightTokens.length > 0) {
      sections.push('/* Light mode semantic tokens (default) */');
      sections.push(':root {');
      for (const [path, token] of lightTokens) {
        sections.push(formatProperty(path, token, prefix, includeComments));
      }
      sections.push('}');
      sections.push('');
    }
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
