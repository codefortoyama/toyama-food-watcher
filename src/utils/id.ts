import { normalizeText } from './normalization';

/**
 * 施設IDを生成する
 * 許可番号、施設名、住所、業種、許可年月日を基に決定的なIDを生成する
 */
export async function generateFacilityId(
  permitNumber: string,
  facilityName: string,
  address: string,
  businessType: string,
  permitDate: string | null,
): Promise<string> {
  const data = [
    normalizeText(permitNumber),
    normalizeText(facilityName),
    normalizeText(address),
    normalizeText(businessType),
    permitDate || '',
  ].join('|');

  // Simple hash for ID generation
  const msgUint8 = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex.slice(0, 16);
}

/**
 * 同期版ID生成 (スクリプト用)
 * Node.jsのcryptoを使用
 */
import { createHash } from 'crypto';

export function generateFacilityIdSync(
  permitNumber: string,
  facilityName: string,
  address: string,
  businessType: string,
  permitDate: string | null,
): string {
  const data = [
    normalizeText(permitNumber),
    normalizeText(facilityName),
    normalizeText(address),
    normalizeText(businessType),
    permitDate || '',
  ].join('|');

  return createHash('sha256').update(data).digest('hex').slice(0, 16);
}
