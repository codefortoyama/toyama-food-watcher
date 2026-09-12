import { Facility, AppMetadata, FacilityDiff } from '../types/facility';

const BASE_URL = import.meta.env.BASE_URL;

export async function fetchCurrentData(): Promise<Facility[]> {
  const response = await fetch(`${BASE_URL}data/current.json`);
  if (!response.ok) throw new Error('Failed to fetch current data');
  return response.json();
}

export async function fetchMetadata(): Promise<AppMetadata> {
  const response = await fetch(`${BASE_URL}data/metadata.json`);
  if (!response.ok) throw new Error('Failed to fetch metadata');
  return response.json();
}

export async function fetchDiffData(): Promise<FacilityDiff> {
  const response = await fetch(`${BASE_URL}data/diff.json`);
  if (!response.ok) throw new Error('Failed to fetch diff data');
  return response.json();
}

// For local testing/fixtures
export async function fetchFixtureData(): Promise<Facility[]> {
  const response = await fetch(`${BASE_URL}fixtures/sample-current.json`);
  if (!response.ok) throw new Error('Failed to fetch fixture data');
  return response.json();
}
