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
      },
      text: {
        primary: { $type: 'color', $value: '{primitive.color.neutral.900}', $description: 'Body text' },
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
});
