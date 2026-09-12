/**
 * 文字列を正規化する
 * - null/undefined を空文字にする
 * - NFKC正規化を行う
 * - 前後の空白を削除する
 * - タブ、改行、連続空白を半角スペース1文字にする
 */
export function normalizeText(text: string | null | undefined): string {
  if (text == null) return '';

  return text
    .normalize('NFKC')
    .trim()
    .replace(/[\t\n\r]+/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * 検索用文字列を生成する
 * - 英字を小文字化する
 */
export function generateSearchText(texts: (string | null | undefined)[]): string {
  return texts
    .map((t) => normalizeText(t).toLowerCase())
    .filter(Boolean)
    .join(' ');
}
