import React, { useEffect, useState, useMemo } from 'react';
import { fetchCurrentData } from '../services/dataService';
import { Facility } from '../types/facility';
import { getLatestPermitDate, isWithinPeriod } from '../utils/date';
import { extractTownName } from '../utils/address';

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const currentData = await fetchCurrentData().catch(() =>
          fetch(`${import.meta.env.BASE_URL}fixtures/sample-current.json`).then((r) => r.json()),
        );
        setData(currentData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const baseDate = useMemo(() => getLatestPermitDate(data.map((f) => f.permitDate)), [data]);

  const stats = useMemo(() => {
    if (!baseDate) return null;
    return {
      total: data.length,
      recent30: data.filter((f) => isWithinPeriod(f.permitDate, baseDate, 30)).length,
      recent90: data.filter((f) => isWithinPeriod(f.permitDate, baseDate, 90)).length,
      recent180: data.filter((f) => isWithinPeriod(f.permitDate, baseDate, 180)).length,
    };
  }, [data, baseDate]);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((f) => {
      counts[f.businessType] = (counts[f.businessType] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [data]);

  const monthStats = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((f) => {
      if (f.permitDate) {
        const month = f.permitDate.substring(0, 7); // YYYY-MM
        counts[month] = (counts[month] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[0].localeCompare(a[0]));
  }, [data]);

  const townStats = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((f) => {
      const town = extractTownName(f.address);
      counts[town] = (counts[town] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [data]);

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="dashboard-page">
      <h2>統計情報</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>基準日: {baseDate || '不明'}</p>

      <div className="grid">
        <section className="card">
          <h3>期間別許可件数</h3>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <th>総掲載数</th>
                <td>{stats?.total} 件</td>
              </tr>
              <tr>
                <th>直近30日</th>
                <td>{stats?.recent30} 件</td>
              </tr>
              <tr>
                <th>直近90日</th>
                <td>{stats?.recent90} 件</td>
              </tr>
              <tr>
                <th>直近180日</th>
                <td>{stats?.recent180} 件</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h3>業種別 (上位)</h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>業種</th>
                <th style={{ textAlign: 'right' }}>件数</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.slice(0, 10).map(([cat, count]) => (
                <tr key={cat}>
                  <td>{cat}</td>
                  <td style={{ textAlign: 'right' }}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h3>許可月別</h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>年月</th>
                <th style={{ textAlign: 'right' }}>件数</th>
              </tr>
            </thead>
            <tbody>
              {monthStats.slice(0, 12).map(([month, count]) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td style={{ textAlign: 'right' }}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h3>町名別 (上位)</h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>町名</th>
                <th style={{ textAlign: 'right' }}>件数</th>
              </tr>
            </thead>
            <tbody>
              {townStats.map(([town, count]) => (
                <tr key={town}>
                  <td>{town}</td>
                  <td style={{ textAlign: 'right' }}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
            ※住所文字列からの簡易抽出です。
          </p>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
