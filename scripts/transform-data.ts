import XLSX from 'xlsx';
import { Facility } from '../src/types/facility';
import { normalizeText, generateSearchText } from '../src/utils/normalization';
import { parseExcelDate, parseDateString, formatIsoDate } from '../src/utils/date';
import { generateFacilityIdSync } from '../src/utils/id';

const COLUMN_CANDIDATES = {
  businessType: ['業種', '営業種目', '営業の種類'],
  subCategory: ['細分類', '営業細目'],
  facilityName: ['施設名', '営業施設名'],
  address: ['施設住所', '住所', '所在地'],
  buildingName: ['ビル名', '建物名'],
  operatorName: ['営業者名', '氏名'],
  permitNumber: ['許可番号'],
  permitDate: ['許可年月日', '許可日'],
  expirationDate: ['有効年月日', '有効期限', '許可満了日'],
};

export function transformSheet(worksheet: XLSX.WorkSheet): Facility[] {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
  if (jsonData.length === 0) return [];

  const headerRow = jsonData[0] as string[];
  const colMap: Record<string, number> = {};

  Object.entries(COLUMN_CANDIDATES).forEach(([key, candidates]) => {
    const index = headerRow.findIndex((cell) => candidates.includes(normalizeText(cell)));
    if (index !== -1) {
      colMap[key] = index;
    }
  });

  // Basic validation: ensure critical columns are found
  const required = ['facilityName', 'permitNumber'];
  const missing = required.filter((r) => colMap[r] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Missing required columns: ${missing.join(', ')}. Found: ${headerRow.join(', ')}`,
    );
  }

  return jsonData
    .slice(1)
    .map((row, index) => {
      const getValue = (key: string) => {
        const colIdx = colMap[key];
        return colIdx !== undefined ? row[colIdx] : '';
      };

      const facilityName = normalizeText(getValue('facilityName'));

      // HからK列 (Index 7, 8, 9, 10) を結合して住所とする
      const addressParts = [row[7], row[8], row[9], row[10]]
        .map((p) => (p != null ? String(p).trim() : ''))
        .filter(Boolean);

      let address = addressParts.join('');
      if (!address) {
        address = normalizeText(getValue('address'));
      } else {
        address = normalizeText(address);
      }

      const permitNumber = normalizeText(getValue('permitNumber'));

      // 業種から丸囲み数字等を除去する (例: ① 飲食店営業 -> 飲食店営業)
      let businessType = normalizeText(getValue('businessType'));
      businessType = businessType.replace(/^[①-㊿]\s*/, '');

      const permitDateRaw = getValue('permitDate');
      const expirationDateRaw = getValue('expirationDate');

      const permitDate = formatIsoDate(
        parseExcelDate(permitDateRaw) || parseDateString(permitDateRaw),
      );
      const expirationDate = formatIsoDate(
        parseExcelDate(expirationDateRaw) || parseDateString(expirationDateRaw),
      );

      const id = generateFacilityIdSync(
        permitNumber,
        facilityName,
        address,
        businessType,
        permitDate,
      );

      const facility: Facility = {
        id,
        businessType,
        subCategory: normalizeText(getValue('subCategory')),
        facilityName,
        address,
        buildingName: normalizeText(getValue('buildingName')),
        operatorName: normalizeText(getValue('operatorName')),
        permitNumber,
        permitDate,
        expirationDate,
        sourceRowNumber: index + 2,
        searchText: '',
      };

      facility.searchText = generateSearchText([
        facility.facilityName,
        facility.address,
        facility.buildingName,
        facility.businessType,
        facility.subCategory,
        facility.operatorName,
        facility.permitNumber,
      ]);

      return facility;
    })
    .filter((f) => f.facilityName || f.address || f.permitNumber);
}
