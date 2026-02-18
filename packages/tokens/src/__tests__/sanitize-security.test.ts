/**
 * Security-focused tests for CSS sanitization functions.
 *
 * Covers: sanitizeCssValue, formatCssValue, sanitizeCssComment, assertHex
 * These are the injection-prevention boundaries — every UNSAFE_CSS_VALUE pattern
 * must have an explicit test case that proves the guard fires.
 */

import { describe, it, expect } from 'vitest';
import { sanitizeCssValue, formatCssValue, sanitizeCssComment, assertHex } from '../utilities';

// ---------------------------------------------------------------------------
// sanitizeCssValue — UNSAFE_CSS_VALUE pattern coverage
// ---------------------------------------------------------------------------

describe('sanitizeCssValue — injection patterns blocked', () => {
  it('passes safe hex color values', () => {
    expect(sanitizeCssValue('#FF0000')).toBe('#FF0000');
  });

  it('passes safe dimension values', () => {
    expect(sanitizeCssValue('8px')).toBe('8px');
    expect(sanitizeCssValue('1.5rem')).toBe('1.5rem');
    expect(sanitizeCssValue('100%')).toBe('100%');
  });

  it('passes safe quoted font family strings', () => {
    expect(sanitizeCssValue('"Inter", sans-serif')).toBe('"Inter", sans-serif');
  });

  it('blocks opening curly brace { (context escape attempt)', () => {
    expect(() => sanitizeCssValue('red { color: blue')).toThrow('Unsafe CSS value');
  });

  it('blocks closing curly brace } (context escape attempt)', () => {
    expect(() => sanitizeCssValue('red } body { color: blue')).toThrow('Unsafe CSS value');
  });

  it('blocks url() function (resource loading)', () => {
    expect(() => sanitizeCssValue('url(https://evil.com/image.png)')).toThrow('Unsafe CSS value');
  });

  it('blocks url() with leading whitespace (bypass attempt)', () => {
    expect(() => sanitizeCssValue('url  (https://evil.com)')).toThrow('Unsafe CSS value');
  });

  it('blocks expression() function (IE CSS expression execution)', () => {
    expect(() => sanitizeCssValue('expression(alert(1))')).toThrow('Unsafe CSS value');
  });

  it('blocks expression() with internal whitespace (bypass attempt)', () => {
    expect(() => sanitizeCssValue('expression  (document.cookie)')).toThrow('Unsafe CSS value');
  });

  it('blocks @import at-rule', () => {
    expect(() => sanitizeCssValue('@import url(evil.css)')).toThrow('Unsafe CSS value');
  });

  it('blocks @charset at-rule', () => {
    expect(() => sanitizeCssValue('@charset "UTF-8"')).toThrow('Unsafe CSS value');
  });

  it('blocks javascript: protocol', () => {
    expect(() => sanitizeCssValue('javascript:alert(1)')).toThrow('Unsafe CSS value');
  });

  it('blocks javascript: with mixed case (bypass attempt)', () => {
    expect(() => sanitizeCssValue('JaVaScRiPt:alert(1)')).toThrow('Unsafe CSS value');
  });

  it('blocks data: URI scheme', () => {
    expect(() => sanitizeCssValue('data:text/html,<script>alert(1)</script>')).toThrow('Unsafe CSS value');
  });

  it('blocks behavior: (IE HTC behavior property)', () => {
    expect(() => sanitizeCssValue('behavior:url(evil.htc)')).toThrow('Unsafe CSS value');
  });

  it('blocks behavior: with internal whitespace (bypass attempt)', () => {
    expect(() => sanitizeCssValue('behavior  :url(evil.htc)')).toThrow('Unsafe CSS value');
  });

  it('blocks -moz-binding: (Firefox XBL binding property)', () => {
    expect(() => sanitizeCssValue('-moz-binding:url(evil.xml)')).toThrow('Unsafe CSS value');
  });

  it('blocks -moz-binding: with whitespace (bypass attempt)', () => {
    expect(() => sanitizeCssValue('-moz-binding  :url(x.xml)')).toThrow('Unsafe CSS value');
  });

  it('blocks semicolons (property injection)', () => {
    expect(() => sanitizeCssValue('red; background: blue')).toThrow('Unsafe CSS value');
  });

  it('blocks </  sequence (HTML script tag injection)', () => {
    expect(() => sanitizeCssValue('red</script>')).toThrow('Unsafe CSS value');
  });

  it('returns the original value when safe', () => {
    const safe = '#AABBCC';
    expect(sanitizeCssValue(safe)).toBe(safe);
  });

  it('error message includes a truncated preview of the offending value', () => {
    let message = '';
    try {
      sanitizeCssValue('url(evil.com)');
    } catch (e) {
      message = (e as Error).message;
    }
    expect(message).toContain('url(evil.com)');
  });

  it('error message truncates at 80 characters for extremely long inputs', () => {
    const longPayload = 'url(' + 'a'.repeat(200) + ')';
    let message = '';
    try {
      sanitizeCssValue(longPayload);
    } catch (e) {
      message = (e as Error).message;
    }
    // The slice in the implementation caps the preview at 80 chars
    const previewInMessage = message.replace('Unsafe CSS value detected: "', '').replace('"', '');
    expect(previewInMessage.length).toBeLessThanOrEqual(80);
  });
});

