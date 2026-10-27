import { useEffect, useRef, useState } from 'react';
import {
  getHistory,
  downloadHistoryReport,
  weekdayLabel,
  monthLabel,
  formatTransactionDateTime,
} from '../../controllers/historyController';
import { COLORS } from '../../constants/colors';
import CategoryIcon, { backgroundForKey } from '../components/CategoryIcon';
import {
  IconAlert,
  IconDownload,
  IconReceipt,
  IconToday,
  IconCalendar,
  IconCalendarMonth,
  IconChevronRight,
  IconClose,
  IconQr,
  IconCash,
} from '../components/Icons';

const monthsBack = (count) => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => new Date(now.getFullYear(), now.getMonth() - i, 1));
};

export default function History() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const [period, setPeriod] = useState('today');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState('');

  const dateInputRef = useRef(null);

  const load = async (nextPeriod, nextDate, nextMonth) => {
    console.log('########################################');
    console.log('[History] LOAD START', nextPeriod, nextDate, nextMonth);

    setLoading(true);
    setError('');

    try {
      const result = await getHistory({ period: nextPeriod, date: nextDate, month: nextMonth });
      console.log('[History] loaded:', result);
      setData(result);
    } catch (err) {
      console.error('[History] LOAD ERROR:', err);
      setError(err.message || 'Unable to load history.');
    } finally {
      setLoading(false);
      console.log('[History] LOAD END');
      console.log('########################################');
    }
  };

  useEffect(() => {
    load('today', null, null);
  }, []);

  const handleToday = () => {
    setPeriod('today');
    setSelectedDate(null);
    setSelectedMonth(null);
    load('today', null, null);
  };

  const handleDateClick = () => {
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.click();
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (!value) return;

    const date = new Date(`${value}T00:00:00`);
    setPeriod('date');
    setSelectedDate(date);
    setSelectedMonth(null);
    load('date', date, null);
  };

  const handleMonthClick = () => {
    setMonthPickerOpen(true);
  };

  const handleMonthPick = (month) => {
    setMonthPickerOpen(false);
    setPeriod('month');
    setSelectedMonth(month);
    setSelectedDate(null);
    load('month', null, month);
  };

  const handleDownload = async () => {
    if (downloading) return;

    setDownloading(true);
    setToast('');

    try {
      await downloadHistoryReport({ period, date: selectedDate, month: selectedMonth });
      setToast('Report downloaded successfully');
    } catch (err) {
      console.error('[History] DOWNLOAD ERROR:', err);
      setToast(err.message || 'Failed to download report');
    } finally {
      setDownloading(false);
      setTimeout(() => setToast(''), 3000);
    }
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
          <button className="btn btn-primary" onClick={() => load(period, selectedDate, selectedMonth)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxTotal = data.dailyTotals.reduce((max, item) => Math.max(max, item.total), 0) || 1;
  const today = new Date();

  return (
    <div className="history-page">
      {toast && <div className="toast-banner">{toast}</div>}

      {/* ---------- COLLECTION CARD ---------- */}
      <div className="sales-card">
        <div className="sales-card-head">
          <span className="sales-card-label">Collection</span>
          <div className="sales-month-pill">{data.filterLabel}</div>
        </div>

        <div className="sales-total">₹{data.totalCollection.toFixed(2)}</div>
        <div className="collection-bills-count">{data.billCount} bills</div>

        <button className="download-btn" onClick={handleDownload} disabled={downloading}>
          {downloading ? (
            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          ) : (
            <IconDownload size={16} color="#fff" />
          )}
          {downloading ? 'Downloading...' : 'Download Report'}
        </button>
      </div>

      {/* ---------- COLLECTION INSIGHTS ---------- */}
      <div className="section-header">
        <span>Collection Insights</span>
      </div>

      {data.dailyTotals.length > 0 && (
        <div className="insights-card">
          <div className="insights-chart">
            {data.dailyTotals.map((item, i) => {
              const isToday =
                item.date.getFullYear() === today.getFullYear() &&
                item.date.getMonth() === today.getMonth() &&
                item.date.getDate() === today.getDate();

              const barHeight = Math.max(6, (item.total / maxTotal) * 70);

              return (
                <div className="insight-bar-col" key={i}>
                  <div className="insight-value">
                    {item.total > 0 ? `₹${item.total.toFixed(0)}` : ''}
                  </div>
                  <div
                    className={`insight-bar${isToday ? ' active' : ''}`}
                    style={{ height: barHeight }}
                  />
                  <div className={`insight-day${isToday ? ' active' : ''}`}>
                    {weekdayLabel(item.date)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------- FILTERS ---------- */}
      <div className="filter-row">
        <button
          className={`filter-chip${period === 'today' ? ' active' : ''}`}
          onClick={handleToday}
        >
          <IconToday size={18} />
          Today
        </button>

        <button
          className={`filter-chip${period === 'date' ? ' active' : ''}`}
          onClick={handleDateClick}
        >
          <IconCalendar size={18} />
          Date
        </button>
        <input
          ref={dateInputRef}
          type="date"
          className="hidden-date-input"
          max={new Date().toISOString().slice(0, 10)}
          onChange={handleDateChange}
        />

        <button
          className={`filter-chip${period === 'month' ? ' active' : ''}`}
          onClick={handleMonthClick}
        >
          <IconCalendarMonth size={18} />
          Month
        </button>
      </div>

      {/* ---------- MONTH PICKER MODAL ---------- */}
      {monthPickerOpen && (
        <div className="modal-overlay" onClick={() => setMonthPickerOpen(false)}>
          <div className="month-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="month-sheet-head">
              <span>Select Month</span>
              <button className="icon-btn" onClick={() => setMonthPickerOpen(false)}>
                <IconClose size={18} />
              </button>
            </div>
            <div className="month-sheet-list">
              {monthsBack(12).map((m, i) => (
                <button className="month-row" key={i} onClick={() => handleMonthPick(m)}>
                  <div className="month-row-icon">
                    <IconCalendarMonth size={18} color={COLORS.primary} />
                  </div>
                  <span className="month-row-label">{monthLabel(m)}</span>
                  <IconChevronRight size={16} color={COLORS.textSecondary} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- TRANSACTIONS ---------- */}
      <div className="section-header">
        <span>{data.filterLabel} Transactions</span>
        <span className="bills-count-label">{data.items.length} bills</span>
      </div>

      {data.items.length === 0 ? (
        <div className="empty-state">
          <IconReceipt color={COLORS.textSecondary} />
          <p>No collections found</p>
        </div>
      ) : (
        <div className="tile-list">
          {data.items.map((item) => {
            const hasDiscount = item.price > item.salePrice;
            const isUpi = item.paymentMode.toUpperCase() === 'UPI';

            return (
              <div className="activity-tile" key={item.id}>
                <CategoryIcon background={backgroundForKey(item.iconBackgroundKey)} />
                <div className="activity-body">
                  <div className="activity-top">
                    <span className="activity-title">{item.itemName}</span>
                    <span className="activity-amount">₹{item.total.toFixed(2)}</span>
                  </div>
                  <div className="activity-datetime">
                    {formatTransactionDateTime(item.dateTime)}
                  </div>

                  <div className="activity-pills">
                    <span className="pill">Bill #{item.billId}</span>
                    <span className="pill">Qty {item.quantity}</span>
                    <span className={`payment-badge ${isUpi ? 'upi' : 'cash'}`}>
                      {isUpi ? <IconQr /> : <IconCash />}
                      {item.paymentMode.toUpperCase()}
                    </span>
                  </div>

                  {hasDiscount && (
                    <div className="activity-discount">
                      <span className="mrp">MRP ₹{item.price.toFixed(0)}</span>
                      <span className="sale">Sale ₹{item.salePrice.toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}