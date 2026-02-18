/**
 * Shared CSS formatting utilities for transformers.
 */

import type { DTCGToken } from '@syncupsuite/tokens';
import { pathToProperty, formatCssValue, sanitizeCssComment } from '@syncupsuite/tokens';

export function tokenValueToString(value: DTCGToken['$value']): string {
  if (typeof value === 'string') return value;
  return String(value);
}

export function formatProperty(
  path: string[],
  token: DTCGToken,
  prefix: string,
  includeComments: boolean,
  indent = '  ',
): string {
  const prop = pathToProperty(path.join('.'), prefix);
  const raw = tokenValueToString(token.$value);
  const value = formatCssValue(raw, prefix);

  const lines: string[] = [];
  if (includeComments && token.$description) {
    lines.push(`${indent}/* ${sanitizeCssComment(token.$description)} */`);
  }
  lines.push(`${indent}${prop}: ${value};`);
  return lines.join('\n');
}
