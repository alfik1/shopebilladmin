import { useEffect, useState } from 'react';
import { getHome, currentMonthName } from '../../controllers/homeController';
import { COLORS } from '../../constants/colors';
import SalesChart from '../components/SalesChart';
import CategoryIcon, { backgroundForKey } from '../components/CategoryIcon';
import {
  IconProfile,
  IconCalendar,
  IconFilter,
  IconAlert,
  IconArrowUp,
  IconArrowDown,
  IconTrendingUp,
  IconChevronDown,
  IconQr,
  IconCash,
} from '../components/Icons';

const COLOR_BY_KEY = {
  success: COLORS.success,
  budgetOrange: COLORS.budgetOrange,
  primary: COLORS.primary,
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const loadHome = async () => {
    console.log('########################################');
    console.log('[Home] LOAD HOME START');

    setLoading(true);
    setError('');

    try {
      const result = await getHome();
      console.log('[Home] loaded:', result);
      setData(result);
    } catch (err) {
      console.error('[Home] LOAD HOME ERROR:', err);
      setError(err.message || 'Could not load dashboard. Please try again.');
    } finally {
      setLoading(false);
      console.log('[Home] LOAD HOME END');
      console.log('########################################');
    }
  };

  useEffect(() => {
    loadHome();
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
          <button className="btn btn-primary" onClick={loadHome}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="home-page">
      {/* ---------- PROFILE HEADER ---------- */}
      <div className="profile-header">
        <div className="profile-avatar">
          <IconProfile color={COLORS.primary} />
        </div>
        <div className="profile-info">
          <div className="profile-welcome">Welcome back,</div>
          <div className="profile-name">Admin</div>
        </div>
      </div>

      {/* ---------- SALES CARD ---------- */}
      <div className="sales-card">
        <div className="sales-card-head">
          <span className="sales-card-label">Total Sales</span>
          <div className="sales-month-pill">
            {currentMonthName()}
            <IconChevronDown color="#fff" size={14} />
          </div>
        </div>

        <div className="sales-total">₹{data.totalSales.toFixed(2)}</div>

        <SalesChart points={data.chartPoints} height={90} />

        <div className="sales-stats">
          <div className="stat-chip">
            <div className="stat-chip-label">
              <IconArrowUp color={COLORS.incomeColor} /> Income
            </div>
            <div className="stat-chip-value">₹{data.income.toFixed(0)}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">
              <IconArrowDown color={COLORS.expenseColor} /> Expense
            </div>
            <div className="stat-chip-value">₹{data.expense.toFixed(0)}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">
              <IconTrendingUp color={COLORS.profitColor} /> Profit
            </div>
            <div className="stat-chip-value">₹{data.profit.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* ---------- TRANSACTIONS ---------- */}
      {data.transactions.length > 0 && (
        <>
          <div className="section-header">
            <span>Transactions</span>
            <IconCalendar color={COLORS.textSecondary} />
          </div>

          <div className="tile-list">
            {data.transactions.map((t, i) => (
              <div className="home-tile" key={i}>
                <CategoryIcon background={COLORS.iconBackground} />
                <div className="home-tile-body">
                  <div className="home-tile-title">{t.title}</div>
                  <div className="home-tile-sub">{t.date}</div>
                </div>
                <div
                  className="home-tile-amount"
                  style={{ color: t.isExpense ? COLORS.expenseColor : COLORS.incomeColor }}
                >
                  {t.isExpense ? '-' : '+'}₹{t.amount.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- MONTHLY BUDGETS ---------- */}
      {data.budgets.length > 0 && (
        <>
          <div className="section-header">
            <span>Monthly Budgets</span>
            <IconCalendar color={COLORS.textSecondary} />
          </div>

          <div className="tile-list">
            {data.budgets.map((b) => {
              const color = COLOR_BY_KEY[b.colorKey] || COLORS.primary;
              const progress = b.total <= 0 ? 0 : Math.min(b.spent / b.total, 1) * 100;

              return (
                <div className="budget-card" key={b.categoryId}>
                  <div
                    className="budget-icon"
                    style={{ background: `${color}1F` }}
                  >
                    <IconTrendingUp color={color} size={20} />
                  </div>
                  <div className="budget-body">
                    <div className="budget-top">
                      <span className="budget-title">{b.title}</span>
                      <span className="budget-percent" style={{ color }}>
                        {b.percentUsed.toFixed(0)}%
                      </span>
                    </div>
                    <div className="budget-track">
                      <div
                        className="budget-fill"
                        style={{ width: `${progress}%`, background: color }}
                      />
                    </div>
                    <div className="budget-sub">
                      ₹{b.spent.toFixed(0)} of ₹{b.total.toFixed(0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ---------- RECENT ACTIVITY ---------- */}
      {data.recentActivity.length > 0 && (
        <>
          <div className="section-header">
            <span>Recent Activity</span>
            <div className="section-filter-btn">
              <IconFilter color={COLORS.textSecondary} />
            </div>
          </div>

          <div className="tile-list">
            {data.recentActivity.map((a) => {
              const hasDiscount = a.price > a.salePrice;
              const isUpi = a.paymentMode.toUpperCase() === 'UPI';

              return (
                <div className="activity-tile" key={a.id}>
                  <CategoryIcon background={backgroundForKey(a.iconBackgroundKey)} />
                  <div className="activity-body">
                    <div className="activity-top">
                      <span className="activity-title">{a.itemName}</span>
                      <span className="activity-amount">₹{a.total.toFixed(2)}</span>
                    </div>
                    <div className="activity-datetime">{a.date}, {a.time}</div>

                    <div className="activity-pills">
                      <span className="pill">Bill #{a.billId}</span>
                      <span className="pill">Qty {a.quantity}</span>
                      <span className={`payment-badge ${isUpi ? 'upi' : 'cash'}`}>
                        {isUpi ? <IconQr /> : <IconCash />}
                        {a.paymentMode.toUpperCase()}
                      </span>
                    </div>

                    {hasDiscount && (
                      <div className="activity-discount">
                        <span className="mrp">MRP ₹{a.price.toFixed(0)}</span>
                        <span className="sale">Sale ₹{a.salePrice.toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}