import { describe, it, expect } from 'vitest';
import { generateDiff } from './generate-diff';
import { Facility } from '../src/types/facility';

describe('generateDiff', () => {
  const f1: Facility = {
    id: '1',
    businessType: 'T1',
    subCategory: 'S1',
    facilityName: 'N1',
    address: 'A1',
    buildingName: 'B1',
    operatorName: 'O1',
    permitNumber: 'P1',
    permitDate: '2023-01-01',
    expirationDate: '2030-01-01',
    sourceRowNumber: 1,
    searchText: '',
  };
  const f2: Facility = {
    id: '2',
    businessType: 'T2',
    subCategory: 'S2',
    facilityName: 'N2',
    address: 'A2',
    buildingName: 'B2',
    operatorName: 'O2',
    permitNumber: 'P2',
    permitDate: '2023-02-01',
    expirationDate: '2030-02-01',
    sourceRowNumber: 2,
    searchText: '',
  };

  it('should identify added facilities', () => {
    const diff = generateDiff([f1, f2], [f1], 'v2', 'v1');
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].id).toBe('2');
    expect(diff.removed).toHaveLength(0);
  });

  it('should identify removed facilities', () => {
    const diff = generateDiff([f1], [f1, f2], 'v2', 'v1');
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].id).toBe('2');
    expect(diff.added).toHaveLength(0);
  });

  it('should identify changed facilities', () => {
    const f1Changed = { ...f1, facilityName: 'N1 Updated' };
    const diff = generateDiff([f1Changed], [f1], 'v2', 'v1');
    expect(diff.changed).toHaveLength(1);
    expect(diff.changed[0].id).toBe('1');
    expect(diff.changed[0].after.facilityName).toBe('N1 Updated');
  });
});
