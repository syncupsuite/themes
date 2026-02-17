import type { DTCGToken } from './types';
import { walkTokens, resolvePath } from './utilities';
import { PROTECTED_TOKEN_PATHS, REQUIRED_SEMANTIC_TOKENS } from './constants';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  rule: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  rule: string;
}

/**
 * Validate a DTCG token tree for schema compliance.
 */
export function validateSchema(tokens: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  walkTokens(tokens, '', (path, token) => {
    if (!token.$type) {
      errors.push({ path, message: 'Token missing $type field', rule: 'schema.type' });
    }
    if (token.$value === undefined || token.$value === null) {
      errors.push({ path, message: 'Token missing $value field', rule: 'schema.value' });
    }
    if (!token.$description) {
      warnings.push({ path, message: 'Token missing $description (recommended)', rule: 'schema.description' });
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate that all required semantic tokens are present.
 */
export function validateCompleteness(tokens: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];

  for (const path of REQUIRED_SEMANTIC_TOKENS) {
    const value = resolvePath(tokens, path);
    if (!value) {
      errors.push({ path, message: `Required semantic token missing: ${path}`, rule: 'completeness.required' });
    }
  }

  return { valid: errors.length === 0, errors, warnings: [] };
}

/**
 * Check color contrast ratios meet WCAG 2.1 AA (4.5:1 for normal text).
 */
export function validateContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
): { passes: boolean; ratio: number; required: number } {
  const fgLum = relativeLuminance(hexToRgb(foreground));
  const bgLum = relativeLuminance(hexToRgb(background));
  const ratio = contrastRatio(fgLum, bgLum);
  const required = level === 'AAA' ? 7 : 4.5;
  return { passes: ratio >= required, ratio: Math.round(ratio * 100) / 100, required };
}

/**
 * Verify that a tenant override does not modify protected tokens.
 */
export function validateOverride(overrideTokens: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];

  walkTokens(overrideTokens, '', (path) => {
    if (PROTECTED_TOKEN_PATHS.some((p) => path.startsWith(p))) {
      errors.push({
        path,
        message: `Cannot override protected token: ${path}`,
        rule: 'governance.protected',
      });
    }
  });

  return { valid: errors.length === 0, errors, warnings: [] };
}

/**
 * Validate that all DTCG references ({path.to.token}) resolve to actual nodes in the tree.
 */
export function validateReferences(tokens: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];

  walkTokens(tokens, '', (path, token) => {
    const value = token.$value;
    if (typeof value !== 'string') return;

    const refPattern = /\{([^}]+)\}/g;
    let match: RegExpExecArray | null;
    while ((match = refPattern.exec(value)) !== null) {
      const refPath = match[1];
      const resolved = resolvePath(tokens, refPath);
      if (resolved === undefined || resolved === null) {
        errors.push({
          path,
          message: `Dangling reference: {${refPath}} does not resolve to a token`,
          rule: 'references.resolve',
        });
      }
    }
  });

  return { valid: errors.length === 0, errors, warnings: [] };
}

// --- Color math helpers ---

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
