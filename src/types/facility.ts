export interface Facility {
  id: string;
  businessType: string;
  subCategory: string;
  facilityName: string;
  address: string;
  buildingName: string;
  operatorName: string;
  permitNumber: string;
  permitDate: string | null; // YYYY-MM-DD
  expirationDate: string | null; // YYYY-MM-DD
  sourceRowNumber: number;
  searchText: string;
}

export interface AppMetadata {
  datasetName: string;
  provider: string;
  datasetUrl: string;
  sourceFileUrl: string;
  license: string;
  downloadedAt: string; // ISO8601
  generatedAt: string; // ISO8601
  dataVersion: string;
  recordCount: number;
  validPermitDateCount: number;
  invalidPermitDateCount: number;
  sourceFileHash: string;
  schemaVersion: string;
}

export interface FacilityDiff {
  added: Facility[];
  removed: Facility[];
  changed: {
    id: string;
    before: Partial<Facility>;
    after: Partial<Facility>;
  }[];
  metadata: {
    previousVersion: string;
    currentVersion: string;
    generatedAt: string;
  };
}
