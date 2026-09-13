import React, { useEffect, useState } from 'react';
import { fetchMetadata } from '../services/dataService';
import { AppMetadata } from '../types/facility';

const AboutPage: React.FC = () => {
  const [metadata, setMetadata] = useState<AppMetadata | null>(null);

  useEffect(() => {
    fetchMetadata()
      .then(setMetadata)
      .catch(() => {});
  }, []);

  return (
    <div className="about-page">
      <h2>このサイトについて</h2>

      <section className="card">
        <h3>プロジェクト概要</h3>
        <p>
          「富山市
          富山市食品営業許可申請ビューア」は、富山市が公開している「食品営業許可施設」オープンデータを利用し、
          新たに営業許可を受けた施設を可視化するプロジェクトです。
        </p>
      </section>

      <section className="card">
        <h3>データ出典</h3>
        <ul>
          <li>
            <strong>データ名称:</strong> 食品営業許可施設
          </li>
          <li>
            <strong>提供者:</strong> 富山市
          </li>
          <li>
            <strong>URL:</strong>{' '}
            <a
              href="https://opdt.city.toyama.lg.jp/dataset/seikatsu-eisei01"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://opdt.city.toyama.lg.jp/dataset/seikatsu-eisei01
            </a>
          </li>
          <li>
            <strong>ライセンス:</strong> クリエイティブ・コモンズ 表示 4.0 国際 (CC-BY 4.0)
          </li>
        </ul>
      </section>

      <section className="card">
        <h3>免責事項</h3>
        <p>
          本サイトに掲載されている情報は、富山市のオープンデータに基づいています。
          情報の正確性には万全を期していますが、本サイトの利用によって生じた損害について、運営者は一切の責任を負いません。
          「許可年月日」は実際の開店日とは異なる場合があります。また、データから削除された施設が必ずしも閉店したことを意味するものではありません。
        </p>
      </section>

      {metadata && (
        <section className="card">
          <h3>システム情報</h3>
          <ul>
            <li>
              <strong>データバージョン:</strong> {metadata.dataVersion}
            </li>
            <li>
              <strong>最終更新確認:</strong> {new Date(metadata.downloadedAt).toLocaleString()}
            </li>
            <li>
              <strong>レコード数:</strong> {metadata.recordCount} 件
            </li>
            <li>
              <strong>ソースファイルハッシュ:</strong> {metadata.sourceFileHash.substring(0, 16)}...
            </li>
          </ul>
        </section>
      )}
    </div>
  );
};

export default AboutPage;
