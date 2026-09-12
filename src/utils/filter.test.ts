import { describe, it, expect } from 'vitest';
import { filterFacilities, sortFacilities } from './filter';
import { Facility } from '../types/facility';

describe('filterFacilities', () => {
  const f1: Facility = {
    id: '1',
    businessType: '飲食店営業',
    subCategory: 'S1',
    facilityName: 'カフェA',
    address: '住所1',
    buildingName: '',
    operatorName: '',
    permitNumber: 'P1',
    permitDate: '2024-01-01',
    expirationDate: '2030-01-01',
    sourceRowNumber: 1,
    searchText: '飲食店営業 カフェA 住所1',
  };
  const f2: Facility = {
    id: '2',
    businessType: '菓子製造業',
    subCategory: 'S2',
    facilityName: '菓子店B',
    address: '住所2',
    buildingName: '',
    operatorName: '',
    permitNumber: 'P2',
    permitDate: '2024-02-01',
    expirationDate: '2030-02-01',
    sourceRowNumber: 2,
    searchText: '菓子製造業 菓子店B 住所2',
  };

  it('should filter by keyword', () => {
    const results = filterFacilities([f1, f2], {
      keyword: 'カフェ',
      businessType: '',
      subCategory: '',
      period: 'all',
      address: '',
      recentOnly: false,
      addedOnly: false,
      baseDate: null,
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('should filter by businessType', () => {
    const results = filterFacilities([f1, f2], {
      keyword: '',
      businessType: '菓子製造業',
      subCategory: '',
      period: 'all',
      address: '',
      recentOnly: false,
      addedOnly: false,
      baseDate: null,
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('should filter by period', () => {
    const results = filterFacilities([f1, f2], {
      keyword: '',
      businessType: '',
      subCategory: '',
      period: 30,
      address: '',
      recentOnly: false,
      addedOnly: false,
      baseDate: '2024-02-15',
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('should filter by subCategory', () => {
    const results = filterFacilities([f1, f2], {
      keyword: '',
      businessType: '',
      subCategory: 'S2',
      period: 'all',
      address: '',
      recentOnly: false,
      addedOnly: false,
      baseDate: null,
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('should filter by address', () => {
    const results = filterFacilities([f1, f2], {
      keyword: '',
      businessType: '',
      subCategory: '',
      period: 'all',
      address: '住所1',
      recentOnly: false,
      addedOnly: false,
      baseDate: null,
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('should filter by addedOnly', () => {
    const addedIds = new Set(['2']);
    const results = filterFacilities([f1, f2], {
      keyword: '',
      businessType: '',
      subCategory: '',
      period: 'all',
      address: '',
      recentOnly: false,
      addedOnly: true,
      baseDate: null,
      addedIds,
    });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });
});

describe('sortFacilities', () => {
  const f1: Facility = {
    id: '1',
    facilityName: 'B',
    businessType: 'T1',
    permitDate: '2024-01-01',
  } as any;
  const f2: Facility = {
    id: '2',
    facilityName: 'A',
    businessType: 'T2',
    permitDate: '2024-02-01',
  } as any;
  const f3: Facility = { id: '3', facilityName: 'C', businessType: 'T3', permitDate: null } as any;

  it('should sort by date desc', () => {
    const results = sortFacilities([f1, f2, f3], 'date_desc');
    expect(results[0].id).toBe('2');
    expect(results[1].id).toBe('1');
    expect(results[2].id).toBe('3');
  });

  it('should sort by date asc', () => {
    const results = sortFacilities([f1, f2, f3], 'date_asc');
    expect(results[0].id).toBe('1');
    expect(results[1].id).toBe('2');
    expect(results[2].id).toBe('3');
  });

  it('should sort by name asc', () => {
    const results = sortFacilities([f1, f2], 'name_asc');
    expect(results[0].id).toBe('2'); // 'A' comes before 'B'
  });

  it('should sort by type asc', () => {
    const results = sortFacilities([f1, f2], 'type_asc');
    expect(results[0].id).toBe('1'); // 'T1' comes before 'T2'
  });
});
