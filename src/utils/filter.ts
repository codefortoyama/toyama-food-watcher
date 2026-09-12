import { Facility } from '../types/facility';
import { normalizeText } from './normalization';
import { isWithinPeriod } from './date';

export interface FilterOptions {
  keyword: string;
  businessType: string;
  subCategory: string;
  period: number | 'all';
  address: string;
  recentOnly: boolean;
  addedOnly: boolean;
  baseDate: string | null;
  addedIds?: Set<string>;
}

export function filterFacilities(facilities: Facility[], options: FilterOptions): Facility[] {
  return facilities.filter((f) => {
    // Keyword search (AND)
    if (options.keyword) {
      const keywords = normalizeText(options.keyword).toLowerCase().split(/\s+/);
      const isMatch = keywords.every((kw) => f.searchText.includes(kw));
      if (!isMatch) return false;
    }

    // Business type
    if (options.businessType && f.businessType !== options.businessType) {
      return false;
    }

    // Sub category
    if (options.subCategory && f.subCategory !== options.subCategory) {
      return false;
    }

    // Period
    if (options.period !== 'all' && options.baseDate) {
      if (!isWithinPeriod(f.permitDate, options.baseDate, options.period)) {
        return false;
      }
    }

    // Address keyword
    if (options.address) {
      const addrKw = normalizeText(options.address).toLowerCase();
      if (!f.address.toLowerCase().includes(addrKw)) {
        return false;
      }
    }

    // Added Only (diff)
    if (options.addedOnly && options.addedIds && !options.addedIds.has(f.id)) {
      return false;
    }

    return true;
  });
}

export type SortOrder = 'date_desc' | 'date_asc' | 'name_asc' | 'type_asc';

export function sortFacilities(facilities: Facility[], order: SortOrder): Facility[] {
  return [...facilities].sort((a, b) => {
    switch (order) {
      case 'date_desc': {
        if (a.permitDate === b.permitDate)
          return a.facilityName.localeCompare(b.facilityName, 'ja');
        if (!a.permitDate) return 1;
        if (!b.permitDate) return -1;
        return b.permitDate.localeCompare(a.permitDate);
      }
      case 'date_asc': {
        if (a.permitDate === b.permitDate)
          return a.facilityName.localeCompare(b.facilityName, 'ja');
        if (!a.permitDate) return 1;
        if (!b.permitDate) return -1;
        return a.permitDate.localeCompare(b.permitDate);
      }
      case 'name_asc':
        return a.facilityName.localeCompare(b.facilityName, 'ja');
      case 'type_asc':
        return a.businessType.localeCompare(b.businessType, 'ja');
      default:
        return 0;
    }
  });
}
