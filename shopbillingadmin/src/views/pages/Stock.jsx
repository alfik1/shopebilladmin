import { useEffect, useState } from 'react';
import { getStock } from '../../controllers/stockController';
import { COLORS } from '../../constants/colors';
import CategoryIcon, { backgroundForKey } from '../components/CategoryIcon';
import { IconAlert, IconStock, IconTrendingUp } from '../components/Icons';

const COLOR_BY_KEY = {
  error: COLORS.error,
  warning: COLORS.budgetOrange,
  success: COLORS.success,
};

export default function Stock() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const loadStock = async (showLoading) => {
    console.log('########################################');
    console.log('[Stock] LOAD START');

    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError('');

    try {
      const result = await getStock();
      console.log('[Stock] loaded:', result);
      setData(result);
    } catch (err) {
      console.error('[Stock] LOAD ERROR:', err);
      setError(err.message || 'Unable to load stock.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('[Stock] LOAD END');
      console.log('########################################');
    }
  };

  useEffect(() => {
    loadStock(true);
  }, []);

  if (loading) {
    return (
      <div className="home-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-center">
        <div className="home-error">
          <IconAlert color={COLORS.error} />
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => loadStock(true)}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="stock-page">
      {/* ---------- SUMMARY CARDS ---------- */}
      <div className="stock-summary-grid">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: `${COLORS.primary}1F` }}>
            <IconStock size={18} color={COLORS.primary} />
          </div>
          <div className="summary-value">{data.totalRemaining}</div>
          <div className="summary-label">Total Stock Left</div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: `${COLORS.success}1F` }}>
            <IconTrendingUp size={18} color={COLORS.success} />
          </div>
          <div className="summary-value">{data.totalSoldToday}</div>
          <div className="summary-label">Sold Today</div>
        </div>
      </div>

      {/* ---------- STOCK LEVELS ---------- */}
      <div className="section-header">
        <span>Stock Levels</span>
        <button
          className="refresh-btn"
          onClick={() => loadStock(false)}
          disabled={refreshing}
          aria-label="Refresh"
        >
          {refreshing ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : '↻'}
        </button>
      </div>

      {data.items.length === 0 ? (
        <div className="empty-state">
          <p>No stock available</p>
        </div>
      ) : (
        <div className="tile-list">
          {data.items.map((item) => {
            const color = COLOR_BY_KEY[item.colorKey] || COLORS.success;
            const progressPercent = item.ratio * 100;

            return (
              <div className="stock-card" key={item.categoryId}>
                <div className="stock-card-head">
                  <CategoryIcon background={backgroundForKey(item.iconBackgroundKey)} size={36} />
                  <span className="stock-card-name">{item.name}</span>
                  <span className="stock-card-count" style={{ color }}>
                    {item.remaining} / {item.total}
                  </span>
                </div>

                <div className="budget-track">
                  <div
                    className="budget-fill"
                    style={{ width: `${progressPercent}%`, background: color }}
                  />
                </div>

                <div className="stock-sold-today">Sold today: {item.soldToday}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}