import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TopPage from './pages/TopPage';
import ListPage from './pages/ListPage';
import DetailPage from './pages/DetailPage';
import DashboardPage from './pages/DashboardPage';
import DiffPage from './pages/DiffPage';
import FavoritesPage from './pages/FavoritesPage';
import AboutPage from './pages/AboutPage';

const App: React.FC = () => {
  return (
    <div className="app">
      <header>
        <div className="container">
          <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>
              <Link to="/">富山市食品営業許可申請ビューア</Link>
            </h1>
            <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '1rem' }}>
              <li>
                <Link to="/list">探す</Link>
              </li>
              <li>
                <Link to="/dashboard">統計</Link>
              </li>
              <li>
                <Link to="/diff">差分</Link>
              </li>
              <li>
                <Link to="/favorites">★</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '2rem' }}>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/facilities/:id" element={<DetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/diff" element={<DiffPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      <footer>
        <div className="container">
          <p>
            「本サイトでは、新たに営業許可を受けた施設を紹介しています。許可年月日は実際の開店日とは異なる場合があります。」
          </p>
          <p>
            データ出典：
            <a
              href="https://opdt.city.toyama.lg.jp/dataset/seikatsu-eisei01"
              target="_blank"
              rel="noopener noreferrer"
            >
              富山市 オープンデータ（食品営業許可施設）
            </a>
          </p>
          <p>
            &copy; 2026{' '}
            <a href="https://www.evolinq.link" target="_blank" rel="noopener noreferrer">
              株式会社EvoLiNQ
            </a>{' '}
            / Code for Toyama / <Link to="/about">データについて</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
