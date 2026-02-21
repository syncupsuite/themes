// Types
export type {
  DTCGToken,
  DTCGTokenValue,
  DTCGTokenGroup,
  DTCGRoot,
  TransformOptions,
  BuiltTheme,
  CulturalFoundation,
  SeedColor,
  Provenance,
  HarmonyMode,
  TypographyCategory,
  FoundationMeta,
} from './types';

// Utilities
export {
  isToken,
  flattenTokens,
  pathToProperty,
  resolveReference,
  walkTokens,
  resolvePath,
  slugify,
  sanitizeCssValue,
  sanitizeCssComment,
  assertHex,
  formatCssValue,
} from './utilities';

// Constants
export {
  PROTECTED_TOKEN_PATHS,
  REQUIRED_SEMANTIC_TOKENS,
  CONTRAST_PAIRS,
  PERF_BUDGETS,
} from './constants';
export type { ContrastPair } from './constants';

// Validation
export type { ValidationResult, ValidationError, ValidationWarning, ContrastAuditResult, ContrastPairResult } from './validation';
export {
  validateSchema,
  validateCompleteness,
  validateContrast,
  validateThemeContrast,
  validateOverride,
  validateReferences,
} from './validation';
