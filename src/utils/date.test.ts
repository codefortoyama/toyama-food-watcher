import { describe, it, expect } from 'vitest';
import {
  parseExcelDate,
  parseDateString,
  formatIsoDate,
  getLatestPermitDate,
  isWithinPeriod,
  getDateRangeFromBaseDate,
} from './date';

describe('date utilities', () => {
  describe('parseExcelDate', () => {
    it('should parse excel serial numbers', () => {
      // 45000 is 2023-03-15
      const date = parseExcelDate(45000);
      expect(formatIsoDate(date)).toBe('2023-03-15');
    });
    it('should return null for invalid number', () => {
      expect(parseExcelDate(NaN)).toBeNull();
    });
    it('should return the date if a Date object is passed', () => {
      const date = new Date(2023, 2, 15);
      expect(formatIsoDate(parseExcelDate(date))).toBe('2023-03-15');
    });
  });

  describe('parseDateString', () => {
    it('should parse YYYY-MM-DD', () => {
      expect(formatIsoDate(parseDateString('2023-03-15'))).toBe('2023-03-15');
    });
    it('should parse YYYY/MM/DD', () => {
      expect(formatIsoDate(parseDateString('2023/03/15'))).toBe('2023-03-15');
    });
    it('should parse Japanese date strings', () => {
      expect(formatIsoDate(parseDateString('2023年3月15日'))).toBe('2023-03-15');
    });
    it('should parse Reiwa era', () => {
      expect(formatIsoDate(parseDateString('令和5年3月15日'))).toBe('2023-03-15');
      expect(formatIsoDate(parseDateString('令和元年5月1日'))).toBe('2019-05-01');
    });
    it('should parse Heisei era', () => {
      expect(formatIsoDate(parseDateString('平成31年4月30日'))).toBe('2019-04-30');
    });
  });

  describe('getLatestPermitDate', () => {
    it('should return the latest date', () => {
      const dates = ['2023-01-01', '2023-05-01', '2023-03-01', null];
      expect(getLatestPermitDate(dates)).toBe('2023-05-01');
    });
  });

  describe('isWithinPeriod', () => {
    it('should return true if within period', () => {
      expect(isWithinPeriod('2023-05-01', '2023-06-01', 90)).toBe(true);
      expect(isWithinPeriod('2023-01-01', '2023-06-01', 90)).toBe(false);
    });
  });

  describe('getDateRangeFromBaseDate', () => {
    it('should return the correct date string', () => {
      expect(getDateRangeFromBaseDate('2023-06-01', 30)).toBe('2023-05-02');
    });
  });
});
