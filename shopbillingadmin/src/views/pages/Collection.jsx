import { useEffect, useState } from 'react';
import {
  getCollectionOverview,
  formatBillTime,
  formatDateForApi,
} from '../../controllers/collectionController';
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

// ------------------------------------------------------------
// Invisible date input laid over a button.
// The tap goes straight to the native date picker, which is what
// makes it work on phones. showPicker() is for desktop browsers.
// ------------------------------------------------------------
const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  margin: 0,
  padding: 0,
  border: 'none',
  opacity: 0,
  cursor: 'pointer',
  zIndex: 2,
};

const groupTitleStyle = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 8,
  padding: '4px 0 10px',
};

// ------------------------------------------------------------
// UPI + Cash rows for one group (day or month)
// ------------------------------------------------------------
function PaymentRows({ upi, cash }) {
  const total = upi + cash;
  const upiPercent = total === 0 ? 0 : Math.round((upi / total) * 100);
  const cashPercent = total === 0 ? 0 : Math.round((cash / total) * 100);

  return (
    <>
      <div className="payment-row">
        <div className="payment-row-icon" style={{ background: `${COLORS.upiColor}1F` }}>
          <IconQr size={18} color={COLORS.upiColor} />
        </div>
        <span className="payment-row-label">UPI Collection</span>
        <span className="payment-row-amount">₹{upi.toFixed(0)}</span>
        <span
          className="payment-row-percent"
          style={{ background: `${COLORS.upiColor}1F`, color: COLORS.upiColor }}
        >
          {upiPercent}%
        </span>
      </div>

      <div className="payment-divider" />

      <div className="payment-row">
        <div className="payment-row-icon" style={{ background: `${COLORS.cashColor}1F` }}>
          <IconCash size={18} color={COLORS.cashColor} />
        </div>
        <span className="payment-row-label">Cash Collection</span>
        <span className="payment-row-amount">₹{cash.toFixed(0)}</span>
        <span
          className="payment-row-percent"
          style={{ background: `${COLORS.cashColor}1F`, color: COLORS.cashColor }}
        >
          {cashPercent}%
        </span>
      </div>
    </>
  );
}

export default function Collection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [data, setData] = useState(null);           // selected day (or today)
  const [monthData, setMonthData] = useState(null); // full month of that day

  // null = today
  const [selectedDate, setSelectedDate] = useState(null);

  const todayValue = formatDateForApi(new Date());
  const pickerValue = selectedDate ? formatDateForApi(selectedDate) : todayValue;

  const load = async (nextDate) => {
    console.log('########################################');
    console.log('[Collection] LOAD START', nextDate);

    setLoading(true);
    setError('');

    try {
      const result = await getCollectionOverview({ date: nextDate });
      console.log('[Collection] loaded:', result);
      setData(result.day);
      setMonthData(result.month);
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
    load(null);
  }, []);

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (!value) return;

    const date = new Date(`${value}T00:00:00`);
    setSelectedDate(date);
    load(date);
  };

  // Desktop browsers only open the calendar from the icon,
  // so open it on click as well (harmless on phones).
  const handleDateClick = (e) => {
    try {
      e.currentTarget.showPicker?.();
    } catch (err) {
      // picker already open or not allowed, nothing to do
    }
  };

  const renderDateInput = () => (
    <input
      type="date"
      aria-label="Choose date"
      value={pickerValue}
      max={todayValue}
      onChange={handleDateChange}
      onClick={handleDateClick}
      style={overlayStyle}
    />
  );

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
          <button className="btn btn-primary" onClick={() => load(selectedDate)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="collection-page">
      {/* ---------- SUMMARY CARD ---------- */}
      <div className="sales-card">
        <div className="sales-card-head">
          <span className="sales-card-label">Total Collection</span>

          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <button type="button" className="sales-month-pill clickable">
              {data.filterLabel}
              <IconCalendar size={13} color="#fff" />
            </button>
            {renderDateInput()}
          </span>
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

        {/* ---------- FULL MONTH TOTAL (inside the card) ---------- */}
        {monthData && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span className="sales-card-label">{monthData.filterLabel} Total</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                ₹{monthData.totalCollection.toFixed(2)}
              </span>
            </div>

            <div style={{ fontSize: 12, color: '#fff', opacity: 0.85, marginTop: 4 }}>
              {monthData.billCount} bills • Profit ₹{monthData.totalProfit.toFixed(0)}
            </div>
          </div>
        )}
      </div>

      {/* ---------- ACTION BUTTONS ---------- */}
      <div className="action-row">
        <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
          <button
            type="button"
            className="action-btn"
            style={{ flex: 1, width: '100%' }}
          >
            <IconCalendar size={16} color="#fff" />
            Choose Date
          </button>
          {renderDateInput()}
        </div>

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
        {/* selected day / today */}
        <div style={groupTitleStyle}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              color: COLORS.textSecondary,
            }}
          >
            {data.filterLabel}
          </span>
          <span style={{ fontSize: 15, fontWeight: 800 }}>
            ₹{data.totalCollection.toFixed(0)}
          </span>
        </div>

        <PaymentRows upi={data.upiTotal} cash={data.cashTotal} />

        {/* full month */}
        {monthData && (
          <>
            <div
              style={{
                height: 1,
                background: COLORS.textSecondary,
                opacity: 0.25,
                margin: '14px 0 10px',
              }}
            />

            <div style={groupTitleStyle}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                  color: COLORS.textSecondary,
                }}
              >
                {monthData.filterLabel} (Full Month)
              </span>
              <span style={{ fontSize: 15, fontWeight: 800 }}>
                ₹{monthData.totalCollection.toFixed(0)}
              </span>
            </div>

            <PaymentRows upi={monthData.upiTotal} cash={monthData.cashTotal} />
          </>
        )}
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