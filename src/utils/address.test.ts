import { describe, it, expect } from 'vitest';
import { extractTownName } from './address';

describe('extractTownName', () => {
  it('should extract town name from Toyama city address', () => {
    expect(extractTownName('富山市新桜町7-38')).toBe('新桜町');
    expect(extractTownName('富山市総曲輪3丁目1番1号')).toBe('総曲輪');
  });

  it('should handle addresses without Toyama prefix', () => {
    expect(extractTownName('新桜町7-38')).toBe('新桜町');
  });

  it('should return the whole string if no numbers found', () => {
    expect(extractTownName('富山市新桜町')).toBe('新桜町');
  });
});
