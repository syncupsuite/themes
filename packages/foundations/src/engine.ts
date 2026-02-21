/**
 * Foundation engine: builds a complete DTCG token tree from foundation data.
 *
 * Pipeline: seed colors → expanded primitives → neutrals → semantic mapping → cross-domain tokens
 */

import type { DTCGRoot, DTCGTokenGroup, CulturalFoundation, SeedColor, FoundationMeta } from '@syncupsuite/tokens';
import { slugify } from '@syncupsuite/tokens';
import { hexToOklch, generateLightnessScale, generateNeutrals, getHue } from './color';
import { generateHarmonyAccents } from './harmony';
import { getFontStacks, hueToTypographyCategory, TYPE_SCALE, WEIGHT_SCALE, LINE_HEIGHT_SCALE } from './typography';

export interface FoundationData {
  $name: string;
  $description: string;
  $extensions: {
    'syncupsuite.foundation': CulturalFoundation;
  };
  seedColors: SeedColor[];
}

export interface BuildResult {
  tokens: DTCGRoot;
  meta: FoundationMeta;
}

/**
 * Build a complete token tree from foundation data.
 */
export function buildFoundation(data: FoundationData): BuildResult {
  const foundation = data.$extensions['syncupsuite.foundation'];
  const seeds = data.seedColors;

  if (!seeds || seeds.length === 0) {
    throw new Error('Foundation data must include at least one seed color.');
  }

  // Layer 1: Expand seed colors to primitive scales
  const primitiveColors = expandPrimitives(seeds);

  // Generate neutrals tinted by the primary seed
  const neutrals = generateNeutrals(seeds[0].hex);
  primitiveColors['neutral'] = buildColorGroup(neutrals, 'Neutral', 'Primary-hue-tinted neutral');

  // Harmony accents
  const accents = generateHarmonyAccents(
    seeds.map((s) => s.hex),
    foundation.harmonyMode,
  );
  if (accents.length > 0) {
    const accentScale = generateLightnessScale(accents[0]);
    primitiveColors['accent'] = buildColorGroup(accentScale, 'Accent', 'Harmony-derived accent');
  }

  // Layer 2: Typography primitives
  const typoCategory = foundation.typographyCategory || hueToTypographyCategory(getHue(seeds[0].hex));
  const fontStacks = getFontStacks(typoCategory);
  const typographyTokens = buildTypographyPrimitives(fontStacks);

  // Layer 2: Spacing primitives (8px grid)
  const spacingTokens = buildSpacingPrimitives();

  // Layer 2: Radius primitives (culture-influenced)
  const radiusTokens = buildRadiusPrimitives(foundation.radiusTendency);

  // Layer 3: Semantic mapping (light + dark)
  const semantic = buildSemanticTokens(seeds);

  // Assemble root
  const tokens: DTCGRoot = {
    $name: data.$name,
    $description: data.$description,
    $extensions: data.$extensions as unknown as Record<string, unknown>,
    primitive: {
      color: primitiveColors as DTCGTokenGroup,
      typography: typographyTokens,
      spacing: spacingTokens,
      radius: radiusTokens,
    },
    semantic,
  };

  const meta: FoundationMeta = {
    id: data.$name,
    name: data.$description.split(' — ')[0] || data.$name,
    description: data.$description,
    foundation,
    seedColors: seeds,
    validation: { schema: true, contrast: true, completeness: true },
  };

  return { tokens, meta };
}

function expandPrimitives(seeds: SeedColor[]): Record<string, DTCGTokenGroup> {
  const colors: Record<string, DTCGTokenGroup> = {};

  for (const seed of seeds) {
    const id = slugify(seed.name);
    const scale = generateLightnessScale(seed.hex);
    colors[id] = buildColorGroup(scale, seed.name, seed.tradition, seed);
  }

  return colors;
}

function buildColorGroup(
  scale: Record<string, string>,
  name: string,
  tradition: string,
  seed?: SeedColor,
): DTCGTokenGroup {
  const group: DTCGTokenGroup = {};

  for (const [step, hex] of Object.entries(scale)) {
    const token: Record<string, unknown> = {
      $type: 'color',
      $value: hex,
      $description: `${name} ${step}`,
    };

    if (seed && step === '500') {
      token.$extensions = {
        'syncupsuite.provenance': {
          name: seed.name,
          tradition: seed.tradition,
          source: seed.source,
          isSeed: true,
        },
      };
    }

    group[step] = token as DTCGTokenGroup;
  }

  return group;
}

