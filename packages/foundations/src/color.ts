/**
 * OKLCH color math for the token expansion engine.
 *
 * ADR-001: OKLCH replaces HSL for perceptually uniform lightness scales.
 * Equal OKLCH lightness steps produce equal perceived brightness changes
 * across all hues — HSL does not have this property.
 *
 * Legacy HSL exports retained for backward compatibility.
 */

import { assertHex } from '@syncupsuite/tokens';

// ─── OKLCH ────────────────────────────────────────────────────────────────────

export interface OKLCH {
  l: number; // Lightness 0–1 (0 = black, 1 = white)
  c: number; // Chroma 0–0.4+ (0 = achromatic)
  h: number; // Hue angle 0–360
}

/** sRGB gamma removal (linearize a channel value 0–1). */
function toLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** sRGB gamma application (delinearize a linear channel value 0–1). */
function toGamma(v: number): number {
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

/** Convert a 6-digit hex color to OKLCH. */
export function hexToOklch(hex: string): OKLCH {
  assertHex(hex);
  const h = hex.replace('#', '');
  const r = toLinear(parseInt(h.slice(0, 2), 16) / 255);
  const g = toLinear(parseInt(h.slice(2, 4), 16) / 255);
  const b = toLinear(parseInt(h.slice(4, 6), 16) / 255);

  // Linear sRGB → Oklab LMS (combined M1 matrix, Björn Ottosson)
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  // LMS → Oklab (M2 matrix)
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Oklab → OKLCH
  const C = Math.sqrt(a * a + bk * bk);
  const H = ((Math.atan2(bk, a) * 180) / Math.PI + 360) % 360;

  return { l: L, c: C, h: H };
}

/**
 * Convert OKLCH to a 6-digit uppercase hex color.
 * Out-of-gamut sRGB values are clipped (no gamut mapping).
 */
export function oklchToHex({ l, c, h }: OKLCH): string {
  // OKLCH → Oklab
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // Oklab → LMS cube roots (M2 inverse)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  // Cube → Linear sRGB (M1 inverse)
  const lc = l_ * l_ * l_;
  const mc = m_ * m_ * m_;
  const sc = s_ * s_ * s_;

  // Clip to [0, 1] before gamma — simple gamut boundary enforcement
  const r = toGamma(Math.max(0, Math.min(1, +4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc)));
  const g = toGamma(Math.max(0, Math.min(1, -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc)));
  const bv = toGamma(Math.max(0, Math.min(1, -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc)));

  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(bv)}`.toUpperCase();
}

/**
 * Generate a 9-step lightness scale from a seed color using OKLCH.
 *
 * Steps: 50, 100, 200, 300, 400, 500 (seed), 600, 700, 800, 900
 *
 * Lightness is interpolated from the seed outward to white (0.97) and black
 * (0.12). This guarantees monotonic ordering regardless of where the seed
 * falls in the lightness range — a fixed target table fails for dark seeds
 * whose L sits below the lighter dark-step targets.
 *
 * Chroma is reduced at light and dark extremes to avoid oversaturation.
 */
export function generateLightnessScale(seedHex: string): Record<string, string> {
  const seed = hexToOklch(seedHex);
  const L_MAX = 0.97; // step 50
  const L_MIN = 0.12; // step 900

  // Lighter steps: interpolate from L_MAX down to seed.l
  // t=0 → L_MAX (step 50), t=1 → seed.l (step 500)
  const lighterKeys = ['50', '100', '200', '300', '400'] as const;
  const lighterT     = [0,    0.20,  0.40,  0.60,  0.80];

  // Darker steps: interpolate from seed.l down to L_MIN
  // t=0 → seed.l (step 500), t=1 → L_MIN (step 900)
  const darkerKeys = ['600', '700', '800', '900'] as const;
  const darkerT    = [0.25,   0.50,  0.75,  1.00];

  const result: Record<string, string> = {};

  // Step 500: exact seed hex — no float drift
  result['500'] = seedHex.toUpperCase().startsWith('#')
    ? seedHex.toUpperCase()
    : `#${seedHex.toUpperCase()}`;

  for (let i = 0; i < lighterKeys.length; i++) {
    const t = lighterT[i];
    const targetL = L_MAX + t * (seed.l - L_MAX);
    // Chroma rises from 0.25× at step 50 to 1× approaching seed
    const chromaFactor = 0.25 + 0.75 * t;
    result[lighterKeys[i]] = oklchToHex({ l: targetL, c: seed.c * chromaFactor, h: seed.h });
  }

  for (let i = 0; i < darkerKeys.length; i++) {
    const t = darkerT[i];
    const targetL = seed.l + t * (L_MIN - seed.l);
    // Chroma falls gently from 1× at step 600 to 0.6× at step 900
    const chromaFactor = 1.0 - 0.4 * t;
    result[darkerKeys[i]] = oklchToHex({ l: targetL, c: seed.c * chromaFactor, h: seed.h });
  }

  return result;
}

/**
 * Generate neutral colors tinted with the primary hue.
 *
 * Very low OKLCH chroma (0.01–0.04) produces soft hue-tinted neutrals
 * that avoid the "dead gray" look of zero-chroma achromatic scales while
 * maintaining cultural coherence with the primary seed color.
 */
export function generateNeutrals(primaryHex: string): Record<string, string> {
  const seed = hexToOklch(primaryHex);
  // 8% of seed chroma, clamped to keep it clearly neutral (not readable as colored)
  const neutralChroma = Math.min(0.04, Math.max(0.01, seed.c * 0.08));

  const steps: [string, number][] = [
    ['50',  0.98],
    ['100', 0.95],
    ['200', 0.90],
    ['300', 0.82],
    ['400', 0.68],
    ['500', 0.54],
    ['600', 0.42],
    ['700', 0.32],
    ['800', 0.22],
    ['900', 0.13],
  ];

  const result: Record<string, string> = {};
  for (const [step, targetL] of steps) {
    result[step] = oklchToHex({ l: targetL, c: neutralChroma, h: seed.h });
  }
  return result;
}

/** Get hue angle from a hex color (OKLCH H, 0–360). */
export function getHue(hex: string): number {
  return hexToOklch(hex).h;
}

// ─── Legacy HSL (retained for backward compatibility) ─────────────────────────

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/** @deprecated Use hexToOklch for new code. */
export function hexToHsl(hex: string): HSL {
  assertHex(hex);
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let hue: number;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;

  return { h: Math.round(hue * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** @deprecated Use oklchToHex for new code. */
export function hslToHex({ h, s, l }: HSL): string {
  const sn = s / 100;
  const ln = l / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  let r: number, g: number, b: number;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
