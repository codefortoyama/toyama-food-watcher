import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCurrentData } from '../services/dataService';
import { Facility } from '../types/facility';
import { isFavorite, toggleFavorite } from '../utils/favorites';

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchCurrentData().catch(() =>
          fetch(`${import.meta.env.BASE_URL}fixtures/sample-current.json`).then((r) => r.json()),
        );
        const found = data.find((f: Facility) => f.id === id);
        if (found) {
          setFacility(found);
          setFavorited(isFavorite(found.id));
        } else {
          setError('指定された施設が見つかりませんでした。');
        }
      } catch {
        setError('データの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleToggleFavorite = () => {
    if (facility) {
      toggleFavorite(facility.id);
      setFavorited(!favorited);
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error || !facility)
    return (
      <div className="card">
        <p>{error || '施設が見つかりません。'}</p>
        <Link to="/list">一覧に戻る</Link>
      </div>
    );

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address + ' ' + (facility.buildingName || ''))}`;

  return (
    <div className="detail-page">
      <nav style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/list">← 一覧に戻る</Link>
        <button
          onClick={handleToggleFavorite}
          style={{ borderColor: favorited ? 'orange' : 'var(--border)' }}
        >
          {favorited ? '★ お気に入り解除' : '☆ お気に入り登録'}
        </button>
      </nav>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-primary">{facility.businessType}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>ID: {facility.id}</span>
        </div>
        <h2 style={{ margin: '1rem 0' }}>{facility.facilityName}</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['業種', facility.businessType],
              ['細分類', facility.subCategory],
              ['住所', facility.address],
              ['ビル・建物名', facility.buildingName],
              ['営業者名', facility.operatorName],
              ['許可番号', facility.permitNumber],
              ['許可年月日', facility.permitDate],
              ['有効年月日', facility.expirationDate],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem 0',
                    width: '150px',
                    fontSize: '0.9rem',
                    color: 'var(--text-light)',
                  }}
                >
                  {label}
                </th>
                <td style={{ padding: '0.75rem 0' }}>{value || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <button className="primary">Googleマップで見る</button>
          </a>
        </div>
      </section>

      <section
        className="card"
        style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-light)' }}
      >
        <h4>データに関する注意</h4>
        <p>
          本サイトに掲載されている「許可年月日」は、保健所から営業許可を受けた日付であり、実際の開店日（オープン日）とは異なる場合があります。
          正確な開店情報については、各施設の公式サイトやSNS等をご確認ください。
        </p>
        <p>出典：富山市オープンデータ「食品営業許可施設」に基づき作成</p>
      </section>
    </div>
  );
};

export default DetailPage;
