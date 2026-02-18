/**
 * Regression tests for the Tailwind v4 transformer prefix bug.
 *
 * Bug: When a `prefix` option is passed to transformToTailwindV4, the @theme
 * block entries (--color-*, --spacing-*, --font-*, --text-*, --radius-*) do NOT
 * receive the prefix, while :root and dark-mode properties DO receive it via
 * formatProperty. This causes naming inconsistency between @theme and :root.
 *
 * These tests document the current behaviour (prefix NOT applied to @theme) so
 * that any future fix immediately produces a regression signal. If the behaviour
 * is intentionally changed, update the expected values here.
 *
 * Additionally, this file tests prefix behaviour for:
 * - :root primitive alias entries
 * - :root semantic light token entries
 * - dark mode class-based selector entries
 * - dark mode media-query entries
 */

import { describe, it, expect } from 'vitest';
import { transformToTailwindV4 } from '../tailwind-v4';
import type { DTCGRoot } from '@syncupsuite/tokens';

// ---------------------------------------------------------------------------
// Minimal token fixture
// ---------------------------------------------------------------------------

const minimalTokens: DTCGRoot = {
  $name: 'prefix-test',
  primitive: {
    color: {
      brand: {
        '500': { $type: 'color', $value: '#6D28D9', $description: 'Brand 500' },
      },
      neutral: {
        '50': { $type: 'color', $value: '#FAFAFA', $description: 'Neutral 50' },
        '900': { $type: 'color', $value: '#111111', $description: 'Neutral 900' },
      },
    },
    spacing: {
      '4': { $type: 'dimension', $value: '16px', $description: 'Spacing 4' },
    },
    typography: {
      family: {
        heading: { $type: 'fontFamily', $value: '"Inter", sans-serif', $description: 'Heading' },
      },
      size: {
        base: { $type: 'dimension', $value: '1rem', $description: 'Base size' },
      },
    },
    radius: {
      md: { $type: 'dimension', $value: '8px', $description: 'Medium radius' },
    },
  },
  semantic: {
    light: {
      background: {
        canvas: { $type: 'color', $value: '{primitive.color.neutral.50}', $description: 'Canvas bg' },
      },
    },
    dark: {
      background: {
        canvas: { $type: 'color', $value: '{primitive.color.neutral.900}', $description: 'Canvas bg dark' },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// @theme block — prefix NOT applied (current behaviour, potential bug)
// ---------------------------------------------------------------------------

describe('transformToTailwindV4 — @theme block prefix behaviour (regression)', () => {
  it('@theme color entries do NOT receive prefix (current behaviour)', () => {
    const css = transformToTailwindV4(minimalTokens, { prefix: 'su' });
    // @theme entries use --color-* naming WITHOUT the prefix
    expect(css).toContain('--color-brand-500: #6D28D9');
    // Prefixed name must NOT appear inside @theme block
    const themeBlock = css.slice(css.indexOf('@theme {'), css.indexOf('}', css.indexOf('@theme {')));
    expect(themeBlock).not.toContain('--su-color-brand-500');
  });

  it('@theme spacing entries do NOT receive prefix (current behaviour)', () => {
    const css = transformToTailwindV4(minimalTokens, { prefix: 'su' });
    expect(css).toContain('--spacing-4: 16px');
    const themeBlock = css.slice(css.indexOf('@theme {'), css.indexOf('}', css.indexOf('@theme {')));
    expect(themeBlock).not.toContain('--su-spacing-4');
  });

  it('@theme font-family entries do NOT receive prefix (current behaviour)', () => {
    const css = transformToTailwindV4(minimalTokens, { prefix: 'su' });
    expect(css).toContain('--font-heading: "Inter", sans-serif');
    const themeBlock = css.slice(css.indexOf('@theme {'), css.indexOf('}', css.indexOf('@theme {')));
    expect(themeBlock).not.toContain('--su-font-heading');
  });

  it('@theme radius entries do NOT receive prefix (current behaviour)', () => {
    const css = transformToTailwindV4(minimalTokens, { prefix: 'su' });
    expect(css).toContain('--radius-md: 8px');
    const themeBlock = css.slice(css.indexOf('@theme {'), css.indexOf('}', css.indexOf('@theme {')));
    expect(themeBlock).not.toContain('--su-radius-md');
  });
});

// ---------------------------------------------------------------------------
// :root semantic tokens — prefix IS applied via formatProperty
// ---------------------------------------------------------------------------

describe('transformToTailwindV4 — :root semantic tokens respect prefix', () => {
  it(':root semantic light tokens use the prefix', () => {
    const css = transformToTailwindV4(minimalTokens, { prefix: 'su' });
    // formatProperty applies prefix to semantic tokens in :root
    expect(css).toContain('--su-background-canvas:');
  });
});

// ---------------------------------------------------------------------------
// Dark mode tokens — prefix applied via formatProperty (class strategy)
// ---------------------------------------------------------------------------

describe('transformToTailwindV4 — dark mode class selector with prefix', () => {
  it('dark mode class selector entries use prefix', () => {
    const css = transformToTailwindV4(minimalTokens, { prefix: 'su', darkModeStrategy: 'class' });
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('--su-background-canvas:');
  });
});

// ---------------------------------------------------------------------------
// Dark mode tokens — prefix applied (media strategy)
// ---------------------------------------------------------------------------

describe('transformToTailwindV4 — dark mode media query with prefix', () => {
  it('dark mode media query entries use prefix', () => {
    const css = transformToTailwindV4(minimalTokens, { prefix: 'su', darkModeStrategy: 'media' });
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('--su-background-canvas:');
  });
});

// ---------------------------------------------------------------------------
// No prefix — baseline output is unchanged
// ---------------------------------------------------------------------------

describe('transformToTailwindV4 — no prefix baseline', () => {
  it('without prefix, @theme colors use --color-* naming', () => {
    const css = transformToTailwindV4(minimalTokens);
    expect(css).toContain('--color-brand-500: #6D28D9');
  });

  it('without prefix, :root semantic tokens have no prefix', () => {
    const css = transformToTailwindV4(minimalTokens);
    expect(css).toContain('--background-canvas:');
  });

  it('without prefix, dark mode tokens have no prefix', () => {
    const css = transformToTailwindV4(minimalTokens);
    expect(css).toContain('--background-canvas:');
  });
});

// ---------------------------------------------------------------------------
// Structural output guarantees (prefix-independent)
// ---------------------------------------------------------------------------

describe('transformToTailwindV4 — structural guarantees', () => {
  it('always starts with @import "tailwindcss"', () => {
    const css = transformToTailwindV4(minimalTokens, { prefix: 'su' });
    expect(css.trimStart()).toMatch(/^@import "tailwindcss"/);
  });

  it('always includes @theme block when primitive tokens are present', () => {
    const css = transformToTailwindV4(minimalTokens, { prefix: 'su' });
    expect(css).toContain('@theme {');
  });

  it('does not include dark mode when darkMode=false', () => {
    const css = transformToTailwindV4(minimalTokens, { darkMode: false });
    expect(css).not.toContain('[data-theme="dark"]');
    expect(css).not.toContain('@media (prefers-color-scheme: dark)');
  });
});
