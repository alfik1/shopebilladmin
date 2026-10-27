// src/controllers/historyController.js

import { API_ENDPOINTS } from '../constants/apiConstants';
import { authFetch } from '../services/apiService';
import { historyResponseFromApi } from '../models/historyModel';

export class HistoryError extends Error {}

// ------------------------------------------------------------
// Date helpers
// ------------------------------------------------------------

const pad2 = (n) => String(n).padStart(2, '0');

export const formatDateForApi = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const formatMonthForApi = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const formatDisplayDate = (date) =>
  `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;

export const formatDisplayMonth = (date) =>
  `${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;

export const monthLabel = (date) =>
  `${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;

export const weekdayLabel = (date) => {
  // JS getDay(): 0=Sun..6=Sat -> convert to Mon=0..Sun=6
  const jsDay = date.getDay();
  const index = jsDay === 0 ? 6 : jsDay - 1;
  return WEEKDAYS_SHORT[index];
};

export const formatTransactionDateTime = (date) => {
  if (!date) return '';
  let hour = date.getHours() % 12;
  hour = hour === 0 ? 12 : hour;
  const period = date.getHours() >= 12 ? 'PM' : 'AM';
  const minute = pad2(date.getMinutes());
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} • ${hour}:${minute} ${period}`;
};

// ------------------------------------------------------------
// Category -> icon background key (reuses Home's palette)
// ------------------------------------------------------------
export const iconBackgroundKeyForCategory = (name) => {
  const value = String(name || '').toLowerCase();

  if (value.includes('shirt')) return 'shirtsBg';
  if (value.includes('inner')) return 'innerwearBg';
  if (value.includes('pant')) return 'pantsBg';
  return 'defaultBg';
};

// ------------------------------------------------------------
// Payment mode display
// ------------------------------------------------------------
const formatPaymentMode = (value) => {
  if (!value) return '';
  const upper = value.toUpperCase();
  if (upper === 'UPI') return 'UPI';
  if (upper === 'CASH') return 'Cash';
  return value;
};

// ------------------------------------------------------------
// Map transactions -> bill items
// ------------------------------------------------------------
const mapTransactions = (transactions) =>
  transactions.map((t) => {
    const quantity = t.itemCount <= 0 ? 1 : t.itemCount;
    const salePrice = t.total / quantity;

    return {
      id: t.id,
      itemName: t.category || 'Unknown',
      billId: t.billNo || '-',
      dateTime: t.paidAt || new Date(),
      price: salePrice,
      salePrice,
      quantity,
      paymentMode: formatPaymentMode(t.paymentMethod),
      iconBackgroundKey: iconBackgroundKeyForCategory(t.category),
      total: salePrice * quantity,
    };
  });

// ------------------------------------------------------------
// GET HISTORY
// GET /api/mobile/history/?period=today|date|month[&date=][&month=]
// ------------------------------------------------------------
export const getHistory = async ({ period, date, month } = { period: 'today' }) => {
  const params = new URLSearchParams({ period });

  if (period === 'date' && date) {
    params.append('date', formatDateForApi(date));
  }

  if (period === 'month' && month) {
    params.append('month', formatMonthForApi(month));
  }

  const url = `${API_ENDPOINTS.HISTORY.LIST}?${params.toString()}`;

  console.log('========================================');
  console.log('[HistoryController] GET HISTORY');
  console.log('[HistoryController] URL:', url);
  console.log('========================================');

  try {
    const response = await authFetch(url, { method: 'GET' });

    console.log('[HistoryController] Status:', response.status);

    const text = await response.text();

    console.log('[HistoryController] Body:', text);

    if (!response.ok) {
      throw new HistoryError(`Failed to load history (${response.status})`);
    }

    if (!text) {
      throw new HistoryError('History API returned an empty response.');
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error('[HistoryController] JSON decode error:', e);
      throw new HistoryError('Invalid JSON response from history API.');
    }

    const raw = historyResponseFromApi(json);

    let filterLabel = 'Today';
    if (period === 'date' && date) filterLabel = formatDisplayDate(date);
    if (period === 'month' && month) filterLabel = formatDisplayMonth(month);

    return {
      period,
      filterLabel,
      totalCollection: raw.collection,
      billCount: raw.billCount,
      dailyTotals: raw.collectionInsights,
      items: mapTransactions(raw.transactions),
    };
  } catch (error) {
    console.error('[HistoryController] ERROR:', error);

    if (error instanceof HistoryError) {
      throw error;
    }

    throw new HistoryError('Unable to load history.');
  }
};

// ------------------------------------------------------------
// DOWNLOAD HISTORY REPORT (PDF)
// GET /api/mobile/history/report.pdf?period=...
// ------------------------------------------------------------
export const downloadHistoryReport = async ({ period, date, month }) => {
  const params = new URLSearchParams({ period });

  if (period === 'date' && date) {
    params.append('date', formatDateForApi(date));
  }

  if (period === 'month' && month) {
    params.append('month', formatMonthForApi(month));
  }

  const url = `${API_ENDPOINTS.HISTORY.REPORT}?${params.toString()}`;

  console.log('========================================');
  console.log('[HistoryController] DOWNLOAD REPORT');
  console.log('[HistoryController] URL:', url);
  console.log('========================================');

  try {
    const response = await authFetch(url, { method: 'GET' });

    console.log('[HistoryController] Status:', response.status);

    if (!response.ok) {
      throw new HistoryError(`Failed to download report (${response.status})`);
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new HistoryError('Downloaded PDF is empty.');
    }

    let fileName = 'shopbill-history.pdf';
    if (period === 'today') {
      fileName = `shopbill-today-${formatDateForApi(new Date())}.pdf`;
    } else if (period === 'date' && date) {
      fileName = `shopbill-date-${formatDateForApi(date)}.pdf`;
    } else if (period === 'month' && month) {
      fileName = `shopbill-month-${formatMonthForApi(month)}.pdf`;
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);

    console.log('[HistoryController] Report downloaded:', fileName);

    return fileName;
  } catch (error) {
    console.error('[HistoryController] DOWNLOAD ERROR:', error);

    if (error instanceof HistoryError) {
      throw error;
    }

    throw new HistoryError('Unable to download history report.');
  }
};