/**
 * Canonical DTCG token types.
 *
 * Design Tokens Community Group (DTCG) format is the standard for
 * all token definitions. Spec: https://tr.designtokens.org/format/
 */

/** Vendor extension metadata for cultural provenance. */
export interface Provenance {
  name: string;
  tradition: string;
  source: string;
  isSeed?: boolean;
}

/** Cultural foundation metadata attached to a foundation JSON file. */
export interface CulturalFoundation {
  story: string;
  philosophy: string;
  era: string;
  harmonyMode: HarmonyMode;
  radiusTendency: 'none' | 'subtle' | 'moderate' | 'rounded';
  typographyCategory: TypographyCategory;
}

export type HarmonyMode =
  | 'golden-ratio'
  | 'monochromatic'
  | 'complementary'
  | 'triadic'
  | 'analogous';

export type TypographyCategory =
  | 'humanist-serif'
  | 'slab-serif'
  | 'geometric-sans'
  | 'neo-grotesque'
  | 'modern-serif'
  | 'transitional-serif'
  | 'grotesque-sans';

/** DTCG token value — string for most types, composite for typography/border/shadow. */
export type DTCGTokenValue = string | number | boolean | Record<string, unknown> | unknown[];

/** A single design token conforming to the DTCG specification. */
export interface DTCGToken {
  $type: string;
  $value: DTCGTokenValue;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

/** A group of tokens or nested groups. */
export interface DTCGTokenGroup {
  [key: string]: DTCGToken | DTCGTokenGroup | string | Record<string, unknown> | undefined;
}

/**
 * Root token tree structure.
 *
 * Expected hierarchy:
 *   primitive.color.<name>.<scale>   — raw color values
 *   primitive.spacing.<name>         — raw spacing values
 *   primitive.typography.<category>  — font families, sizes, weights
 *   primitive.radius.<name>          — border radius values
 *   semantic.light.<purpose>         — light mode semantic mappings
 *   semantic.dark.<purpose>          — dark mode semantic mappings
 */
export interface DTCGRoot {
  $name?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
  primitive?: DTCGTokenGroup;
  semantic?: {
    light?: DTCGTokenGroup;
    dark?: DTCGTokenGroup;
  };
  [key: string]: DTCGTokenGroup | string | Record<string, unknown> | undefined | { light?: DTCGTokenGroup; dark?: DTCGTokenGroup };
}

export interface TransformOptions {
  /** Include dark mode semantic mappings. Default: true */
  darkMode?: boolean;
  /** Dark mode strategy: 'class' uses [data-theme="dark"], 'media' uses prefers-color-scheme. Default: 'class' */
  darkModeStrategy?: 'class' | 'media';
  /** Include source comments with $description. Default: true */
  includeComments?: boolean;
  /** Prefix for CSS custom properties. Default: '' (no prefix) */
  prefix?: string;
}

/** Seed color definition for foundation data. */
export interface SeedColor {
  hex: string;
  name: string;
  tradition: string;
  source: string;
}

/** Metadata returned alongside a built theme. */
export interface FoundationMeta {
  id: string;
  name: string;
  description: string;
  foundation: CulturalFoundation;
  seedColors: SeedColor[];
  validation: {
    schema: boolean;
    contrast: boolean;
    completeness: boolean;
  };
}
