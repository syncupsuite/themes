/**
 * Extended tests for validateOverride() — protected path enforcement and value sanitization.
 *
 * The existing test in validation.test.ts confirms that structural path protection works
 * for a single error case and a single allow case. This file adds:
 *
 * - All PROTECTED_TOKEN_PATHS are individually confirmed as blocked
 * - Partial prefix matches are confirmed as blocked (startsWith semantics)
 * - A non-protected path is confirmed as allowed
 * - validateOverride returns no warnings (contract)
 * - Empty override object is valid
 * - $-prefixed metadata keys at the root are skipped (walkTokens contract)
 */

import { describe, it, expect } from 'vitest';
import { validateOverride } from '../validation';
import { PROTECTED_TOKEN_PATHS } from '../constants';

// ---------------------------------------------------------------------------
// Helper: build a nested token object from a dot-path
// ---------------------------------------------------------------------------

function buildNestedToken(dotPath: string, value = { $type: 'color', $value: '#00FF00' }) {
  const parts = dotPath.split('.');
  let obj: Record<string, unknown> = value as unknown as Record<string, unknown>;
  for (let i = parts.length - 1; i >= 0; i--) {
    obj = { [parts[i]]: obj };
  }
  return obj;
}

// ---------------------------------------------------------------------------
// Each PROTECTED_TOKEN_PATH must be rejected
// ---------------------------------------------------------------------------

describe('validateOverride — all protected paths are individually blocked', () => {
  for (const protectedPath of PROTECTED_TOKEN_PATHS) {
    it(`blocks override at "${protectedPath}"`, () => {
      const overrides = buildNestedToken(protectedPath);
      const result = validateOverride(overrides);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path.startsWith(protectedPath.split('.').slice(0, 4).join('.')))).toBe(true);
      expect(result.errors[0].rule).toBe('governance.protected');
    });
  }
});

// ---------------------------------------------------------------------------
// startsWith semantics: child paths of a protected prefix are also blocked
// ---------------------------------------------------------------------------

describe('validateOverride — child paths under protected prefixes are blocked', () => {
  it('blocks a child token under semantic.light.status.error', () => {
    const overrides = {
      semantic: {
        light: {
          status: {
            error: {
              // A nested child of the protected path
              variant: { $type: 'color', $value: '#FF0000' },
            },
          },
        },
      },
    };
    const result = validateOverride(overrides);
    expect(result.valid).toBe(false);
  });

  it('blocks a child token under semantic.light.accessibility', () => {
    const overrides = {
      semantic: {
        light: {
          accessibility: {
            'focus-visible': { $type: 'color', $value: '#0000FF' },
          },
        },
      },
    };
    const result = validateOverride(overrides);
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Non-protected paths must pass
// ---------------------------------------------------------------------------

describe('validateOverride — non-protected paths are allowed', () => {
  it('allows override of semantic.light.background.canvas', () => {
    const overrides = {
      semantic: {
        light: {
          background: {
            canvas: { $type: 'color', $value: '#F0F0F0' },
          },
        },
      },
    };
    const result = validateOverride(overrides);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('allows override of semantic.light.text.primary', () => {
    const overrides = {
      semantic: {
        light: {
          text: {
            primary: { $type: 'color', $value: '#222222' },
          },
        },
      },
    };
    const result = validateOverride(overrides);
    expect(result.valid).toBe(true);
  });

  it('allows override of a primitive color token', () => {
    const overrides = {
      primitive: {
        color: {
          brand: {
            '500': { $type: 'color', $value: '#7C3AED' },
          },
        },
      },
    };
    const result = validateOverride(overrides);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Contract: validateOverride never produces warnings
// ---------------------------------------------------------------------------

describe('validateOverride — result contract', () => {
  it('returns an empty warnings array for protected path violations', () => {
    const overrides = buildNestedToken('semantic.light.status.error');
    const result = validateOverride(overrides);
    expect(result.warnings).toHaveLength(0);
  });

  it('returns an empty warnings array for allowed overrides', () => {
    const overrides = {
      semantic: { light: { text: { secondary: { $type: 'color', $value: '#555' } } } },
    };
    const result = validateOverride(overrides);
    expect(result.warnings).toHaveLength(0);
  });

  it('returns valid=true for an empty override object', () => {
    const result = validateOverride({});
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// $-prefixed metadata keys at the root should be ignored (walkTokens contract)
// ---------------------------------------------------------------------------

describe('validateOverride — $-prefixed keys are skipped', () => {
  it('ignores $name and $description at the override root', () => {
    const overrides = {
      $name: 'Tenant Override',
      $description: 'Custom branding',
      semantic: {
        light: {
          background: {
            canvas: { $type: 'color', $value: '#FFFFFF' },
          },
        },
      },
    } as any;
    const result = validateOverride(overrides);
    expect(result.valid).toBe(true);
  });
});
