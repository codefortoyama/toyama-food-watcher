import { Facility } from '../src/types/facility';

export interface ValidationReport {
  success: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    recordCount: number;
    uniqueIdCount: number;
    invalidDateCount: number;
    diffFromPrevious?: number;
  };
}

export function validateData(
  current: Facility[],
  previous: Facility[] | null,
  config: { minCountRatio: number } = { minCountRatio: 0.5 },
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  let invalidDateCount = 0;

  if (current.length === 0) {
    errors.push('Record count is 0');
  }

  current.forEach((f, index) => {
    if (!f.id) {
      errors.push(`Missing ID at row ${f.sourceRowNumber || index}`);
    } else if (ids.has(f.id)) {
      warnings.push(`Duplicate ID: ${f.id} at row ${f.sourceRowNumber || index}`);
    }
    ids.add(f.id);

    if (!f.facilityName && !f.address && !f.permitNumber) {
      errors.push(`Empty record at row ${f.sourceRowNumber || index}`);
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (f.permitDate && !dateRegex.test(f.permitDate)) {
      errors.push(
        `Invalid permitDate format: ${f.permitDate} at row ${f.sourceRowNumber || index}`,
      );
      invalidDateCount++;
    }
    if (f.expirationDate && !dateRegex.test(f.expirationDate)) {
      errors.push(
        `Invalid expirationDate format: ${f.expirationDate} at row ${f.sourceRowNumber || index}`,
      );
    }
  });

  let diffFromPrevious: number | undefined;
  if (previous) {
    diffFromPrevious = current.length - previous.length;
    const ratio = current.length / previous.length;
    if (ratio < config.minCountRatio) {
      errors.push(
        `Significant data decrease: ${previous.length} -> ${current.length} (ratio: ${ratio.toFixed(2)})`,
      );
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    metrics: {
      recordCount: current.length,
      uniqueIdCount: ids.size,
      invalidDateCount,
      diffFromPrevious,
    },
  };
}
