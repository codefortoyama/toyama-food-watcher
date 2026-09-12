import { Facility, FacilityDiff } from '../src/types/facility';
import { normalizeText } from '../src/utils/normalization';

function getMatchKey(f: Facility): string {
  const p = normalizeText(f.permitNumber);
  if (p) return `P:${p}`;

  return `F:${normalizeText(f.facilityName)}|A:${normalizeText(f.address)}|T:${normalizeText(f.businessType)}`;
}

export function generateDiff(
  current: Facility[],
  previous: Facility[],
  currentVersion: string,
  previousVersion: string,
): FacilityDiff {
  const diff: FacilityDiff = {
    added: [],
    removed: [],
    changed: [],
    metadata: {
      currentVersion,
      previousVersion,
      generatedAt: new Date().toISOString(),
    },
  };

  const prevMap = new Map<string, Facility>();
  previous.forEach((f) => prevMap.set(getMatchKey(f), f));

  const currKeys = new Set<string>();

  current.forEach((curr) => {
    const key = getMatchKey(curr);
    currKeys.add(key);
    const prev = prevMap.get(key);

    if (!prev) {
      diff.added.push(curr);
    } else {
      const changes: Partial<Facility> = {};
      const before: Partial<Facility> = {};

      let hasChanged = false;
      const keysToCompare: (keyof Facility)[] = [
        'businessType',
        'subCategory',
        'facilityName',
        'address',
        'buildingName',
        'operatorName',
        'permitDate',
        'expirationDate',
      ];

      keysToCompare.forEach((k) => {
        if (curr[k] !== prev[k]) {
          hasChanged = true;
          changes[k] = curr[k] as any;
          before[k] = prev[k] as any;
        }
      });

      if (hasChanged) {
        diff.changed.push({
          id: curr.id,
          before,
          after: changes,
        });
      }
    }
  });

  previous.forEach((prev) => {
    if (!currKeys.has(getMatchKey(prev))) {
      diff.removed.push(prev);
    }
  });

  return diff;
}
