/**
 * Token paths that CANNOT be overridden by tenant customization.
 * These protect accessibility-critical UI patterns.
 */
export const PROTECTED_TOKEN_PATHS = [
  'semantic.light.status.error',
  'semantic.light.status.success',
  'semantic.light.status.warning',
  'semantic.dark.status.error',
  'semantic.dark.status.success',
  'semantic.dark.status.warning',
  'semantic.light.focus.ring',
  'semantic.dark.focus.ring',
  'semantic.light.accessibility',
  'semantic.dark.accessibility',
] as const;

/**
 * Required semantic token paths that every theme must define.
 */
export const REQUIRED_SEMANTIC_TOKENS = [
  'semantic.light.background.canvas',
  'semantic.light.background.surface',
  'semantic.light.text.primary',
  'semantic.light.text.secondary',
  'semantic.light.interactive.primary',
  'semantic.light.border.default',
  'semantic.light.status.error',
  'semantic.light.status.success',
  'semantic.light.status.warning',
  'semantic.dark.background.canvas',
  'semantic.dark.background.surface',
  'semantic.dark.text.primary',
  'semantic.dark.text.secondary',
  'semantic.dark.interactive.primary',
  'semantic.dark.border.default',
  'semantic.dark.status.error',
  'semantic.dark.status.success',
  'semantic.dark.status.warning',
] as const;

/**
 * Critical semantic foreground/background pairs that must meet WCAG 2.1 contrast.
 * Each pair specifies the text token path, background token path, and minimum ratio.
 *
 * AA normal text: 4.5:1, AA large text: 3:1
 */
export interface ContrastPair {
  fg: string;
  bg: string;
  minRatio: number;
  label: string;
}

export const CONTRAST_PAIRS: ContrastPair[] = [
  // Light mode — normal text (4.5:1)
  { fg: 'semantic.light.text.primary', bg: 'semantic.light.background.canvas', minRatio: 4.5, label: 'Light: primary text on canvas' },
  { fg: 'semantic.light.text.primary', bg: 'semantic.light.background.surface', minRatio: 4.5, label: 'Light: primary text on surface' },
  { fg: 'semantic.light.text.secondary', bg: 'semantic.light.background.canvas', minRatio: 4.5, label: 'Light: secondary text on canvas' },
  { fg: 'semantic.light.text.secondary', bg: 'semantic.light.background.surface', minRatio: 4.5, label: 'Light: secondary text on surface' },
  // Light mode — muted text as large text (3:1)
  { fg: 'semantic.light.text.muted', bg: 'semantic.light.background.canvas', minRatio: 3, label: 'Light: muted text on canvas (large text)' },
  // Light mode — interactive (4.5:1 for text-like usage)
  { fg: 'semantic.light.interactive.primary', bg: 'semantic.light.background.canvas', minRatio: 3, label: 'Light: interactive primary on canvas' },
  { fg: 'semantic.light.interactive.primary', bg: 'semantic.light.background.surface', minRatio: 3, label: 'Light: interactive primary on surface' },
  // Light mode — status colors on canvas
  { fg: 'semantic.light.status.error', bg: 'semantic.light.background.canvas', minRatio: 3, label: 'Light: error on canvas' },
  { fg: 'semantic.light.status.success', bg: 'semantic.light.background.canvas', minRatio: 3, label: 'Light: success on canvas' },
  { fg: 'semantic.light.status.warning', bg: 'semantic.light.background.canvas', minRatio: 3, label: 'Light: warning on canvas' },
  // Dark mode — normal text (4.5:1)
  { fg: 'semantic.dark.text.primary', bg: 'semantic.dark.background.canvas', minRatio: 4.5, label: 'Dark: primary text on canvas' },
  { fg: 'semantic.dark.text.primary', bg: 'semantic.dark.background.surface', minRatio: 4.5, label: 'Dark: primary text on surface' },
  { fg: 'semantic.dark.text.secondary', bg: 'semantic.dark.background.canvas', minRatio: 4.5, label: 'Dark: secondary text on canvas' },
  { fg: 'semantic.dark.text.secondary', bg: 'semantic.dark.background.surface', minRatio: 4.5, label: 'Dark: secondary text on surface' },
  // Dark mode — muted text as large text (3:1)
  { fg: 'semantic.dark.text.muted', bg: 'semantic.dark.background.canvas', minRatio: 3, label: 'Dark: muted text on canvas (large text)' },
  // Dark mode — interactive
  { fg: 'semantic.dark.interactive.primary', bg: 'semantic.dark.background.canvas', minRatio: 3, label: 'Dark: interactive primary on canvas' },
  { fg: 'semantic.dark.interactive.primary', bg: 'semantic.dark.background.surface', minRatio: 3, label: 'Dark: interactive primary on surface' },
  // Dark mode — status colors
  { fg: 'semantic.dark.status.error', bg: 'semantic.dark.background.canvas', minRatio: 3, label: 'Dark: error on canvas' },
  { fg: 'semantic.dark.status.success', bg: 'semantic.dark.background.canvas', minRatio: 3, label: 'Dark: success on canvas' },
  { fg: 'semantic.dark.status.warning', bg: 'semantic.dark.background.canvas', minRatio: 3, label: 'Dark: warning on canvas' },
];

/**
 * Performance budgets for generated output.
 */
export const PERF_BUDGETS = {
  /** Maximum gzipped CSS size in bytes (20KB) */
  maxCssGzipped: 20_480,
  /** Maximum number of CSS custom properties per theme */
  maxProperties: 500,
  /** Maximum token tree depth */
  maxDepth: 8,
} as const;
