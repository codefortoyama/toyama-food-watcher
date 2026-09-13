import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchCurrentData, fetchMetadata } from '../services/dataService';
import { Facility, AppMetadata } from '../types/facility';
import { getLatestPermitDate, isWithinPeriod } from '../utils/date';

const TopPage: React.FC = () => {
  const [data, setData] = useState<Facility[]>([]);
  const [metadata, setMetadata] = useState<AppMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentDays, setRecentDays] = useState(90);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Try current data, if fail, try fixture
        let currentData;
        try {
          currentData = await fetchCurrentData();
        } catch {
          console.warn('Failed to fetch current.json, using fixture');
          const response = await fetch(`${import.meta.env.BASE_URL}fixtures/sample-current.json`);
          currentData = await response.json();
        }

        let meta;
        try {
          meta = await fetchMetadata();
        } catch {
          meta = null;
        }

        setData(currentData);
        setMetadata(meta);
      } catch (err) {
        setError('データの読み込みに失敗しました。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const baseDate = useMemo(() => getLatestPermitDate(data.map((f) => f.permitDate)), [data]);

  const recentFacilities = useMemo(() => {
    if (!baseDate) return [];
    return data.filter((f) => isWithinPeriod(f.permitDate, baseDate, recentDays));
  }, [data, baseDate, recentDays]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((f) => {
      counts[f.businessType] = (counts[f.businessType] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [data]);

  if (loading) return <div>読み込み中...</div>;
  if (error)
    return (
      <div className="card" style={{ border: '1px solid var(--danger)' }}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>再読み込み</button>
      </div>
    );

  return (
    <div className="top-page">
      <section className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <h2>富山市食品営業許可申請ビューア</h2>
        <p>富山市のオープンデータを利用し、最近新たに営業許可を受けた施設をチェックできます。</p>
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/list">
            <button className="primary" style={{ fontSize: '1.2rem', padding: '0.75rem 2rem' }}>
              施設を探す
            </button>
          </Link>
        </div>
      </section>

      <div className="grid">
        <section className="card">
          <h3>統計</h3>
          <ul>
            <li>
              掲載施設数: <strong>{data.length}</strong> 件
            </li>
            <li>
              最近の許可施設数: <strong>{recentFacilities.length}</strong> 件 ({recentDays}日以内)
            </li>
            {metadata && (
              <>
                <li>データ基準日: {baseDate || '不明'}</li>
                <li>更新確認日: {new Date(metadata.downloadedAt).toLocaleDateString()}</li>
              </>
            )}
          </ul>
          <div style={{ marginTop: '1rem' }}>
            <label>「最近」の期間: </label>
            <select value={recentDays} onChange={(e) => setRecentDays(Number(e.target.value))}>
              <option value={30}>30日</option>
              <option value={90}>90日</option>
              <option value={180}>180日</option>
              <option value={365}>1年</option>
            </select>
          </div>
        </section>

        <section className="card">
          <h3>主な業種</h3>
          <ul>
            {categoryCounts.map(([cat, count]) => (
              <li key={cat}>
                {cat}: {count} 件
              </li>
            ))}
          </ul>
          <Link to="/dashboard">すべての統計を見る</Link>
        </section>
      </div>

      <section>
        <h3>最新の掲載施設</h3>
        <div className="grid">
          {data.slice(0, 3).map((f) => (
            <div key={f.id} className="card">
              <span className="badge badge-primary">{f.businessType}</span>
              {isWithinPeriod(f.permitDate, baseDate, 30) && (
                <span className="badge badge-new">NEW</span>
              )}
              <h4 style={{ margin: '0.5rem 0' }}>{f.facilityName}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: '0.25rem 0' }}>
                {f.address} {f.buildingName}
              </p>
              <p style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>
                許可日: {f.permitDate || '不明'}
              </p>
              <Link to={`/facilities/${f.id}`}>詳細を見る</Link>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/list">もっと見る</Link>
        </div>
      </section>
    </div>
  );
};

export default TopPage;
