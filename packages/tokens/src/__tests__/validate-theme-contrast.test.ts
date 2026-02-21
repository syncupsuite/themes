import { describe, it, expect } from 'vitest';
import { validateThemeContrast } from '../validation';

/**
 * Build a minimal token tree with direct hex values for clean override behavior.
 * Status colors use darker values that reliably pass 3:1 on their backgrounds.
 */
function makeTokenTree(overrides: Partial<Record<string, string>> = {}): Record<string, unknown> {
  const v = (key: string, fallback: string) => overrides[key] ?? fallback;

  return {
    semantic: {
      light: {
        background: {
          canvas: { $type: 'color', $value: v('lightBgCanvas', '#FAFAFA'), $description: 'Canvas' },
          surface: { $type: 'color', $value: v('lightBgSurface', '#FFFFFF'), $description: 'Surface' },
          muted: { $type: 'color', $value: '#F0F0F0', $description: 'Muted' },
        },
        text: {
          primary: { $type: 'color', $value: v('lightTextPrimary', '#111111'), $description: 'Primary text' },
          secondary: { $type: 'color', $value: v('lightTextSecondary', '#444444'), $description: 'Secondary text' },
          muted: { $type: 'color', $value: v('lightTextMuted', '#666666'), $description: 'Muted text' },
          inverse: { $type: 'color', $value: '#FAFAFA', $description: 'Inverse text' },
        },
        interactive: {
          primary: { $type: 'color', $value: v('lightInteractive', '#1A3A5C'), $description: 'Interactive' },
        },
        border: {
          default: { $type: 'color', $value: '#E0E0E0', $description: 'Border' },
          strong: { $type: 'color', $value: '#888888', $description: 'Strong border' },
        },
        status: {
          error: { $type: 'color', $value: '#DC2626', $description: 'Error' },
          success: { $type: 'color', $value: '#15803D', $description: 'Success' },
          warning: { $type: 'color', $value: '#A16207', $description: 'Warning' },
        },
        focus: {
          ring: { $type: 'color', $value: '#1A3A5C', $description: 'Focus ring' },
        },
        accessibility: {
          'focus-visible': { $type: 'color', $value: '#1A3A5C', $description: 'Focus visible' },
        },
      },
      dark: {
        background: {
          canvas: { $type: 'color', $value: v('darkBgCanvas', '#111111'), $description: 'Dark canvas' },
          surface: { $type: 'color', $value: v('darkBgSurface', '#1A1A1A'), $description: 'Dark surface' },
          muted: { $type: 'color', $value: '#333333', $description: 'Dark muted' },
        },
        text: {
          primary: { $type: 'color', $value: v('darkTextPrimary', '#F5F5F5'), $description: 'Dark primary' },
          secondary: { $type: 'color', $value: v('darkTextSecondary', '#CCCCCC'), $description: 'Dark secondary' },
          muted: { $type: 'color', $value: v('darkTextMuted', '#999999'), $description: 'Dark muted' },
          inverse: { $type: 'color', $value: '#111111', $description: 'Dark inverse' },
        },
        interactive: {
          primary: { $type: 'color', $value: v('darkInteractive', '#7BAACC'), $description: 'Dark interactive' },
        },
        border: {
          default: { $type: 'color', $value: '#333333', $description: 'Dark border' },
          strong: { $type: 'color', $value: '#999999', $description: 'Dark strong border' },
        },
        status: {
          error: { $type: 'color', $value: '#EF4444', $description: 'Dark error' },
          success: { $type: 'color', $value: '#22C55E', $description: 'Dark success' },
          warning: { $type: 'color', $value: '#EAB308', $description: 'Dark warning' },
        },
        focus: {
          ring: { $type: 'color', $value: '#7BAACC', $description: 'Dark focus' },
        },
        accessibility: {
          'focus-visible': { $type: 'color', $value: '#7BAACC', $description: 'Dark focus visible' },
        },
      },
    },
  };
}

