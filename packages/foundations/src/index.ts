// Foundation engine
export { buildFoundation } from './engine';
export type { FoundationData, BuildResult } from './engine';

// Color utilities
export { hexToHsl, hslToHex, generateLightnessScale, generateNeutrals, getHue } from './color';
export type { HSL } from './color';

// Harmony
export { generateHarmonyAccents } from './harmony';

// Typography
export { getFontStacks, hueToTypographyCategory, TYPE_SCALE, WEIGHT_SCALE, LINE_HEIGHT_SCALE } from './typography';

// Foundation data loaders
import nihonData from '../data/nihon-traditional.json';
import swissData from '../data/swiss-international.json';
import type { FoundationData } from './engine';

export const nihonTraditionalData = nihonData as unknown as FoundationData;
export const swissInternationalData = swissData as unknown as FoundationData;
