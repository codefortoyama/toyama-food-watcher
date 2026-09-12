import { describe, it, expect } from 'vitest';
import { normalizeText, generateSearchText } from './normalization';

describe('normalizeText', () => {
  it('should handle null/undefined', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });

  it('should trim whitespace', () => {
    expect(normalizeText('  hello  ')).toBe('hello');
  });

  it('should normalize Unicode NFKC', () => {
    // Full-width to half-width
    expect(normalizeText('ＡＢＣ')).toBe('ABC');
    expect(normalizeText('１２３')).toBe('123');
  });

  it('should replace tabs and newlines with a single space', () => {
    expect(normalizeText('line1\nline2\tline3')).toBe('line1 line2 line3');
  });

  it('should collapse multiple spaces', () => {
    expect(normalizeText('hello   world')).toBe('hello world');
  });
});

describe('generateSearchText', () => {
  it('should lowercase and join texts', () => {
    expect(generateSearchText(['ABC', 'def', null, '  GHI  '])).toBe('abc def ghi');
  });
});