describe('validateThemeContrast', () => {
  it('passes for a high-contrast theme', () => {
    const tokens = makeTokenTree();
    const result = validateThemeContrast(tokens);
    if (!result.passes) {
      // Debug output for failing pairs
      for (const f of result.failures) {
        console.log(`FAIL: ${f.label} — ${f.fgHex} on ${f.bgHex} = ${f.ratio}:1 (need ${f.required}:1)`);
      }
    }
    expect(result.passes).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.pairs.length).toBeGreaterThan(0);
  });

  it('checks all 20 critical pairs', () => {
    const tokens = makeTokenTree();
    const result = validateThemeContrast(tokens);
    expect(result.pairs).toHaveLength(20);
  });

  it('fails when light primary text has insufficient contrast', () => {
    const tokens = makeTokenTree({ lightTextPrimary: '#CCCCCC' });
    const result = validateThemeContrast(tokens);
    expect(result.passes).toBe(false);
    const failure = result.failures.find((f) => f.label.includes('primary text on canvas'));
    expect(failure).toBeDefined();
    expect(failure!.ratio).toBeLessThan(4.5);
  });

  it('fails when dark text has insufficient contrast on dark background', () => {
    const tokens = makeTokenTree({ darkTextPrimary: '#222222' });
    const result = validateThemeContrast(tokens);
    expect(result.passes).toBe(false);
    const failure = result.failures.find((f) => f.label.includes('Dark: primary text'));
    expect(failure).toBeDefined();
  });

  it('handles direct hex values', () => {
    const tokens = makeTokenTree();
    const result = validateThemeContrast(tokens);
    const pair = result.pairs.find((p) => p.label === 'Light: error on canvas');
    expect(pair).toBeDefined();
    expect(pair!.fgHex).toBe('#DC2626');
  });

  it('resolves DTCG references through primitive tokens', () => {
    // Build a tree where semantic tokens reference primitives
    const tokens: Record<string, unknown> = {
      primitive: {
        color: {
          brand: {
            '900': { $type: 'color', $value: '#111111', $description: 'Brand 900' },
            '50': { $type: 'color', $value: '#FAFAFA', $description: 'Brand 50' },
          },
        },
      },
      semantic: {
        light: {
          background: {
            canvas: { $type: 'color', $value: '{primitive.color.brand.50}', $description: 'Canvas' },
            surface: { $type: 'color', $value: '#FFFFFF', $description: 'Surface' },
            muted: { $type: 'color', $value: '#F0F0F0', $description: 'Muted' },
          },
          text: {
            primary: { $type: 'color', $value: '{primitive.color.brand.900}', $description: 'Primary text' },
            secondary: { $type: 'color', $value: '#444444', $description: 'Secondary' },
            muted: { $type: 'color', $value: '#666666', $description: 'Muted' },
          },
          interactive: {
            primary: { $type: 'color', $value: '#1A3A5C', $description: 'Interactive' },
          },
          status: {
            error: { $type: 'color', $value: '#DC2626', $description: 'Error' },
            success: { $type: 'color', $value: '#15803D', $description: 'Success' },
            warning: { $type: 'color', $value: '#A16207', $description: 'Warning' },
          },
        },
        dark: {
          background: {
            canvas: { $type: 'color', $value: '{primitive.color.brand.900}', $description: 'Dark canvas' },
            surface: { $type: 'color', $value: '#1A1A1A', $description: 'Dark surface' },
          },
          text: {
            primary: { $type: 'color', $value: '{primitive.color.brand.50}', $description: 'Dark primary' },
            secondary: { $type: 'color', $value: '#CCCCCC', $description: 'Dark secondary' },
            muted: { $type: 'color', $value: '#999999', $description: 'Dark muted' },
          },
          interactive: {
            primary: { $type: 'color', $value: '#7BAACC', $description: 'Dark interactive' },
          },
          status: {
            error: { $type: 'color', $value: '#EF4444', $description: 'Dark error' },
            success: { $type: 'color', $value: '#22C55E', $description: 'Dark success' },
            warning: { $type: 'color', $value: '#EAB308', $description: 'Dark warning' },
          },
        },
      },
    };

    const result = validateThemeContrast(tokens);
    // The referenced pair: text.primary ({brand.900} = #111111) on bg.canvas ({brand.50} = #FAFAFA)
    const pair = result.pairs.find((p) => p.label === 'Light: primary text on canvas');
    expect(pair).toBeDefined();
    expect(pair!.fgHex).toBe('#111111');
    expect(pair!.bgHex).toBe('#FAFAFA');
  });

  it('returns ratio values rounded to 2 decimal places', () => {
    const tokens = makeTokenTree();
    const result = validateThemeContrast(tokens);
    for (const pair of result.pairs) {
      const decimals = pair.ratio.toString().split('.')[1];
      expect(!decimals || decimals.length <= 2).toBe(true);
    }
  });

  it('skips pairs where tokens cannot be resolved', () => {
    const result = validateThemeContrast({});
    expect(result.passes).toBe(true);
    expect(result.pairs).toHaveLength(0);
  });

  it('uses 3:1 ratio for interactive and status pairs', () => {
    const tokens = makeTokenTree();
    const result = validateThemeContrast(tokens);
    const interactivePair = result.pairs.find((p) => p.label.includes('interactive primary on canvas'));
    expect(interactivePair).toBeDefined();
    expect(interactivePair!.required).toBe(3);
  });

  it('uses 4.5:1 ratio for normal body text pairs', () => {
    const tokens = makeTokenTree();
    const result = validateThemeContrast(tokens);
    const textPair = result.pairs.find((p) => p.label === 'Light: primary text on canvas');
    expect(textPair).toBeDefined();
    expect(textPair!.required).toBe(4.5);
  });
});
