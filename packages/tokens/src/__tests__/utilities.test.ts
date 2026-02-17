import { describe, it, expect } from 'vitest';
import {
  isToken,
  flattenTokens,
  pathToProperty,
  resolveReference,
  walkTokens,
  resolvePath,
} from '../utilities';

describe('isToken', () => {
  it('returns true for valid tokens', () => {
    expect(isToken({ $type: 'color', $value: '#FF0000' })).toBe(true);
  });

  it('returns false for groups', () => {
    expect(isToken({ nested: { $type: 'color', $value: '#FF0000' } })).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isToken(null)).toBe(false);
    expect(isToken('string')).toBe(false);
  });
});

describe('flattenTokens', () => {
  it('flattens nested token groups', () => {
    const group = {
      color: {
        red: { $type: 'color', $value: '#FF0000' },
        blue: { $type: 'color', $value: '#0000FF' },
      },
    };
    const result = flattenTokens(group);
    expect(result).toHaveLength(2);
    expect(result[0][0]).toEqual(['color', 'red']);
    expect(result[0][1].$value).toBe('#FF0000');
  });

  it('skips $-prefixed keys', () => {
    const group = {
      $name: 'test',
      color: { $type: 'color', $value: '#FF0000' },
    } as any;
    const result = flattenTokens(group);
    expect(result).toHaveLength(1);
  });
});

describe('pathToProperty', () => {
  it('converts dot paths to CSS properties', () => {
    expect(pathToProperty('primitive.color.red.500')).toBe('--primitive-color-red-500');
  });

  it('applies prefix', () => {
    expect(pathToProperty('color.red', 'theme')).toBe('--theme-color-red');
  });
});

describe('resolveReference', () => {
  it('resolves DTCG references to CSS var()', () => {
    expect(resolveReference('{primitive.color.red.500}')).toBe('var(--primitive-color-red-500)');
  });

  it('handles multiple references', () => {
    const result = resolveReference('linear-gradient({color.a}, {color.b})');
    expect(result).toBe('linear-gradient(var(--color-a), var(--color-b))');
  });

  it('returns plain values unchanged', () => {
    expect(resolveReference('#FF0000')).toBe('#FF0000');
  });
});

describe('walkTokens', () => {
  it('visits all leaf tokens', () => {
    const tokens = {
      a: { $type: 'color', $value: '#000' },
      b: { c: { $type: 'color', $value: '#FFF' } },
    };
    const paths: string[] = [];
    walkTokens(tokens, '', (path) => paths.push(path));
    expect(paths).toEqual(['a', 'b.c']);
  });
});

describe('resolvePath', () => {
  it('resolves nested paths', () => {
    const obj = { a: { b: { c: 42 } } };
    expect(resolvePath(obj, 'a.b.c')).toBe(42);
  });

  it('returns undefined for missing paths', () => {
    expect(resolvePath({}, 'a.b.c')).toBeUndefined();
  });
});
