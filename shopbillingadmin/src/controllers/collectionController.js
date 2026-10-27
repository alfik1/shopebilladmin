// src/controllers/collectionController.js

import { API_ENDPOINTS } from '../constants/apiConstants';
import { authFetch } from '../services/apiService';
import { collectionResponseFromApi, paymentAmountFor } from '../models/collectionModel';

export class CollectionError extends Error {}

// ------------------------------------------------------------
// Date helpers
// ------------------------------------------------------------

const pad2 = (n) => String(n).padStart(2, '0');

export const formatDateForApi = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const formatMonthForApi = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDisplayDate = (date) =>
  `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

export const formatBillTime = (date) => {
  let hour = date.getHours() % 12;
  hour = hour === 0 ? 12 : hour;
  const period = date.getHours() >= 12 ? 'PM' : 'AM';
  const minute = pad2(date.getMinutes());
  return `${hour}:${minute} ${period}`;
};

// ------------------------------------------------------------
// Category -> icon background key (reuses Home's palette)
// ------------------------------------------------------------
const iconBackgroundKeyForCategory = (name) => {
  const value = String(name || '').toLowerCase();

  if (value.includes('shirt')) return 'shirtsBg';
  if (value.includes('inner')) return 'innerwearBg';
  if (value.includes('pant')) return 'pantsBg';
  return 'defaultBg';
};

// ------------------------------------------------------------
// Payment method display label
// ------------------------------------------------------------
const formatPaymentMethod = (method) => {
  const value = String(method || '').toLowerCase();

  switch (value) {
    case 'upi': return 'UPI';
    case 'cash': return 'Cash';
    case 'card': return 'Card';
    case 'mixed': return 'Mixed';
    default:
      if (!method) return 'Unknown';
      return method[0].toUpperCase() + method.slice(1);
  }
};

// ------------------------------------------------------------
// Map categories / bills
// ------------------------------------------------------------
const mapCategories = (categories) =>
  categories.map((item) => ({
    categoryId: item.categoryId,
    name: item.category || 'Unknown',
    unitsSold: item.qty,
    saleAmount: item.amount,
    profit: item.grossProfit,
    percentOfCollection: item.percentOfCollection,
    iconBackgroundKey: iconBackgroundKeyForCategory(item.category),
  }));

const mapBills = (bills) =>
  bills.map((item) => ({
    id: item.id,
    itemName: item.category || 'Unknown',
    billId: item.billNo || '-',
    dateTime: item.paidAt || new Date(),
    quantity: item.itemCount <= 0 ? 1 : item.itemCount,
    paymentMode: formatPaymentMethod(item.paymentMethod),
    total: item.total,
    cost: item.cost,
    profit: item.grossProfit,
    iconBackgroundKey: iconBackgroundKeyForCategory(item.category),
  }));

// ------------------------------------------------------------
// GET COLLECTION
// GET /api/mobile/collection/?period=today|date|month[&date=][&month=]
// ------------------------------------------------------------
export const getCollection = async ({ period, date, month } = { period: 'today' }) => {
  const params = new URLSearchParams({ period });

  if (period === 'date' && date) {
    params.append('date', formatDateForApi(date));
  }

  if (period === 'month' && month) {
    params.append('month', formatMonthForApi(month));
  }

  const url = `${API_ENDPOINTS.COLLECTION.LIST}?${params.toString()}`;

  console.log('========================================');
  console.log('[CollectionController] GET COLLECTION');
  console.log('[CollectionController] URL:', url);
  console.log('========================================');

  try {
    const response = await authFetch(url, { method: 'GET' });

    console.log('[CollectionController] Status:', response.status);

    const text = await response.text();

    console.log('[CollectionController] Body:', text);

    if (!response.ok) {
      throw new CollectionError(`Failed to load collection (${response.status})`);
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error('[CollectionController] JSON decode error:', e);
      throw new CollectionError('Invalid collection response.');
    }

    const raw = collectionResponseFromApi(json);

    let filterLabel = 'Today';
    if (period === 'date' && date) filterLabel = formatDisplayDate(date);
    if (period === 'month' && month) {
      const MONTHS_FULL = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      filterLabel = `${MONTHS_FULL[month.getMonth()]} ${month.getFullYear()}`;
    }

    const upiTotal = paymentAmountFor(raw.paymentBreakdown, 'upi');
    const cashTotal = paymentAmountFor(raw.paymentBreakdown, 'cash');
    const cardTotal = paymentAmountFor(raw.paymentBreakdown, 'card');
    const mixedTotal = paymentAmountFor(raw.paymentBreakdown, 'mixed');

    return {
      filterLabel,
      totalCollection: raw.totalCollection,
      upiTotal,
      cashTotal,
      cardTotal,
      mixedTotal,
      totalProfit: raw.grossProfit,
      billCount: raw.billCount,
      categories: mapCategories(raw.categoryCollection),
      bills: mapBills(raw.bills),
      period,
    };
  } catch (error) {
    console.error('[CollectionController] ERROR:', error);

    if (error instanceof CollectionError) {
      throw error;
    }

    throw new CollectionError('Unable to load collection.');
  }
};