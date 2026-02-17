import { describe, it, expect } from 'vitest';
import { nihonTraditional } from '../nihon-traditional/index';
import { swissInternational } from '../swiss-international/index';
import {
  validateSchema,
  validateCompleteness,
  validateOverride,
  REQUIRED_SEMANTIC_TOKENS,
  PROTECTED_TOKEN_PATHS,
} from '@syncupsuite/tokens';

describe('nihonTraditional', () => {
  it('returns valid DTCGRoot', () => {
    expect(nihonTraditional.tokens.primitive?.color).toBeDefined();
    expect(nihonTraditional.tokens.semantic?.light).toBeDefined();
    expect(nihonTraditional.tokens.semantic?.dark).toBeDefined();
  });

  it('returns CSS string', () => {
    expect(nihonTraditional.css).toContain(':root {');
  });

  it('returns Tailwind CSS string', () => {
    expect(nihonTraditional.tailwindCss).toContain('@import "tailwindcss"');
    expect(nihonTraditional.tailwindCss).toContain('@theme {');
  });

  it('returns meta with foundation info', () => {
    expect(nihonTraditional.meta.id).toBe('nihon-no-iro-traditional');
    expect(nihonTraditional.meta.foundation.harmonyMode).toBe('golden-ratio');
  });

  it('passes schema validation', () => {
    const result = validateSchema(nihonTraditional.tokens as Record<string, unknown>);
    expect(result.valid).toBe(true);
  });

  it('passes completeness validation', () => {
    const result = validateCompleteness(nihonTraditional.tokens as Record<string, unknown>);
    expect(result.valid).toBe(true);
  });
});

describe('swissInternational', () => {
  it('returns valid DTCGRoot', () => {
    expect(swissInternational.tokens.primitive?.color).toBeDefined();
    expect(swissInternational.tokens.semantic?.light).toBeDefined();
  });

  it('returns CSS with all required semantic tokens as custom properties', () => {
    const css = swissInternational.css;
    // Check that light mode required tokens are present
    for (const path of REQUIRED_SEMANTIC_TOKENS) {
      if (path.startsWith('semantic.light.')) {
        const propName = path.replace('semantic.light.', '').split('.').join('-');
        expect(css).toContain(`--${propName}`);
      }
    }
  });

  it('has correct foundation metadata', () => {
    expect(swissInternational.meta.foundation.harmonyMode).toBe('monochromatic');
    expect(swissInternational.meta.foundation.radiusTendency).toBe('none');
    expect(swissInternational.meta.foundation.typographyCategory).toBe('neo-grotesque');
  });

  it('passes schema validation', () => {
    const result = validateSchema(swissInternational.tokens as Record<string, unknown>);
    expect(result.valid).toBe(true);
  });

  it('passes completeness validation', () => {
    const result = validateCompleteness(swissInternational.tokens as Record<string, unknown>);
    expect(result.valid).toBe(true);
  });
});

describe('protected tokens', () => {
  it('nihon-traditional has all protected token paths', () => {
    for (const path of PROTECTED_TOKEN_PATHS) {
      const parts = path.split('.');
      let current: any = nihonTraditional.tokens;
      for (const part of parts) {
        current = current?.[part];
      }
      expect(current).toBeDefined();
    }
  });

  it('override validation rejects protected paths', () => {
    const result = validateOverride({
      semantic: {
        light: {
          status: {
            error: { $type: 'color', $value: '#00FF00' },
          },
        },
      },
    });
    expect(result.valid).toBe(false);
  });
});