// ---------------------------------------------------------------------------
// formatCssValue — mixed reference/literal injection prevention
// ---------------------------------------------------------------------------

describe('formatCssValue — reference resolution and injection prevention', () => {
  it('resolves a bare DTCG reference to a CSS var()', () => {
    expect(formatCssValue('{color.primary}')).toBe('var(--color-primary)');
  });

  it('resolves a DTCG reference with a prefix', () => {
    expect(formatCssValue('{color.primary}', 'theme')).toBe('var(--theme-color-primary)');
  });

  it('passes through a safe literal value unchanged', () => {
    expect(formatCssValue('#FF0000')).toBe('#FF0000');
  });

  it('resolves multiple references in a composite value', () => {
    const result = formatCssValue('{color.start} {color.end}');
    expect(result).toBe('var(--color-start) var(--color-end)');
  });

  it('handles a value mixing a reference and a safe literal', () => {
    // e.g. gradient with a reference and a fallback literal
    const result = formatCssValue('{color.primary} 10px');
    expect(result).toBe('var(--color-primary) 10px');
  });

  it('blocks injection in the literal segment of a mixed value', () => {
    // The reference part is fine; the literal segment after the reference contains injection.
    // Pattern: "{color.primary}; background-image: url(evil.com)"
    expect(() =>
      formatCssValue('{color.primary}; background-image: url(evil.com)'),
    ).toThrow('Unsafe CSS value');
  });

  it('blocks semicolon injection in standalone literal values', () => {
    expect(() => formatCssValue('red; color: blue')).toThrow('Unsafe CSS value');
  });

  it('blocks url() in standalone literal values', () => {
    expect(() => formatCssValue('url(https://attacker.com/x.png)')).toThrow('Unsafe CSS value');
  });

  it('blocks {} in standalone literal values (raw curly braces outside reference syntax)', () => {
    // A stray { that is not part of a DTCG reference pattern
    expect(() => formatCssValue('invalid { css')).toThrow('Unsafe CSS value');
  });

  it('handles an empty string without throwing', () => {
    expect(formatCssValue('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// sanitizeCssComment — comment injection prevention
// ---------------------------------------------------------------------------

describe('sanitizeCssComment', () => {
  it('passes through safe comment text', () => {
    expect(sanitizeCssComment('Primary brand color')).toBe('Primary brand color');
  });

  it('escapes comment-closing sequence */', () => {
    expect(sanitizeCssComment('evil */ body { color: red }')).toBe('evil * / body { color: red }');
  });

  it('escapes multiple occurrences of */', () => {
    expect(sanitizeCssComment('*/ and another */')).toBe('* / and another * /');
  });

  it('leaves solo asterisk intact', () => {
    expect(sanitizeCssComment('rating: 5*')).toBe('rating: 5*');
  });
});

// ---------------------------------------------------------------------------
// assertHex — input validation
// ---------------------------------------------------------------------------

describe('assertHex', () => {
  it('accepts a valid 6-digit uppercase hex', () => {
    expect(() => assertHex('#FF0000')).not.toThrow();
  });

  it('accepts a valid 6-digit lowercase hex', () => {
    expect(() => assertHex('#ff0000')).not.toThrow();
  });

  it('accepts a valid mixed-case hex', () => {
    expect(() => assertHex('#aAbBcC')).not.toThrow();
  });

  it('rejects a 3-digit shorthand hex', () => {
    expect(() => assertHex('#F00')).toThrow('Invalid hex color');
  });

  it('rejects a hex without the hash prefix', () => {
    expect(() => assertHex('FF0000')).toThrow('Invalid hex color');
  });

  it('rejects an 8-digit hex (RGBA)', () => {
    expect(() => assertHex('#FF0000FF')).toThrow('Invalid hex color');
  });

  it('rejects non-hex characters', () => {
    expect(() => assertHex('#GGHHII')).toThrow('Invalid hex color');
  });

  it('rejects an empty string', () => {
    expect(() => assertHex('')).toThrow('Invalid hex color');
  });
});
