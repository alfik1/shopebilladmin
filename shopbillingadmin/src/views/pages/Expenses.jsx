import { useEffect, useState } from 'react';
import {
  getExpenseOverview,
  currentMonthString,
  todayString,
  formatExpenseDate,
} from '../../controllers/expenseController';
import { COLORS } from '../../constants/colors';
import { IconAlert, IconReceipt } from '../components/Icons';

const money = (n) => `₹${Number(n || 0).toFixed(0)}`;

export default function Expenses() {
  const [period, setPeriod] = useState('month');
  const [month, setMonth] = useState(currentMonthString());
  const [date, setDate] = useState(todayString());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const load = async () => {
    console.log('[Expenses] LOAD', { period, month, date });

    setLoading(true);
    setError('');

    try {
      const result = await getExpenseOverview({ period, month, date });
      setData(result);
    } catch (err) {
      console.error('[Expenses] LOAD ERROR:', err);
      setError(err.message || 'Unable to load expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period === 'month' && !month) return;
    if (period === 'date' && !date) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, month, date]);

  const periodLabel = period === 'month' ? month : formatExpenseDate(date);

  return (
    <div className="expenses-page">
      {/* ---------- FILTER BAR ---------- */}
      <div className="exp-toolbar">
        <div className="exp-tabs">
          <button
            className={`exp-tab${period === 'month' ? ' active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
          <button
            className={`exp-tab${period === 'date' ? ' active' : ''}`}
            onClick={() => setPeriod('date')}
          >
            Date
          </button>
        </div>

        {period === 'month' ? (
          <input
            type="month"
            className="exp-picker"
            value={month}
            max={currentMonthString()}
            onChange={(e) => setMonth(e.target.value)}
          />
        ) : (
          <input
            type="date"
            className="exp-picker"
            value={date}
            max={todayString()}
            onChange={(e) => setDate(e.target.value)}
          />
        )}
      </div>

      {loading ? (
        <div className="home-center">
          <div className="loading-spinner" />
        </div>
      ) : error ? (
        <div className="home-center">
          <div className="home-error">
            <IconAlert color={COLORS.error} />
            <p>{error}</p>
            <button className="btn btn-primary" onClick={load}>Retry</button>
          </div>
        </div>
      ) : data ? (
        <>
          {/* ---------- SUMMARY CARDS ---------- */}
          <div className="exp-summary-grid">
            <div className="exp-stat purple">
              <div className="exp-stat-label">Total Expense</div>
              <div className="exp-stat-value">{money(data.total)}</div>
              <div className="exp-stat-sub">{periodLabel}</div>
            </div>

            <div className="exp-stat blue">
              <div className="exp-stat-label">Entries</div>
              <div className="exp-stat-value">{data.count}</div>
              <div className="exp-stat-sub">Expenses added</div>
            </div>

            <div className="exp-stat green">
              <div className="exp-stat-label">Average</div>
              <div className="exp-stat-value">{money(data.average)}</div>
              <div className="exp-stat-sub">Per expense</div>
            </div>

            <div className="exp-stat lime">
              <div className="exp-stat-label">Top Category</div>
              <div className="exp-stat-value small">
                {data.topCategory ? data.topCategory.name : '-'}
              </div>
              <div className="exp-stat-sub">
                {data.topCategory ? money(data.topCategory.amount) : 'No data'}
              </div>
            </div>
          </div>

          {/* ---------- BY CATEGORY ---------- */}
          <div className="section-header">
            <span>By Category</span>
          </div>

          {data.byCategory.length === 0 ? (
            <div className="empty-state">
              <IconReceipt color={COLORS.textSecondary} />
              <p>No expenses for this period</p>
            </div>
          ) : (
            <div className="exp-cat-grid">
              {data.byCategory.map((c) => (
                <div className="exp-cat-card" key={c.name}>
                  <div className="exp-cat-name">{c.name}</div>
                  <div className="exp-cat-amount">{money(c.amount)}</div>
                  <div className="exp-cat-count">
                    {c.count} {c.count === 1 ? 'entry' : 'entries'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------- EXPENSE LIST ---------- */}
          <div className="section-header" style={{ marginTop: 8 }}>
            <span>Expenses</span>
            <span className="bills-count-label">{data.rows.length} records</span>
          </div>

          {data.rows.length === 0 ? (
            <div className="empty-state">
              <IconReceipt color={COLORS.textSecondary} />
              <p>No expenses found</p>
            </div>
          ) : (
            <div className="exp-table-card">
              <div className="exp-table-scroll">
                <table className="exp-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Note</th>
                      <th className="right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => (
                      <tr key={r.id}>
                        <td>{formatExpenseDate(r.date)}</td>
                        <td>
                          <span className="exp-chip">{r.categoryName}</span>
                        </td>
                        <td className="note">{r.note || '-'}</td>
                        <td className="right amount">{money(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}