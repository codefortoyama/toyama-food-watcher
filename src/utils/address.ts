import { normalizeText } from './normalization';

/**
 * 住所から町名を簡易的に抽出する
 * 例: 富山市新桜町7-38 -> 新桜町
 */
export function extractTownName(address: string): string {
  const normalized = normalizeText(address);
  // 富山市を削除
  const withoutCity = normalized.replace(/^富山市/, '');

  // 数字が出てくる前までを町名とする
  const match = withoutCity.match(/^([^0-9０-９]+)/);
  if (match) {
    return match[1].trim();
  }

  return withoutCity;
}
