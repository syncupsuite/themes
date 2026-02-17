/**
 * Color harmony calculations.
 * Given a set of seed colors and a harmony mode, produces accent/complementary colors.
 */

import type { HarmonyMode } from '@syncupsuite/tokens';
import { hexToHsl, hslToHex, type HSL } from './color';

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

/**
 * Generate harmony colors from seeds based on the specified mode.
 * Returns additional accent colors to complement the seed palette.
 */
export function generateHarmonyAccents(
  seedHexes: string[],
  mode: HarmonyMode,
): string[] {
  if (seedHexes.length === 0) return [];

  const primaryHsl = hexToHsl(seedHexes[0]);

  switch (mode) {
    case 'golden-ratio':
      return goldenRatioAccents(primaryHsl);
    case 'monochromatic':
      return monochromaticAccents(primaryHsl);
    case 'complementary':
      return complementaryAccents(primaryHsl);
    case 'triadic':
      return triadicAccents(primaryHsl);
    case 'analogous':
      return analogousAccents(primaryHsl);
    default:
      return goldenRatioAccents(primaryHsl);
  }
}

function goldenRatioAccents(hsl: HSL): string[] {
  const accents: string[] = [];
  let hue = hsl.h;
  for (let i = 0; i < 3; i++) {
    hue = (hue + 360 * GOLDEN_RATIO_CONJUGATE) % 360;
    accents.push(hslToHex({ h: Math.round(hue), s: hsl.s, l: hsl.l }));
  }
  return accents;
}

function monochromaticAccents(hsl: HSL): string[] {
  return [
    hslToHex({ h: hsl.h, s: Math.min(100, hsl.s + 15), l: Math.min(90, hsl.l + 20) }),
    hslToHex({ h: hsl.h, s: Math.max(0, hsl.s - 10), l: Math.max(10, hsl.l - 20) }),
    hslToHex({ h: hsl.h, s: Math.min(100, hsl.s + 5), l: 50 }),
  ];
}

function complementaryAccents(hsl: HSL): string[] {
  const comp = (hsl.h + 180) % 360;
  return [
    hslToHex({ h: comp, s: hsl.s, l: hsl.l }),
    hslToHex({ h: comp, s: Math.max(0, hsl.s - 15), l: Math.min(90, hsl.l + 15) }),
  ];
}

function triadicAccents(hsl: HSL): string[] {
  return [
    hslToHex({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }),
  ];
}

function analogousAccents(hsl: HSL): string[] {
  return [
    hslToHex({ h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }),
    hslToHex({ h: (hsl.h + 330) % 360, s: hsl.s, l: hsl.l }),
  ];
}