function buildTypographyPrimitives(stacks: { heading: string; body: string; mono: string }): DTCGTokenGroup {
  return {
    family: {
      heading: { $type: 'fontFamily', $value: stacks.heading, $description: 'Heading font family' },
      body: { $type: 'fontFamily', $value: stacks.body, $description: 'Body font family' },
      mono: { $type: 'fontFamily', $value: stacks.mono, $description: 'Monospace font family' },
    } as DTCGTokenGroup,
    size: Object.fromEntries(
      Object.entries(TYPE_SCALE).map(([key, value]) => [
        key,
        { $type: 'dimension', $value: value, $description: `Font size ${key}` },
      ]),
    ) as DTCGTokenGroup,
    weight: Object.fromEntries(
      Object.entries(WEIGHT_SCALE).map(([key, value]) => [
        key,
        { $type: 'fontWeight', $value: value, $description: `Font weight ${key}` },
      ]),
    ) as DTCGTokenGroup,
    lineHeight: Object.fromEntries(
      Object.entries(LINE_HEIGHT_SCALE).map(([key, value]) => [
        key,
        { $type: 'number', $value: value, $description: `Line height ${key}` },
      ]),
    ) as DTCGTokenGroup,
  };
}

function buildSpacingPrimitives(): DTCGTokenGroup {
  const scale: Record<string, string> = {
    '0': '0px',
    '0.5': '2px',
    '1': '4px',
    '1.5': '6px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
    '20': '80px',
  };

  return Object.fromEntries(
    Object.entries(scale).map(([key, value]) => [
      key,
      { $type: 'dimension', $value: value, $description: `Spacing ${key} (${value})` },
    ]),
  ) as DTCGTokenGroup;
}

