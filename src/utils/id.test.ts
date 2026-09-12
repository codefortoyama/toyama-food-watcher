import { describe, it, expect } from 'vitest';
import { generateFacilityId, generateFacilityIdSync } from './id';

describe('id generation', () => {
  it('should generate same ID for same input (sync)', () => {
    const id1 = generateFacilityIdSync('123', 'Name', 'Addr', 'Type', '2023-01-01');
    const id2 = generateFacilityIdSync('123', 'Name', 'Addr', 'Type', '2023-01-01');
    expect(id1).toBe(id2);
  });

  it('should generate same ID for same input (async)', async () => {
    const id1 = await generateFacilityId('123', 'Name', 'Addr', 'Type', '2023-01-01');
    const id2 = await generateFacilityId('123', 'Name', 'Addr', 'Type', '2023-01-01');
    expect(id1).toBe(id2);
  });

  it('should generate same ID for sync and async', async () => {
    const idSync = generateFacilityIdSync('123', 'Name', 'Addr', 'Type', '2023-01-01');
    const idAsync = await generateFacilityId('123', 'Name', 'Addr', 'Type', '2023-01-01');
    expect(idSync).toBe(idAsync);
  });

  it('should generate different ID for different input', () => {
    const id1 = generateFacilityIdSync('123', 'Name', 'Addr', 'Type', '2023-01-01');
    const id2 = generateFacilityIdSync('124', 'Name', 'Addr', 'Type', '2023-01-01');
    expect(id1).not.toBe(id2);
  });

  it('should normalize input before generating ID', () => {
    const id1 = generateFacilityIdSync(' 123 ', 'Name', 'Addr', 'Type', '2023-01-01');
    const id2 = generateFacilityIdSync('123', 'Name', 'Addr', 'Type', '2023-01-01');
    expect(id1).toBe(id2);
  });
});
