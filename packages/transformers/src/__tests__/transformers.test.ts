import { describe, it, expect } from 'vitest';
import { transformToTailwindV4 } from '../tailwind-v4';
import { transformToCSS } from '../css';
import type { DTCGRoot } from '@syncupsuite/tokens';

const sampleTokens: DTCGRoot = {
  $name: 'test-theme',
  primitive: {
    color: {
      red: {
        '500': { $type: 'color', $value: '#FF0000', $description: 'Red 500' },
      },
      neutral: {
        '50': { $type: 'color', $value: '#F5F5F5', $description: 'Neutral 50' },
        '900': { $type: 'color', $value: '#111111', $description: 'Neutral 900' },
      },
    },
    spacing: {
      '2': { $type: 'dimension', $value: '8px', $description: 'Base unit' },
    },
    typography: {
      family: {
        heading: { $type: 'fontFamily', $value: '"Inter", sans-serif', $description: 'Heading' },
      },
      size: {
        base: { $type: 'dimension', $value: '1rem', $description: 'Base' },
      },
    },
    radius: {
      md: { $type: 'dimension', $value: '8px', $description: 'Medium' },
    },
  },
  semantic: {
    light: {
      background: {
        canvas: { $type: 'color', $value: '{primitive.color.neutral.50}', $description: 'Page bg' },
        surface: { $type: 'color', $value: '#FFFFFF', $description: 'Surface bg' },
        muted: { $type: 'color', $value: '{primitive.color.neutral.50}', $description: 'Muted bg' },
      },
      text: {
        primary: { $type: 'color', $value: '{primitive.color.neutral.900}', $description: 'Body text' },
        secondary: { $type: 'color', $value: '{primitive.color.neutral.900}', $description: 'Secondary text' },
        muted: { $type: 'color', $value: '{primitive.color.neutral.900}', $description: 'Muted text' },
        inverse: { $type: 'color', $value: '{primitive.color.neutral.50}', $description: 'Inverse text' },
      },
      interactive: {
        primary: { $type: 'color', $value: '{primitive.color.red.500}', $description: 'Primary action' },
        'primary-hover': { $type: 'color', $value: '{primitive.color.red.500}', $description: 'Hover' },
        'primary-active': { $type: 'color', $value: '{primitive.color.red.500}', $description: 'Active' },
      },
      border: {
        default: { $type: 'color', $value: '{primitive.color.neutral.50}', $description: 'Border' },
        strong: { $type: 'color', $value: '{primitive.color.neutral.900}', $description: 'Strong border' },
      },
      status: {
        error: { $type: 'color', $value: '#DC2626', $description: 'Error' },
        success: { $type: 'color', $value: '#16A34A', $description: 'Success' },
        warning: { $type: 'color', $value: '#A16207', $description: 'Warning' },
        info: { $type: 'color', $value: '{primitive.color.red.500}', $description: 'Info' },
      },
      focus: {
        ring: { $type: 'color', $value: '{primitive.color.red.500}', $description: 'Focus ring' },
      },
      accessibility: {
        'focus-visible': { $type: 'color', $value: '{primitive.color.red.500}', $description: 'Focus visible' },
      },
    },
    dark: {
      background: {
        canvas: { $type: 'color', $value: '{primitive.color.neutral.900}', $description: 'Page bg dark' },
      },
      text: {
        primary: { $type: 'color', $value: '{primitive.color.neutral.50}', $description: 'Body text dark' },
      },
    },
  },
};

describe('transformToTailwindV4', () => {
  it('includes @import "tailwindcss"', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('@import "tailwindcss"');
  });

  it('includes @theme block', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('@theme {');
    expect(css).toContain('--color-red-500: #FF0000');
  });

  it('includes spacing in @theme', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('--spacing-2: 8px');
  });

  it('includes font families in @theme', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('--font-heading: "Inter", sans-serif');
  });

  it('includes radius in @theme', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('--radius-md: 8px');
  });

  it('generates :root with light semantic tokens', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain(':root {');
    expect(css).toContain('var(--primitive-color-neutral-50)');
  });

  it('generates dark mode selector', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('[data-theme="dark"]');
  });

  it('supports media strategy for dark mode', () => {
    const css = transformToTailwindV4(sampleTokens, { darkModeStrategy: 'media' });
    expect(css).toContain('@media (prefers-color-scheme: dark)');
  });

  it('can disable dark mode', () => {
    const css = transformToTailwindV4(sampleTokens, { darkMode: false });
    expect(css).not.toContain('[data-theme="dark"]');
  });

  it('includes semantic color @theme block with canvas', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('--color-canvas: var(--background-canvas)');
  });

  it('includes semantic foreground mapping', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('--color-foreground: var(--text-primary)');
    expect(css).toContain('--color-foreground-secondary: var(--text-secondary)');
  });

  it('includes semantic primary/interactive mapping', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('--color-primary: var(--interactive-primary)');
    expect(css).toContain('--color-primary-hover: var(--interactive-primary-hover)');
  });

  it('includes semantic border and ring mapping', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('--color-border: var(--border-default)');
    expect(css).toContain('--color-ring: var(--focus-ring)');
  });

  it('includes semantic status mappings', () => {
    const css = transformToTailwindV4(sampleTokens);
    expect(css).toContain('--color-error: var(--status-error)');
    expect(css).toContain('--color-success: var(--status-success)');
    expect(css).toContain('--color-warning: var(--status-warning)');
    expect(css).toContain('--color-info: var(--status-info)');
  });

  it('places semantic @theme block after primitive @theme block', () => {
    const css = transformToTailwindV4(sampleTokens);
    const primitiveThemeIdx = css.indexOf('--color-red-500');
    const semanticThemeIdx = css.indexOf('--color-canvas: var(--background-canvas)');
    expect(primitiveThemeIdx).toBeGreaterThan(-1);
    expect(semanticThemeIdx).toBeGreaterThan(-1);
    expect(semanticThemeIdx).toBeGreaterThan(primitiveThemeIdx);
  });
});

describe('transformToCSS', () => {
  it('produces :root block', () => {
    const css = transformToCSS(sampleTokens);
    expect(css).toContain(':root {');
  });

  it('includes primitive color tokens', () => {
    const css = transformToCSS(sampleTokens);
    expect(css).toContain('--primitive-color-red-500: #FF0000');
  });

  it('includes semantic light tokens in :root', () => {
    const css = transformToCSS(sampleTokens);
    expect(css).toContain('--background-canvas:');
  });

  it('includes dark mode block', () => {
    const css = transformToCSS(sampleTokens);
    expect(css).toContain('[data-theme="dark"]');
  });

  it('resolves DTCG references', () => {
    const css = transformToCSS(sampleTokens);
    expect(css).toContain('var(--primitive-color-neutral-50)');
  });

  it('includes API contract banner', () => {
    const css = transformToCSS(sampleTokens);
    expect(css).toContain('CONSUMER API');
    expect(css).toContain('var(--background-canvas | surface | muted)');
    expect(css).toContain('var(--text-primary | secondary | muted | inverse)');
  });

  it('omits banner when comments disabled', () => {
    const css = transformToCSS(sampleTokens, { includeComments: false });
    expect(css).not.toContain('CONSUMER API');
  });
});
