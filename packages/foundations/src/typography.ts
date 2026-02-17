/**
 * Typography mapping: hue → font category → canonical stacks.
 * Based on cultural associations between color temperature and type design.
 */

import type { TypographyCategory } from '@syncupsuite/tokens';

interface TypographyStack {
  heading: string;
  body: string;
  mono: string;
}

const FONT_STACKS: Record<TypographyCategory, TypographyStack> = {
  'humanist-serif': {
    heading: '"Noto Serif JP", "Noto Serif", Georgia, serif',
    body: '"Noto Serif JP", "Noto Serif", Georgia, serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  'slab-serif': {
    heading: '"Roboto Slab", "Rockwell", serif',
    body: '"Source Serif 4", Georgia, serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  'geometric-sans': {
    heading: '"Inter", "Futura", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  'neo-grotesque': {
    heading: '"Inter", "Helvetica Neue", "Arial", sans-serif',
    body: '"Inter", "Helvetica Neue", "Arial", sans-serif',
    mono: '"JetBrains Mono", "SF Mono", monospace',
  },
  'modern-serif': {
    heading: '"Cormorant Garamond", "Didot", Georgia, serif',
    body: '"Source Serif 4", Georgia, serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  'transitional-serif': {
    heading: '"Source Serif 4", "Times New Roman", serif',
    body: '"Source Serif 4", "Times New Roman", serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  'grotesque-sans': {
    heading: '"Source Sans 3", system-ui, sans-serif',
    body: '"Source Sans 3", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
};

/** Map hue to typography category (fallback when foundation doesn't specify). */
export function hueToTypographyCategory(hue: number): TypographyCategory {
  if (hue < 30) return 'humanist-serif';
  if (hue < 60) return 'slab-serif';
  if (hue < 120) return 'grotesque-sans';
  if (hue < 180) return 'transitional-serif';
  if (hue < 240) return 'neo-grotesque';
  if (hue < 300) return 'modern-serif';
  return 'geometric-sans';
}

/** Get font stacks for a typography category. */
export function getFontStacks(category: TypographyCategory): TypographyStack {
  return FONT_STACKS[category];
}

/** Type scale (rem-based, modular). */
export const TYPE_SCALE = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
} as const;

/** Font weight scale. */
export const WEIGHT_SCALE = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Line height scale. */
export const LINE_HEIGHT_SCALE = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
} as const;
