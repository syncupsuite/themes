import type { DTCGToken, DTCGTokenGroup } from './types';

/** Type guard: is this node a leaf token (has $value and $type)? */
export function isToken(node: unknown): node is DTCGToken {
  return (
    typeof node === 'object' &&
    node !== null &&
    '$value' in node &&
    '$type' in node
  );
}

/**
 * Recursively flatten a DTCG token group into an array of [path, token] pairs.
 */
export function flattenTokens(
  group: DTCGTokenGroup,
  parentPath: string[] = [],
): Array<[string[], DTCGToken]> {
  const result: Array<[string[], DTCGToken]> = [];

  for (const [key, value] of Object.entries(group)) {
    if (key.startsWith('$')) continue;
    const currentPath = [...parentPath, key];

    if (isToken(value)) {
      result.push([currentPath, value]);
    } else if (typeof value === 'object' && value !== null) {
      result.push(...flattenTokens(value as DTCGTokenGroup, currentPath));
    }
  }

  return result;
}

/**
 * Convert a dot-separated token path to a CSS custom property name.
 * "primitive.color.hanada.500" → "--primitive-color-hanada-500"
 */
export function pathToProperty(path: string, prefix = ''): string {
  const segments = path.split('.').join('-');
  return prefix ? `--${prefix}-${segments}` : `--${segments}`;
}

/**
 * Resolve DTCG references like {primitive.color.neutral.900} to
 * CSS custom property references like var(--primitive-color-neutral-900).
 */
export function resolveReference(value: string, prefix = ''): string {
  return value.replace(/\{([^}]+)\}/g, (_match, path: string) => {
    const prop = pathToProperty(path, prefix);
    return `var(${prop})`;
  });
}

/**
 * Walk a token tree, calling the callback for each leaf token.
 */
export function walkTokens(
  tokens: Record<string, unknown>,
  parentPath: string,
  callback: (path: string, token: DTCGToken) => void,
): void {
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('$')) continue;
    const path = parentPath ? `${parentPath}.${key}` : key;
    if (typeof value === 'object' && value !== null && '$value' in value) {
      callback(path, value as DTCGToken);
    } else if (typeof value === 'object' && value !== null) {
      walkTokens(value as Record<string, unknown>, path, callback);
    }
  }
}

/**
 * Resolve a dot-path in a nested object.
 */
export function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

// ---------------------------------------------------------------------------
// CSS Sanitization
// ---------------------------------------------------------------------------

const UNSAFE_CSS_VALUE = /[{}]|url\s*\(|expression\s*\(|@import|@charset/i;

/**
 * Sanitize a token value for safe CSS output.
 * Throws if the value contains patterns that could break out of a CSS property.
 */
export function sanitizeCssValue(value: string): string {
  if (UNSAFE_CSS_VALUE.test(value)) {
    throw new Error(`Unsafe CSS value detected: "${value.slice(0, 80)}"`);
  }
  return value;
}

/**
 * Sanitize text for use inside a CSS comment. Escapes comment-closing sequences.
 */
export function sanitizeCssComment(text: string): string {
  return text.replace(/\*\//g, '* /');
}

// ---------------------------------------------------------------------------
// Hex Color Validation
// ---------------------------------------------------------------------------

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Validate that a string is a 6-digit hex color (e.g., #FF0000).
 * Throws with a descriptive error on invalid input.
 */
export function assertHex(hex: string): void {
  if (!HEX_COLOR.test(hex)) {
    throw new Error(`Invalid hex color: "${hex}". Expected 6-digit hex (e.g., #FF0000).`);
  }
}
