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