function buildRadiusPrimitives(tendency: CulturalFoundation['radiusTendency']): DTCGTokenGroup {
  const scales: Record<string, Record<string, string>> = {
    none: { none: '0px', sm: '0px', md: '0px', lg: '0px', xl: '0px', full: '9999px' },
    subtle: { none: '0px', sm: '2px', md: '4px', lg: '6px', xl: '8px', full: '9999px' },
    moderate: { none: '0px', sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
    rounded: { none: '0px', sm: '8px', md: '12px', lg: '16px', xl: '24px', full: '9999px' },
  };

  const scale = scales[tendency] || scales.moderate;

  return Object.fromEntries(
    Object.entries(scale).map(([key, value]) => [
      key,
      { $type: 'dimension', $value: value, $description: `Border radius ${key}` },
    ]),
  ) as DTCGTokenGroup;
}

/**
 * Select the best seed for dark-mode interactive colors.
 *
 * When the primary seed is very dark (OKLCH L < 0.2), its lightness scale
 * produces steps that lack contrast on dark backgrounds. In that case,
 * pick the most chromatic seed in a usable lightness range.
 *
 * For Swiss: Schwarz (L≈0.06) → falls through to Rot (highest chroma, L≈0.61).
 */
function selectDarkInteractiveId(seeds: SeedColor[], primaryId: string): string {
  const primaryOklch = hexToOklch(seeds[0].hex);

  // If the primary is light enough, keep it for dark mode too
  if (primaryOklch.l >= 0.2) return primaryId;

  // Find the most chromatic seed in a usable lightness range
  let bestSeed: SeedColor | null = null;
  let bestChroma = -1;
  for (const seed of seeds) {
    const oklch = hexToOklch(seed.hex);
    // Usable range: not too dark to fail on dark backgrounds, not too light to look washed
    if (oklch.l > 0.2 && oklch.l < 0.85 && oklch.c > bestChroma) {
      bestChroma = oklch.c;
      bestSeed = seed;
    }
  }

  return bestSeed ? slugify(bestSeed.name) : primaryId;
}

function buildSemanticTokens(seeds: SeedColor[]): { light: DTCGTokenGroup; dark: DTCGTokenGroup } {
  // Derive key color references from first seed
  const primaryId = slugify(seeds[0].name);

  // Pick a suitable color for dark-mode interactive (may differ from primary for very dark seeds)
  const darkInteractiveId = selectDarkInteractiveId(seeds, primaryId);

  // Find a warm/red seed for error, or fallback
  const errorSeed = seeds.find((s) => {
    const hue = getHue(s.hex);
    return hue < 30 || hue > 340;
  });
  const errorId = errorSeed
    ? slugify(errorSeed.name)
    : primaryId;

  return {
    light: {
      background: {
        canvas: { $type: 'color', $value: '{primitive.color.neutral.50}', $description: 'Page background' },
        surface: { $type: 'color', $value: '#FFFFFF', $description: 'Card/surface background' },
        muted: { $type: 'color', $value: '{primitive.color.neutral.100}', $description: 'Muted background' },
      } as DTCGTokenGroup,
      text: {
        primary: { $type: 'color', $value: '{primitive.color.neutral.900}', $description: 'Primary text' },
        secondary: { $type: 'color', $value: '{primitive.color.neutral.600}', $description: 'Secondary text' },
        muted: { $type: 'color', $value: '{primitive.color.neutral.500}', $description: 'Muted/disabled text' },
        inverse: { $type: 'color', $value: '{primitive.color.neutral.50}', $description: 'Text on dark backgrounds' },
      } as DTCGTokenGroup,
      interactive: {
        primary: { $type: 'color', $value: `{primitive.color.${primaryId}.500}`, $description: 'Primary interactive (buttons, links)' },
        'primary-hover': { $type: 'color', $value: `{primitive.color.${primaryId}.600}`, $description: 'Primary interactive hover' },
        'primary-active': { $type: 'color', $value: `{primitive.color.${primaryId}.700}`, $description: 'Primary interactive active' },
      } as DTCGTokenGroup,
      border: {
        default: { $type: 'color', $value: '{primitive.color.neutral.200}', $description: 'Default border' },
        strong: { $type: 'color', $value: '{primitive.color.neutral.400}', $description: 'Strong border' },
      } as DTCGTokenGroup,
      status: {
        error: { $type: 'color', $value: '#DC2626', $description: 'Error — WCAG-compliant red' },
        success: { $type: 'color', $value: '#16A34A', $description: 'Success — WCAG-compliant green' },
        warning: { $type: 'color', $value: '#A16207', $description: 'Warning — WCAG AA amber (4.5:1+ on white)' },
        info: { $type: 'color', $value: `{primitive.color.${primaryId}.500}`, $description: 'Info status' },
      } as DTCGTokenGroup,
      focus: {
        ring: { $type: 'color', $value: `{primitive.color.${primaryId}.500}`, $description: 'Focus ring color' },
      } as DTCGTokenGroup,
      accessibility: {
        'focus-visible': { $type: 'color', $value: `{primitive.color.${primaryId}.500}`, $description: 'Keyboard focus indicator' },
      } as DTCGTokenGroup,
    },
    dark: {
      background: {
        canvas: { $type: 'color', $value: '{primitive.color.neutral.900}', $description: 'Page background — dark' },
        surface: { $type: 'color', $value: '{primitive.color.neutral.800}', $description: 'Card/surface — dark' },
        muted: { $type: 'color', $value: '{primitive.color.neutral.700}', $description: 'Muted background — dark' },
      } as DTCGTokenGroup,
      text: {
        primary: { $type: 'color', $value: '{primitive.color.neutral.50}', $description: 'Primary text — dark' },
        secondary: { $type: 'color', $value: '{primitive.color.neutral.300}', $description: 'Secondary text — dark' },
        muted: { $type: 'color', $value: '{primitive.color.neutral.500}', $description: 'Muted text — dark' },
        inverse: { $type: 'color', $value: '{primitive.color.neutral.900}', $description: 'Text on light backgrounds — dark' },
      } as DTCGTokenGroup,
      interactive: {
        primary: { $type: 'color', $value: `{primitive.color.${darkInteractiveId}.400}`, $description: 'Primary interactive — dark' },
        'primary-hover': { $type: 'color', $value: `{primitive.color.${darkInteractiveId}.300}`, $description: 'Primary hover — dark' },
        'primary-active': { $type: 'color', $value: `{primitive.color.${darkInteractiveId}.200}`, $description: 'Primary active — dark' },
      } as DTCGTokenGroup,
      border: {
        default: { $type: 'color', $value: '{primitive.color.neutral.700}', $description: 'Default border — dark' },
        strong: { $type: 'color', $value: '{primitive.color.neutral.500}', $description: 'Strong border — dark' },
      } as DTCGTokenGroup,
      status: {
        error: { $type: 'color', $value: '#EF4444', $description: 'Error — WCAG-compliant red (dark)' },
        success: { $type: 'color', $value: '#22C55E', $description: 'Success — WCAG-compliant green (dark)' },
        warning: { $type: 'color', $value: '#EAB308', $description: 'Warning — WCAG-compliant amber (dark)' },
        info: { $type: 'color', $value: `{primitive.color.${darkInteractiveId}.400}`, $description: 'Info — dark' },
      } as DTCGTokenGroup,
      focus: {
        ring: { $type: 'color', $value: `{primitive.color.${darkInteractiveId}.400}`, $description: 'Focus ring — dark' },
      } as DTCGTokenGroup,
      accessibility: {
        'focus-visible': { $type: 'color', $value: `{primitive.color.${darkInteractiveId}.400}`, $description: 'Keyboard focus — dark' },
      } as DTCGTokenGroup,
    },
  };
}
