/**
 * Excelのシリアル値をDateオブジェクトに変換する
 */
export function parseExcelDate(value: any): Date | null {
  if (typeof value === 'number') {
    // Excel base date is 1899-12-30
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date;
  }
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  return null;
}

/**
 * 日本語の日付文字列（和暦含む）を解析する
 * 対応例: 2023-01-01, 2023/01/01, 2023年1月1日, 令和5年1月1日
 */
export function parseDateString(value: any): Date | null {
  if (!value || typeof value !== 'string') return null;

  let str = value.trim();

  // Handle Japanese eras (very basic support)
  if (str.includes('令和')) {
    const match = str.match(/令和(\d+|元)年(\d+)月(\d+)日/);
    if (match) {
      const year = match[1] === '元' ? 2019 : parseInt(match[1]) + 2018;
      return new Date(year, parseInt(match[2]) - 1, parseInt(match[3]));
    }
  }
  if (str.includes('平成')) {
    const match = str.match(/平成(\d+|元)年(\d+)月(\d+)日/);
    if (match) {
      const year = match[1] === '元' ? 1989 : parseInt(match[1]) + 1988;
      return new Date(year, parseInt(match[2]) - 1, parseInt(match[3]));
    }
  }

  // Handle YYYY年M月D日
  const kanjiMatch = str.match(/(\d+)年(\d+)月(\d+)日/);
  if (kanjiMatch) {
    return new Date(parseInt(kanjiMatch[1]), parseInt(kanjiMatch[2]) - 1, parseInt(kanjiMatch[3]));
  }

  // Standard date formats
  const date = new Date(str.replace(/\//g, '-'));
  return isNaN(date.getTime()) ? null : date;
}

/**
 * DateオブジェクトをYYYY-MM-DD形式に変換する
 */
export function formatIsoDate(date: Date | null): string | null {
  if (!date || isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 施設リストから最新の許可年月日を取得する
 */
export function getLatestPermitDate(dates: (string | null)[]): string | null {
  const validDates = dates
    .filter((d): d is string => !!d)
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()));

  if (validDates.length === 0) return null;

  const latest = new Date(Math.max(...validDates.map((d) => d.getTime())));
  return formatIsoDate(latest);
}

/**
 * 基準日から指定日数前の日付を取得する
 */
export function getDateRangeFromBaseDate(baseDateStr: string, days: number): string {
  const date = new Date(baseDateStr);
  date.setDate(date.getDate() - days);
  return formatIsoDate(date) || '';
}

/**
 * 日付が指定期間内（baseDateからdays日前まで）にあるか判定する
 */
export function isWithinPeriod(
  dateStr: string | null,
  baseDateStr: string | null,
  days: number,
): boolean {
  if (!dateStr || !baseDateStr) return false;

  const date = new Date(dateStr);
  const baseDate = new Date(baseDateStr);
  const startDate = new Date(baseDateStr);
  startDate.setDate(baseDate.getDate() - days);

  return date >= startDate && date <= baseDate;
}
