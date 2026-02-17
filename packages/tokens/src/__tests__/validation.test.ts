import { describe, it, expect } from 'vitest';
import { validateSchema, validateCompleteness, validateContrast, validateOverride } from '../validation';

describe('validateSchema', () => {
  it('passes for valid tokens', () => {
    const tokens = {
      color: { $type: 'color', $value: '#FF0000', $description: 'Red' },
    };
    const result = validateSchema(tokens);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails for missing $type', () => {
    const tokens = {
      color: { $value: '#FF0000' },
    };
    const result = validateSchema(tokens as any);
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe('schema.type');
  });

  it('warns for missing $description', () => {
    const tokens = {
      color: { $type: 'color', $value: '#FF0000' },
    };
    const result = validateSchema(tokens);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('schema.description');
  });
});

describe('validateCompleteness', () => {
  it('reports missing required semantic tokens', () => {
    const result = validateCompleteness({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].rule).toBe('completeness.required');
  });
});

describe('validateContrast', () => {
  it('passes black on white at AA', () => {
    const result = validateContrast('#000000', '#FFFFFF');
    expect(result.passes).toBe(true);
    expect(result.ratio).toBe(21);
  });

  it('fails low contrast', () => {
    const result = validateContrast('#777777', '#888888');
    expect(result.passes).toBe(false);
  });
});

describe('validateOverride', () => {
  it('rejects overrides to protected paths', () => {
    const overrides = {
      semantic: {
        light: {
          status: {
            error: { $type: 'color', $value: '#00FF00' },
          },
        },
      },
    };
    const result = validateOverride(overrides);
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe('governance.protected');
  });

  it('allows non-protected overrides', () => {
    const overrides = {
      semantic: {
        light: {
          background: {
            canvas: { $type: 'color', $value: '#FAFAFA' },
          },
        },
      },
    };
    const result = validateOverride(overrides);
    expect(result.valid).toBe(true);
  });
});
