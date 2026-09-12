# データ出典と権利表記

本アプリケーションでは以下のデータを使用しています。

## 出典データ

- **データ名称:** 食品営業許可施設
- **提供者:** 富山市
- **データセットURL:** [https://opdt.city.toyama.lg.jp/dataset/seikatsu-eisei01](https://opdt.city.toyama.lg.jp/dataset/seikatsu-eisei01)
- **ライセンス:** [クリエイティブ・コモンズ 表示 4.0 国際 (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.ja)

## 加工内容

- XLSX形式からJSON形式への変換
- 施設名、住所、業種等の正規化（半角・全角の統一、空白の整理）
- 日付形式の統一（YYYY-MM-DD）
- 複数の項目を組み合わせた安定IDの生成
- 前回取得データとの比較による差分抽出
- 業種別、期間別の集計
- 検索用インデックスの生成
