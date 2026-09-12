import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDiffData } from '../services/dataService';
import { FacilityDiff } from '../types/facility';

const DiffPage: React.FC = () => {
  const [diff, setDiff] = useState<FacilityDiff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchDiffData();
        setDiff(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (!diff) return <div className="card">差分データがありません。</div>;

  return (
    <div className="diff-page">
      <h2>前回データとの差分</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
        前回バージョン: {diff.metadata.previousVersion.substring(0, 8)}
        <br />
        現在バージョン: {diff.metadata.currentVersion.substring(0, 8)}
        <br />
        生成日時: {new Date(diff.metadata.generatedAt).toLocaleString()}
      </p>

      <section className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ color: 'var(--danger)' }}>追加された施設 ({diff.added.length})</h3>
        {diff.added.length === 0 ? (
          <p>なし</p>
        ) : (
          <ul>
            {diff.added.map((f) => (
              <li key={f.id}>
                <Link to={`/facilities/${f.id}`}>{f.facilityName}</Link> ({f.businessType}) -{' '}
                {f.address}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h3>変更があった施設 ({diff.changed.length})</h3>
        {diff.changed.length === 0 ? (
          <p>なし</p>
        ) : (
          <ul>
            {diff.changed.map((c) => (
              <li key={c.id}>
                <Link to={`/facilities/${c.id}`}>施設ID: {c.id}</Link>
                <ul style={{ fontSize: '0.9rem' }}>
                  {Object.entries(c.after).map(([key, val]) => (
                    <li key={key}>
                      {key}: {(c.before as any)[key]} → {val}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h3 style={{ color: 'var(--text-light)' }}>掲載がなくなった施設 ({diff.removed.length})</h3>
        <p style={{ fontSize: '0.8rem' }}>
          ※掲載がなくなった理由は、閉店、許可更新、データ修正など複数の可能性があります。
        </p>
        {diff.removed.length === 0 ? (
          <p>なし</p>
        ) : (
          <ul>
            {diff.removed.map((f) => (
              <li key={f.id} style={{ color: 'var(--text-light)' }}>
                {f.facilityName} ({f.businessType}) - {f.address}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default DiffPage;
