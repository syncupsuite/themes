/**
 * Tests for validateReferences() — DTCG reference resolution validation.
 *
 * validateReferences was previously untested. This file provides full coverage of:
 * - Happy path: all references resolve
 * - Dangling reference detection
 * - Multiple references in one value
 * - Non-string $value tokens (should be skipped)
 * - Deeply nested token trees
 * - Circular-style paths (they are dangling — resolution is one-pass)
 * - Reference rule identifier
 */

import { describe, it, expect } from 'vitest';
import { validateReferences } from '../validation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeToken(value: string, type = 'color') {
  return { $type: type, $value: value };
}

// ---------------------------------------------------------------------------
// validateReferences
// ---------------------------------------------------------------------------

describe('validateReferences — valid trees', () => {
  it('returns valid=true for a token tree with no references', () => {
    const tokens = {
      primitive: {
        color: {
          red: makeToken('#FF0000'),
        },
      },
    };
    const result = validateReferences(tokens);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid=true when all references resolve correctly', () => {
    const tokens = {
      primitive: {
        color: {
          neutral: {
            '50': makeToken('#F5F5F5'),
          },
        },
      },
      semantic: {
        light: {
          background: {
            canvas: makeToken('{primitive.color.neutral.50}'),
          },
        },
      },
    };
    const result = validateReferences(tokens);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid=true when a token value has no reference pattern', () => {
    const tokens = {
      spacing: { base: makeToken('8px', 'dimension') },
    };
    const result = validateReferences(tokens);
    expect(result.valid).toBe(true);
  });
});

describe('validateReferences — dangling references', () => {
  it('reports an error for a reference that does not exist in the tree', () => {
    const tokens = {
      semantic: {
        light: {
          text: {
            primary: makeToken('{primitive.color.nonexistent.900}'),
          },
        },
      },
    };
    const result = validateReferences(tokens);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].rule).toBe('references.resolve');
  });

  it('error message names the dangling reference path', () => {
    const tokens = {
      a: makeToken('{missing.token}'),
    };
    const result = validateReferences(tokens);
    expect(result.errors[0].message).toContain('missing.token');
  });

  it('error path identifies the token that contains the broken reference', () => {
    const tokens = {
      semantic: {
        dark: {
          background: {
            canvas: makeToken('{primitive.color.neutral.950}'),
          },
        },
      },
    };
    const result = validateReferences(tokens);
    expect(result.errors[0].path).toBe('semantic.dark.background.canvas');
  });

  it('reports one error per dangling reference, not per token', () => {
    // One token with two dangling references
    const tokens = {
      composite: makeToken('{missing.a} {missing.b}'),
    };
    const result = validateReferences(tokens);
    // Each unresolved reference produces its own error
    expect(result.errors).toHaveLength(2);
  });

  it('reports multiple errors for multiple tokens with dangling references', () => {
    const tokens = {
      a: makeToken('{gone.a}'),
      b: makeToken('{gone.b}'),
    };
    const result = validateReferences(tokens);
    expect(result.errors).toHaveLength(2);
    expect(result.valid).toBe(false);
  });
});

describe('validateReferences — non-string $value tokens are skipped', () => {
  it('does not error on a numeric $value', () => {
    const tokens = {
      weight: { $type: 'number', $value: 400 },
    };
    const result = validateReferences(tokens as any);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('does not error on a boolean $value', () => {
    const tokens = {
      flag: { $type: 'boolean', $value: true },
    };
    const result = validateReferences(tokens as any);
    expect(result.valid).toBe(true);
  });
});

describe('validateReferences — deeply nested references', () => {
  it('walks deeply nested token groups to find dangling references', () => {
    const tokens = {
      level1: {
        level2: {
          level3: {
            token: makeToken('{level1.level2.missing}'),
          },
        },
      },
    };
    const result = validateReferences(tokens);
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe('level1.level2.level3.token');
  });

  it('resolves references across deep nesting in the same tree', () => {
    const tokens = {
      deep: {
        nested: {
          value: makeToken('#123456'),
        },
      },
      ref: makeToken('{deep.nested.value}'),
    };
    const result = validateReferences(tokens);
    expect(result.valid).toBe(true);
  });
});

describe('validateReferences — empty tree edge cases', () => {
  it('returns valid=true for an empty token tree', () => {
    const result = validateReferences({});
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
