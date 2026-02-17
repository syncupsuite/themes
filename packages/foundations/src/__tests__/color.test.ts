import { describe, it, expect } from 'vitest';
import { hexToHsl, hslToHex, generateLightnessScale, generateNeutrals } from '../color';

describe('hexToHsl', () => {
  it('converts pure red', () => {
    const hsl = hexToHsl('#FF0000');
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts black', () => {
    const hsl = hexToHsl('#000000');
    expect(hsl.l).toBe(0);
  });

  it('converts white', () => {
    const hsl = hexToHsl('#FFFFFF');
    expect(hsl.l).toBe(100);
  });
});

describe('hslToHex', () => {
  it('round-trips through HSL', () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#808080'];
    for (const hex of colors) {
      const hsl = hexToHsl(hex);
      const result = hslToHex(hsl);
      // Allow slight rounding differences
      expect(result.toLowerCase()).toBe(hex.toLowerCase());
    }
  });
});

describe('generateLightnessScale', () => {
  it('produces 10 steps', () => {
    const scale = generateLightnessScale('#2E4B6D');
    expect(Object.keys(scale)).toHaveLength(10);
    expect(scale['500']).toBeDefined();
  });

  it('preserves seed as 500 hue', () => {
    const seed = '#2E4B6D';
    const scale = generateLightnessScale(seed);
    const seedHsl = hexToHsl(seed);
    const fiveHundredHsl = hexToHsl(scale['500']);
    expect(fiveHundredHsl.h).toBe(seedHsl.h);
  });
});

describe('generateNeutrals', () => {
  it('produces 10 neutral steps', () => {
    const neutrals = generateNeutrals('#2E4B6D');
    expect(Object.keys(neutrals)).toHaveLength(10);
  });

  it('neutrals have low saturation', () => {
    const neutrals = generateNeutrals('#2E4B6D');
    for (const hex of Object.values(neutrals)) {
      const hsl = hexToHsl(hex);
      expect(hsl.s).toBeLessThanOrEqual(8);
    }
  });
});
