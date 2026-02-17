/**
 * HSL color math for the token expansion engine.
 */

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export function hexToHsl(hex: string): HSL {
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

/**
 * Generate a 9-step lightness scale from a seed color.
 * Steps: 50, 100, 200, 300, 400, 500 (seed), 600, 700, 800, 900
 */
export function generateLightnessScale(seedHex: string): Record<string, string> {
  const hsl = hexToHsl(seedHex);

  // Target lightness values for each step
  const steps: Record<string, number> = {
    '50': 95,
    '100': 90,
    '200': 80,
    '300': 70,
    '400': 60,
    '500': hsl.l, // preserve seed lightness
    '600': Math.max(hsl.l - 8, 15),
    '700': Math.max(hsl.l - 18, 10),
    '800': Math.max(hsl.l - 28, 7),
    '900': Math.max(hsl.l - 38, 4),
  };

  // Slight saturation adjustments: desaturate at extremes
  const result: Record<string, string> = {};
  for (const [step, lightness] of Object.entries(steps)) {
    const satAdjust =
      lightness > 85 ? hsl.s * 0.3 : lightness < 15 ? hsl.s * 0.6 : hsl.s;
    result[step] = hslToHex({
      h: hsl.h,
      s: Math.round(Math.min(100, Math.max(0, satAdjust))),
      l: Math.round(Math.min(98, Math.max(3, lightness))),
    });
  }

  return result;
}

/**
 * Generate neutral colors tinted with the primary hue (3-8% saturation).
 */
export function generateNeutrals(primaryHex: string): Record<string, string> {
  const hsl = hexToHsl(primaryHex);
  const neutralSat = Math.min(8, Math.max(3, Math.round(hsl.s * 0.1)));

  const steps: Record<string, number> = {
    '50': 97,
    '100': 94,
    '200': 88,
    '300': 78,
    '400': 62,
    '500': 46,
    '600': 36,
    '700': 26,
    '800': 16,
    '900': 8,
  };

  const result: Record<string, string> = {};
  for (const [step, lightness] of Object.entries(steps)) {
    result[step] = hslToHex({ h: hsl.h, s: neutralSat, l: lightness });
  }

  return result;
}

/** Get hue value from hex for typography mapping. */
export function getHue(hex: string): number {
  return hexToHsl(hex).h;
}
