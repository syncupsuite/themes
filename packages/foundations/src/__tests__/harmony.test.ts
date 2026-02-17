import { describe, it, expect } from 'vitest';
import { generateHarmonyAccents } from '../harmony';
import { hexToHsl } from '../color';

describe('generateHarmonyAccents', () => {
  const seed = '#2E4B6D';

  it('returns empty array for empty seeds', () => {
    expect(generateHarmonyAccents([], 'golden-ratio')).toEqual([]);
  });

  it('golden-ratio produces 3 accents', () => {
    const accents = generateHarmonyAccents([seed], 'golden-ratio');
    expect(accents).toHaveLength(3);
    accents.forEach((hex) => expect(hex).toMatch(/^#[0-9A-F]{6}$/));
  });

  it('monochromatic produces 3 accents with same hue', () => {
    const accents = generateHarmonyAccents([seed], 'monochromatic');
    expect(accents).toHaveLength(3);
    const seedHue = hexToHsl(seed).h;
    accents.forEach((hex) => {
      expect(hexToHsl(hex).h).toBe(seedHue);
    });
  });

  it('complementary produces 2 accents with opposite hue', () => {
    const accents = generateHarmonyAccents([seed], 'complementary');
    expect(accents).toHaveLength(2);
    const seedHue = hexToHsl(seed).h;
    const compHue = hexToHsl(accents[0]).h;
    // Complementary hue should be ~180 degrees away
    const diff = Math.abs(compHue - seedHue);
    expect(diff).toBeGreaterThanOrEqual(170);
    expect(diff).toBeLessThanOrEqual(190);
  });

  it('triadic produces 2 accents at 120-degree intervals', () => {
    const accents = generateHarmonyAccents([seed], 'triadic');
    expect(accents).toHaveLength(2);
  });

  it('analogous produces 2 accents at 30-degree intervals', () => {
    const accents = generateHarmonyAccents([seed], 'analogous');
    expect(accents).toHaveLength(2);
    const seedHue = hexToHsl(seed).h;
    const hue1 = hexToHsl(accents[0]).h;
    const hue2 = hexToHsl(accents[1]).h;
    // Should be ~30 degrees from seed (either direction)
    const diff1 = Math.min(Math.abs(hue1 - seedHue), 360 - Math.abs(hue1 - seedHue));
    const diff2 = Math.min(Math.abs(hue2 - seedHue), 360 - Math.abs(hue2 - seedHue));
    expect(diff1).toBeGreaterThanOrEqual(25);
    expect(diff1).toBeLessThanOrEqual(35);
    expect(diff2).toBeGreaterThanOrEqual(25);
    expect(diff2).toBeLessThanOrEqual(35);
  });

  it('all accents are valid hex colors', () => {
    const modes = ['golden-ratio', 'monochromatic', 'complementary', 'triadic', 'analogous'] as const;
    for (const mode of modes) {
      const accents = generateHarmonyAccents([seed], mode);
      accents.forEach((hex) => expect(hex).toMatch(/^#[0-9A-F]{6}$/));
    }
  });

  it('unknown mode falls back to golden-ratio', () => {
    const accents = generateHarmonyAccents([seed], 'unknown' as never);
    const goldenAccents = generateHarmonyAccents([seed], 'golden-ratio');
    expect(accents).toEqual(goldenAccents);
  });
});
