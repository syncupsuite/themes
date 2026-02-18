/**
 * Integration tests for format.ts utilities: tokenValueToString and formatProperty.
 *
 * format.ts is called from both css.ts and tailwind-v4.ts for every CSS property
 * emission. formatProperty is the point where formatCssValue (security) and
 * pathToProperty (naming) converge. These tests verify:
 *
 * - tokenValueToString: coerces numbers, booleans, strings
 * - formatProperty: correct CSS property name, value, comment, indent
 * - formatProperty: reference resolution flows through formatCssValue
 * - formatProperty: injection in $value throws (via formatCssValue)
 * - formatProperty: custom indent is applied
 * - formatProperty: prefix propagates to pathToProperty and resolveReference
 */

import { describe, it, expect } from 'vitest';
import { formatProperty, tokenValueToString } from '../format';
import type { DTCGToken } from '@syncupsuite/tokens';

// ---------------------------------------------------------------------------
// tokenValueToString
// ---------------------------------------------------------------------------

describe('tokenValueToString', () => {
  it('returns string values unchanged', () => {
    expect(tokenValueToString('#FF0000')).toBe('#FF0000');
  });

  it('coerces a number to a string', () => {
    expect(tokenValueToString(400)).toBe('400');
  });

  it('coerces a boolean true to a string', () => {
    expect(tokenValueToString(true as any)).toBe('true');
  });

  it('coerces a boolean false to a string', () => {
    expect(tokenValueToString(false as any)).toBe('false');
  });

  it('coerces zero to a string', () => {
    expect(tokenValueToString(0)).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// formatProperty — basic output
// ---------------------------------------------------------------------------

describe('formatProperty — output structure', () => {
  const colorToken: DTCGToken = {
    $type: 'color',
    $value: '#FF0000',
    $description: 'Brand red',
  };

  it('produces a CSS custom property declaration', () => {
    const output = formatProperty(['color', 'brand'], colorToken, '', false);
    expect(output).toContain('--color-brand: #FF0000;');
  });

  it('uses two-space indent by default', () => {
    const output = formatProperty(['color', 'brand'], colorToken, '', false);
    expect(output).toMatch(/^  --color-brand/);
  });

  it('applies a custom indent', () => {
    const output = formatProperty(['color', 'brand'], colorToken, '', false, '    ');
    expect(output).toMatch(/^    --color-brand/);
  });

  it('includes a comment when includeComments=true and $description is present', () => {
    const output = formatProperty(['color', 'brand'], colorToken, '', true);
    expect(output).toContain('/* Brand red */');
  });

  it('does not include a comment when includeComments=false', () => {
    const output = formatProperty(['color', 'brand'], colorToken, '', false);
    expect(output).not.toContain('/*');
  });

  it('does not include a comment when $description is absent', () => {
    const tokenNoDesc: DTCGToken = { $type: 'color', $value: '#FF0000' };
    const output = formatProperty(['color', 'brand'], tokenNoDesc, '', true);
    expect(output).not.toContain('/*');
  });

  it('comment appears on the line before the property declaration', () => {
    const output = formatProperty(['color', 'brand'], colorToken, '', true);
    const lines = output.split('\n');
    expect(lines[0]).toContain('/*');
    expect(lines[1]).toContain('--color-brand:');
  });
});

// ---------------------------------------------------------------------------
// formatProperty — prefix propagation
// ---------------------------------------------------------------------------

describe('formatProperty — prefix propagation', () => {
  const dimensionToken: DTCGToken = { $type: 'dimension', $value: '8px' };

  it('applies prefix to the CSS property name', () => {
    const output = formatProperty(['spacing', 'base'], dimensionToken, 'su', false);
    expect(output).toContain('--su-spacing-base: 8px;');
  });

  it('produces an un-prefixed property when prefix is empty string', () => {
    const output = formatProperty(['spacing', 'base'], dimensionToken, '', false);
    expect(output).toContain('--spacing-base: 8px;');
  });
});

// ---------------------------------------------------------------------------
// formatProperty — reference resolution via formatCssValue
// ---------------------------------------------------------------------------

describe('formatProperty — DTCG reference resolution', () => {
  it('resolves a {reference} token value to var()', () => {
    const refToken: DTCGToken = {
      $type: 'color',
      $value: '{primitive.color.neutral.50}',
    };
    const output = formatProperty(['background', 'canvas'], refToken, '', false);
    expect(output).toContain('var(--primitive-color-neutral-50)');
  });

  it('resolves a reference with prefix', () => {
    const refToken: DTCGToken = {
      $type: 'color',
      $value: '{primitive.color.brand.500}',
    };
    const output = formatProperty(['interactive', 'primary'], refToken, 'su', false);
    expect(output).toContain('var(--su-primitive-color-brand-500)');
  });
});

// ---------------------------------------------------------------------------
// formatProperty — injection prevention (via formatCssValue)
// ---------------------------------------------------------------------------

describe('formatProperty — injection prevention', () => {
  it('throws when $value contains a semicolon injection attempt', () => {
    const injectedToken: DTCGToken = {
      $type: 'color',
      $value: 'red; background: url(evil.com)',
    };
    expect(() => formatProperty(['color', 'brand'], injectedToken, '', false)).toThrow('Unsafe CSS value');
  });

  it('throws when $value contains a url() injection attempt', () => {
    const injectedToken: DTCGToken = {
      $type: 'color',
      $value: 'url(https://attacker.com/x.png)',
    };
    expect(() => formatProperty(['color', 'brand'], injectedToken, '', false)).toThrow('Unsafe CSS value');
  });

  it('throws when $value contains a context-escape attempt with {}', () => {
    const injectedToken: DTCGToken = {
      $type: 'color',
      $value: 'red } body { color: blue',
    };
    expect(() => formatProperty(['color', 'brand'], injectedToken, '', false)).toThrow('Unsafe CSS value');
  });

  it('throws when $value contains a mixed reference/literal injection', () => {
    // The reference segment is valid but the literal segment carries the injection
    const injectedToken: DTCGToken = {
      $type: 'color',
      $value: '{color.primary}; background-image: url(evil.com)',
    };
    expect(() => formatProperty(['color', 'brand'], injectedToken, '', false)).toThrow('Unsafe CSS value');
  });
});

// ---------------------------------------------------------------------------
// formatProperty — comment injection prevention via sanitizeCssComment
// ---------------------------------------------------------------------------

describe('formatProperty — comment sanitization', () => {
  it('escapes premature comment-closing sequences in $description', () => {
    const maliciousToken: DTCGToken = {
      $type: 'color',
      $value: '#FF0000',
      $description: 'evil */ } body { color: red',
    };
    const output = formatProperty(['color', 'evil'], maliciousToken, '', true);
    // sanitizeCssComment replaces */ with * / inside the description text.
    // The comment is then wrapped as: /* <escaped-description> */
    // The only occurrence of */ in the output is the legitimate comment terminator
    // at the very end of the comment line. A premature */ inside the body would
    // produce TWO occurrences — one inside and one at the end.
    // After escaping, */ appears exactly once (the legitimate terminator).
    const closingCount = (output.match(/\*\//g) || []).length;
    expect(closingCount).toBe(1);
    // The escaped sequence * / (space-separated) must appear in the description body
    expect(output).toContain('* /');
    // The property declaration must still be generated correctly
    expect(output).toContain('--color-evil: #FF0000;');
  });

  it('does not escape a solo asterisk in $description', () => {
    const token: DTCGToken = {
      $type: 'color',
      $value: '#FF0000',
      $description: 'rating: 5*',
    };
    const output = formatProperty(['color', 'rating'], token, '', true);
    expect(output).toContain('rating: 5*');
  });
});
