import { useEffect, useRef, useState } from 'react';
import { getCollection, formatBillTime } from '../../controllers/collectionController';
import { COLORS } from '../../constants/colors';
import CategoryIcon, { backgroundForKey } from '../components/CategoryIcon';
import {
  IconAlert,
  IconCalendar,
  IconShare,
  IconQr,
  IconCash,
  IconTrendingUp,
  IconReceipt,
} from '../components/Icons';

export default function Collection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const [period, setPeriod] = useState('today');
  const [selectedDate, setSelectedDate] = useState(null);

  const dateInputRef = useRef(null);

  const load = async (nextPeriod, nextDate) => {
    console.log('########################################');
    console.log('[Collection] LOAD START', nextPeriod, nextDate);

    setLoading(true);
    setError('');

    try {
      const result = await getCollection({ period: nextPeriod, date: nextDate });
      console.log('[Collection] loaded:', result);
      setData(result);
    } catch (err) {
      console.error('[Collection] LOAD ERROR:', err);
      setError(err.message || 'Unable to load collection.');
    } finally {
      setLoading(false);
      console.log('[Collection] LOAD END');
      console.log('########################################');
    }
  };

  useEffect(() => {
    load('today', null);
  }, []);

  const handlePickDateClick = () => {
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.click();
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (!value) return;

    const date = new Date(`${value}T00:00:00`);
    setPeriod('date');
    setSelectedDate(date);
    load('date', date);
  };

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
          <button className="btn btn-primary" onClick={() => load(period, selectedDate)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const paymentTotal = data.upiTotal + data.cashTotal;
  const upiPercent = paymentTotal === 0 ? 0 : Math.round((data.upiTotal / paymentTotal) * 100);
  const cashPercent = paymentTotal === 0 ? 0 : Math.round((data.cashTotal / paymentTotal) * 100);

  return (
    <div className="collection-page">
      {/* ---------- SUMMARY CARD ---------- */}
      <div className="sales-card">
        <div className="sales-card-head">
          <span className="sales-card-label">Total Collection</span>
          <button className="sales-month-pill clickable" onClick={handlePickDateClick}>
            {data.filterLabel}
            <IconCalendar size={13} color="#fff" />
          </button>
          <input
            ref={dateInputRef}
            type="date"
            className="hidden-date-input"
            max={new Date().toISOString().slice(0, 10)}
            onChange={handleDateChange}
          />
        </div>

        <div className="sales-total">₹{data.totalCollection.toFixed(2)}</div>

        <div className="sales-stats">
          <div className="stat-chip">
            <div className="stat-chip-label">
              <IconQr color="#fff" /> UPI
            </div>
            <div className="stat-chip-value">₹{data.upiTotal.toFixed(0)}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">
              <IconCash color="#fff" /> Cash
            </div>
            <div className="stat-chip-value">₹{data.cashTotal.toFixed(0)}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-chip-label">
              <IconTrendingUp color="#fff" /> Profit
            </div>
            <div className="stat-chip-value">₹{data.totalProfit.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* ---------- ACTION BUTTONS ---------- */}
      <div className="action-row">
        <button className="action-btn" onClick={handlePickDateClick}>
          <IconCalendar size={16} color="#fff" />
          Choose Date
        </button>
        <button className="action-btn">
          <IconShare size={16} color="#fff" />
          Export Report
        </button>
      </div>

      {/* ---------- CATEGORY COLLECTION ---------- */}
      <div className="section-header">
        <span>Category Collection</span>
      </div>

      {data.categories.length === 0 ? (
        <div className="empty-state">
          <IconReceipt color={COLORS.textSecondary} />
          <p>No sales for this date</p>
        </div>
      ) : (
        <div className="tile-list">
          {data.categories.map((c) => {
            const ratio =
              data.totalCollection === 0
                ? 0
                : Math.min(c.saleAmount / data.totalCollection, 1) * 100;

            return (
              <div className="category-card" key={c.categoryId}>
                <div className="category-card-head">
                  <CategoryIcon background={backgroundForKey(c.iconBackgroundKey)} size={36} />
                  <span className="category-card-name">{c.name} • {c.unitsSold} pcs</span>
                  <span className="category-card-amount">₹{c.saleAmount.toFixed(0)}</span>
                </div>
                <div className="budget-track">
                  <div className="budget-fill" style={{ width: `${ratio}%`, background: COLORS.primary }} />
                </div>
                <div className="category-profit">Profit: ₹{c.profit.toFixed(0)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- PAYMENT BREAKDOWN ---------- */}
      <div className="section-header">
        <span>Payment Breakdown</span>
      </div>

      <div className="payment-card">
        <div className="payment-row">
          <div className="payment-row-icon" style={{ background: `${COLORS.upiColor}1F` }}>
            <IconQr size={18} color={COLORS.upiColor} />
          </div>
          <span className="payment-row-label">UPI Collection</span>
          <span className="payment-row-amount">₹{data.upiTotal.toFixed(0)}</span>
          <span className="payment-row-percent" style={{ background: `${COLORS.upiColor}1F`, color: COLORS.upiColor }}>
            {upiPercent}%
          </span>
        </div>

        <div className="payment-divider" />

        <div className="payment-row">
          <div className="payment-row-icon" style={{ background: `${COLORS.cashColor}1F` }}>
            <IconCash size={18} color={COLORS.cashColor} />
          </div>
          <span className="payment-row-label">Cash Collection</span>
          <span className="payment-row-amount">₹{data.cashTotal.toFixed(0)}</span>
          <span className="payment-row-percent" style={{ background: `${COLORS.cashColor}1F`, color: COLORS.cashColor }}>
            {cashPercent}%
          </span>
        </div>
      </div>

      {/* ---------- BILLS ---------- */}
      <div className="section-header">
        <span>{data.filterLabel} Bills</span>
        <span className="bills-count-label">{data.bills.length} bills</span>
      </div>

      {data.bills.length === 0 ? (
        <div className="empty-state">
          <IconReceipt color={COLORS.textSecondary} />
          <p>No bills for this date</p>
        </div>
      ) : (
        <div className="tile-list">
          {data.bills.map((bill) => {
            const isUpi = bill.paymentMode.toUpperCase() === 'UPI';
            const color = isUpi ? COLORS.upiColor : COLORS.cashColor;

            return (
              <div className="collection-bill-tile" key={bill.id}>
                <CategoryIcon background={backgroundForKey(bill.iconBackgroundKey)} />
                <div className="collection-bill-body">
                  <div className="collection-bill-name">{bill.itemName}</div>
                  <div className="collection-bill-meta">
                    Bill #{bill.billId} • {formatBillTime(bill.dateTime)} • Qty {bill.quantity}
                  </div>
                </div>
                <div className="collection-bill-right">
                  <div className="collection-bill-amount">₹{bill.total.toFixed(2)}</div>
                  <span className="collection-bill-badge" style={{ background: `${color}1F`, color }}>
                    {bill.paymentMode}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}