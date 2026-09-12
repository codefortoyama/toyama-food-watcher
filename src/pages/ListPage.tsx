import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCurrentData, fetchDiffData } from '../services/dataService';
import { Facility } from '../types/facility';
import { filterFacilities, sortFacilities, SortOrder } from '../utils/filter';
import { getLatestPermitDate } from '../utils/date';

const ListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Facility[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filter states from URL
  const keyword = searchParams.get('keyword') || '';
  const businessType = searchParams.get('category') || '';
  const period = searchParams.get('period') || 'all';
  const sort = (searchParams.get('sort') as SortOrder) || 'date_desc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [currentData, diffData] = await Promise.all([
          fetchCurrentData().catch(() =>
            fetch(`${import.meta.env.BASE_URL}fixtures/sample-current.json`).then((r) => r.json()),
          ),
          fetchDiffData().catch(() => ({ added: [] })),
        ]);
        setData(currentData);
        setAddedIds(new Set(diffData.added.map((f: any) => f.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const baseDate = useMemo(() => getLatestPermitDate(data.map((f) => f.permitDate)), [data]);

  const filteredData = useMemo(() => {
    return filterFacilities(data, {
      keyword,
      businessType,
      subCategory: '',
      period: period === 'all' ? 'all' : Number(period),
      address: '',
      recentOnly: false,
      addedOnly: searchParams.get('new') === 'true',
      baseDate,
      addedIds,
    });
  }, [data, keyword, businessType, period, searchParams, baseDate, addedIds]);

  const sortedData = useMemo(() => {
    return sortFacilities(filteredData, sort);
  }, [filteredData, sort]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const pagedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedData, page]);

  const categories = useMemo(() => {
    const set = new Set(data.map((f) => f.businessType));
    return Array.from(set).sort();
  }, [data]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="list-page">
      <h2>施設を探す</h2>

      <section className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem' }}>キーワード検索</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => updateParam('keyword', e.target.value)}
              placeholder="施設名、住所、業種など"
              style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem' }}>業種</label>
            <select value={businessType} onChange={(e) => updateParam('category', e.target.value)}>
              <option value="">すべて</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem' }}>期間</label>
            <select value={period} onChange={(e) => updateParam('period', e.target.value)}>
              <option value="all">すべて</option>
              <option value="30">30日以内</option>
              <option value="90">90日以内</option>
              <option value="180">180日以内</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem' }}>並び順</label>
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
              <option value="date_desc">許可日が新しい順</option>
              <option value="date_asc">許可日が古い順</option>
              <option value="name_asc">施設名順</option>
              <option value="type_asc">業種順</option>
            </select>
          </div>
          <button onClick={resetFilters}>リセット</button>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={searchParams.get('new') === 'true'}
              onChange={(e) => updateParam('new', e.target.checked ? 'true' : '')}
            />
            前回データからの追加分のみ
          </label>
        </div>
      </section>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '1rem 0',
        }}
      >
        <p style={{ margin: 0 }} aria-live="polite">
          該当件数: <strong>{sortedData.length}</strong> 件
          {totalPages > 1 && ` (ページ ${page} / ${totalPages})`}
        </p>

        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))}>
              前へ
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => updateParam('page', String(page + 1))}
            >
              次へ
            </button>
          </div>
        )}
      </div>

      {pagedData.length === 0 ? (
        <div className="card">
          <p>条件に一致する施設が見つかりませんでした。条件を変更して再度検索してください。</p>
        </div>
      ) : (
        <>
          <div className="grid">
            {pagedData.map((f) => (
              <div key={f.id} className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span className="badge badge-primary">{f.businessType}</span>
                  {addedIds.has(f.id) && <span className="badge badge-new">NEW</span>}
                </div>
                <h3 style={{ margin: '0.5rem 0' }}>{f.facilityName}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: '0.25rem 0' }}>
                  {f.address} {f.buildingName}
                </p>
                <p style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>
                  許可日: {f.permitDate || '不明'}
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <Link to={`/facilities/${f.id}`}>詳細を見る</Link>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '2rem',
                alignItems: 'center',
              }}
            >
              <button disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))}>
                前のページ
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => updateParam('page', String(page + 1))}
              >
                次のページ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListPage;
