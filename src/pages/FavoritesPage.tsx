import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCurrentData } from '../services/dataService';
import { Facility } from '../types/facility';
import { getFavorites } from '../utils/favorites';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchCurrentData().catch(() =>
          fetch(`${import.meta.env.BASE_URL}fixtures/sample-current.json`).then((r) => r.json()),
        );
        const favoriteIds = getFavorites();
        const filtered = data.filter((f: Facility) => favoriteIds.includes(f.id));
        setFavorites(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="favorites-page">
      <h2>お気に入り施設</h2>

      {favorites.length === 0 ? (
        <div className="card">
          <p>お気に入りに登録された施設はありません。</p>
          <Link to="/list">施設を探す</Link>
        </div>
      ) : (
        <div className="grid">
          {favorites.map((f) => (
            <div key={f.id} className="card">
              <span className="badge badge-primary">{f.businessType}</span>
              <h3 style={{ margin: '0.5rem 0' }}>{f.facilityName}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: '0.25rem 0' }}>
                {f.address} {f.buildingName}
              </p>
              <Link to={`/facilities/${f.id}`}>詳細を見る</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
