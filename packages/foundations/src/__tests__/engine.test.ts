import { describe, it, expect } from 'vitest';
import { buildFoundation, nihonTraditionalData, swissInternationalData } from '../index';
import { validateSchema, validateCompleteness } from '@syncupsuite/tokens';

describe('buildFoundation', () => {
  it('builds nihon-traditional foundation', () => {
    const result = buildFoundation(nihonTraditionalData);
    expect(result.tokens.primitive?.color).toBeDefined();
    expect(result.tokens.semantic?.light).toBeDefined();
    expect(result.tokens.semantic?.dark).toBeDefined();
    expect(result.meta.id).toBe('nihon-no-iro-traditional');
  });

  it('builds swiss-international foundation', () => {
    const result = buildFoundation(swissInternationalData);
    expect(result.tokens.primitive?.color).toBeDefined();
    expect(result.tokens.semantic?.light).toBeDefined();
    expect(result.meta.foundation.harmonyMode).toBe('monochromatic');
  });

  it('generates neutral colors', () => {
    const result = buildFoundation(nihonTraditionalData);
    const neutrals = result.tokens.primitive?.color?.neutral as Record<string, unknown>;
    expect(neutrals).toBeDefined();
    expect(neutrals['50']).toBeDefined();
    expect(neutrals['900']).toBeDefined();
  });

  it('generates typography primitives', () => {
    const result = buildFoundation(nihonTraditionalData);
    const typo = result.tokens.primitive?.typography;
    expect(typo).toBeDefined();
    expect(typo?.family).toBeDefined();
    expect(typo?.size).toBeDefined();
  });

  it('generates spacing primitives', () => {
    const result = buildFoundation(nihonTraditionalData);
    const spacing = result.tokens.primitive?.spacing;
    expect(spacing).toBeDefined();
  });

  it('generates radius primitives', () => {
    const result = buildFoundation(nihonTraditionalData);
    const radius = result.tokens.primitive?.radius;
    expect(radius).toBeDefined();
  });

  it('passes schema validation', () => {
    const result = buildFoundation(nihonTraditionalData);
    const validation = validateSchema(result.tokens as Record<string, unknown>);
    expect(validation.valid).toBe(true);
  });

  it('passes completeness validation', () => {
    const result = buildFoundation(nihonTraditionalData);
    const validation = validateCompleteness(result.tokens as Record<string, unknown>);
    expect(validation.valid).toBe(true);
  });
});
