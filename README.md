# 富山市 新規営業許可施設ウォッチャー

富山市のオープンデータを利用し、新たに営業許可を受けた食品関係施設を検索・閲覧できるWebアプリです。

## 概要

富山市が公開している「食品営業許可施設」オープンデータを定期的に取得し、最近許可された施設をわかりやすく表示します。

## 重要な注意点

- 本サイトで表示している日付は「営業許可を受けた日」であり、**実際の開店日（オープン日）とは異なる場合があります**。
- データの更新タイミングにより、最新の情報が反映されるまでに時間がかかることがあります。

## 技術構成

- **Frontend:** React, TypeScript, Vite, React Router
- **Data Processing:** Node.js, SheetJS (xlsx), Axios
- **CI/CD:** GitHub Actions, GitHub Pages
- **Testing:** Vitest, Playwright

## セットアップと開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm run test:unit
npm run test:e2e

# ビルド
npm run build
```

## データ更新の仕組み

GitHub Actionsにより週1回自動的に富山市のサイトから最新のXLSXファイルをチェックします。
変更がある場合は、差分を生成しプルリクエストを作成します。

## ライセンス

ソースコード：MIT License
データ出典：富山市 オープンデータ（食品営業許可施設）
