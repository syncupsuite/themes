import { describe, it, expect } from 'vitest';
import { hueToTypographyCategory, getFontStacks, TYPE_SCALE, WEIGHT_SCALE, LINE_HEIGHT_SCALE } from '../typography';

describe('hueToTypographyCategory', () => {
  it('maps warm hues (0-30) to humanist-serif', () => {
    expect(hueToTypographyCategory(0)).toBe('humanist-serif');
    expect(hueToTypographyCategory(15)).toBe('humanist-serif');
    expect(hueToTypographyCategory(29)).toBe('humanist-serif');
  });

  it('maps yellow hues (30-60) to slab-serif', () => {
    expect(hueToTypographyCategory(30)).toBe('slab-serif');
    expect(hueToTypographyCategory(45)).toBe('slab-serif');
  });

  it('maps green hues (60-120) to grotesque-sans', () => {
    expect(hueToTypographyCategory(60)).toBe('grotesque-sans');
    expect(hueToTypographyCategory(90)).toBe('grotesque-sans');
  });

  it('maps cyan hues (120-180) to transitional-serif', () => {
    expect(hueToTypographyCategory(120)).toBe('transitional-serif');
    expect(hueToTypographyCategory(150)).toBe('transitional-serif');
  });

  it('maps blue hues (180-240) to neo-grotesque', () => {
    expect(hueToTypographyCategory(180)).toBe('neo-grotesque');
    expect(hueToTypographyCategory(210)).toBe('neo-grotesque');
  });

  it('maps purple hues (240-300) to modern-serif', () => {
    expect(hueToTypographyCategory(240)).toBe('modern-serif');
    expect(hueToTypographyCategory(270)).toBe('modern-serif');
  });

  it('maps magenta hues (300+) to geometric-sans', () => {
    expect(hueToTypographyCategory(300)).toBe('geometric-sans');
    expect(hueToTypographyCategory(330)).toBe('geometric-sans');
  });
});

describe('getFontStacks', () => {
  it('returns heading, body, mono for each category', () => {
    const categories = [
      'humanist-serif', 'slab-serif', 'geometric-sans',
      'neo-grotesque', 'modern-serif', 'transitional-serif', 'grotesque-sans',
    ] as const;

    for (const cat of categories) {
      const stacks = getFontStacks(cat);
      expect(stacks.heading).toBeTruthy();
      expect(stacks.body).toBeTruthy();
      expect(stacks.mono).toBeTruthy();
      expect(stacks.mono).toContain('monospace');
    }
  });
});

describe('scales', () => {
  it('TYPE_SCALE has expected keys', () => {
    expect(TYPE_SCALE.xs).toBe('0.75rem');
    expect(TYPE_SCALE.base).toBe('1rem');
    expect(TYPE_SCALE['4xl']).toBe('2.25rem');
  });

  it('WEIGHT_SCALE has expected keys', () => {
    expect(WEIGHT_SCALE.normal).toBe('400');
    expect(WEIGHT_SCALE.bold).toBe('700');
  });

  it('LINE_HEIGHT_SCALE has expected keys', () => {
    expect(LINE_HEIGHT_SCALE.tight).toBe('1.25');
    expect(LINE_HEIGHT_SCALE.normal).toBe('1.5');
    expect(LINE_HEIGHT_SCALE.relaxed).toBe('1.75');
  });
});
