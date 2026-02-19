import { describe, it, expect } from 'vitest';
import {
  hexToOklch,
  oklchToHex,
  hexToHsl,
  hslToHex,
  generateLightnessScale,
  generateNeutrals,
  getHue,
} from '../color';

// ─── OKLCH ────────────────────────────────────────────────────────────────────

describe('hexToOklch', () => {
  it('converts black to L=0', () => {
    const { l } = hexToOklch('#000000');
    expect(l).toBeCloseTo(0, 3);
  });

  it('converts white to L≈1', () => {
    const { l } = hexToOklch('#FFFFFF');
    expect(l).toBeCloseTo(1, 3);
  });

  it('black has zero chroma', () => {
    const { c } = hexToOklch('#000000');
    expect(c).toBeCloseTo(0, 3);
  });

  it('white has zero chroma', () => {
    const { c } = hexToOklch('#FFFFFF');
    expect(c).toBeCloseTo(0, 3);
  });

  it('a saturated color has non-zero chroma', () => {
    const { c } = hexToOklch('#FF0000'); // pure red
    expect(c).toBeGreaterThan(0.1);
  });

  it('lightness is monotonic: dark < mid < light hex values', () => {
    const dark = hexToOklch('#1A1A2E');
    const mid = hexToOklch('#4A6FA5');
    const light = hexToOklch('#C8D8E8');
    expect(dark.l).toBeLessThan(mid.l);
    expect(mid.l).toBeLessThan(light.l);
  });
});

describe('oklchToHex', () => {
  it('round-trips through OKLCH (within 1 decimal hex unit)', () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#2E4B6D', '#D4A017'];
    for (const hex of colors) {
      const oklch = hexToOklch(hex);
      const result = oklchToHex(oklch);
      // Allow ±1 per channel due to float rounding
      for (let i = 1; i <= 5; i += 2) {
        const orig = parseInt(hex.slice(i, i + 2), 16);
        const got = parseInt(result.slice(i, i + 2), 16);
        expect(Math.abs(orig - got)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('clips out-of-gamut values without throwing', () => {
    // High chroma at extreme lightness may exceed sRGB — must not throw
    expect(() => oklchToHex({ l: 0.97, c: 0.35, h: 120 })).not.toThrow();
    expect(() => oklchToHex({ l: 0.10, c: 0.35, h: 30 })).not.toThrow();
  });

  it('returns uppercase hex string starting with #', () => {
    const result = oklchToHex({ l: 0.5, c: 0.1, h: 200 });
    expect(result).toMatch(/^#[0-9A-F]{6}$/);
  });
});

// ─── Scale generation ─────────────────────────────────────────────────────────

describe('generateLightnessScale', () => {
  const seed = '#2E4B6D'; // Hanada (deep Japanese indigo)

  it('produces exactly 10 steps', () => {
    const scale = generateLightnessScale(seed);
    expect(Object.keys(scale)).toHaveLength(10);
  });

  it('has all required step keys', () => {
    const scale = generateLightnessScale(seed);
    const expected = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    for (const k of expected) expect(scale[k]).toBeDefined();
  });

  it('step 500 is the exact seed hex', () => {
    const scale = generateLightnessScale(seed);
    expect(scale['500'].toUpperCase()).toBe(seed.toUpperCase());
  });

  it('scale is monotonically lighter from 900 → 50 (OKLCH L)', () => {
    const scale = generateLightnessScale(seed);
    const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    const lightness = steps.map((s) => hexToOklch(scale[s]).l);
    for (let i = 0; i < lightness.length - 1; i++) {
      expect(lightness[i]).toBeGreaterThan(lightness[i + 1]);
    }
  });

  it('preserves hue for steps with meaningful chroma', () => {
    const scale = generateLightnessScale(seed);
    const seedH = hexToOklch(seed).h;
    for (const [step, hex] of Object.entries(scale)) {
      const { h, c } = hexToOklch(hex);
      // Hue angle is numerically unstable for near-achromatic colors (low chroma);
      // only check when chroma is large enough to make the angle meaningful
      if (step !== '500' && c > 0.02) {
        expect(Math.abs(h - seedH)).toBeLessThan(5);
      }
    }
  });

  it('step 50 is lighter than step 100', () => {
    const scale = generateLightnessScale(seed);
    expect(hexToOklch(scale['50']).l).toBeGreaterThan(hexToOklch(scale['100']).l);
  });

  it('step 900 is darker than step 800', () => {
    const scale = generateLightnessScale(seed);
    expect(hexToOklch(scale['900']).l).toBeLessThan(hexToOklch(scale['800']).l);
  });

  it('all output values are valid hex', () => {
    const scale = generateLightnessScale(seed);
    for (const hex of Object.values(scale)) {
      expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/i);
    }
  });
});

describe('generateNeutrals', () => {
  it('produces 10 neutral steps', () => {
    const neutrals = generateNeutrals('#2E4B6D');
    expect(Object.keys(neutrals)).toHaveLength(10);
  });

  it('neutrals are monotonically lighter from 900 → 50', () => {
    const neutrals = generateNeutrals('#2E4B6D');
    const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    const lightness = steps.map((s) => hexToOklch(neutrals[s]).l);
    for (let i = 0; i < lightness.length - 1; i++) {
      expect(lightness[i]).toBeGreaterThan(lightness[i + 1]);
    }
  });

  it('neutrals have very low OKLCH chroma (not readable as colored)', () => {
    const neutrals = generateNeutrals('#2E4B6D');
    for (const hex of Object.values(neutrals)) {
      const { c } = hexToOklch(hex);
      expect(c).toBeLessThan(0.05);
    }
  });

  it('neutrals have perceptually neutral chroma in OKLCH (< 0.05)', () => {
    // HSL saturation is not used here: it outputs 100% for near-white colors
    // because its denominator approaches 0 at extreme lightness values.
    // OKLCH chroma is the correct perceptual measure.
    const neutrals = generateNeutrals('#2E4B6D');
    for (const hex of Object.values(neutrals)) {
      const { c } = hexToOklch(hex);
      expect(c).toBeLessThan(0.05);
    }
  });

  it('all output values are valid hex', () => {
    const neutrals = generateNeutrals('#2E4B6D');
    for (const hex of Object.values(neutrals)) {
      expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/i);
    }
  });
});

describe('getHue', () => {
  it('returns OKLCH hue for a warm color (reddish)', () => {
    const h = getHue('#FF4500'); // orange-red
    // OKLCH hue for orange-red is roughly 30-50°
    expect(h).toBeGreaterThan(0);
    expect(h).toBeLessThan(100);
  });

  it('returns OKLCH hue for a cool color (blue)', () => {
    const h = getHue('#0000FF'); // pure blue
    // OKLCH hue for blue is roughly 260-270°
    expect(h).toBeGreaterThan(200);
    expect(h).toBeLessThan(310);
  });
});

// ─── Legacy HSL (backward compat) ─────────────────────────────────────────────

describe('hexToHsl (legacy)', () => {
  it('converts pure red', () => {
    const hsl = hexToHsl('#FF0000');
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts black', () => {
    expect(hexToHsl('#000000').l).toBe(0);
  });

  it('converts white', () => {
    expect(hexToHsl('#FFFFFF').l).toBe(100);
  });
});

describe('hslToHex (legacy)', () => {
  it('round-trips through HSL', () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#808080'];
    for (const hex of colors) {
      const hsl = hexToHsl(hex);
      expect(hslToHex(hsl).toLowerCase()).toBe(hex.toLowerCase());
    }
  });
});
