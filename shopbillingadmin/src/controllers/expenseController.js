// src/controllers/expenseController.js

import { API_ENDPOINTS } from '../constants/apiConstants';
import { authFetch } from '../services/apiService';
import {
  fromApiCategoryList,
  fromApiExpenseList,
  fromApiSummary,
} from '../models/expenseModel';

const MAX_PAGES = 100;

// ==========================================================
// REQUEST HELPER
// ==========================================================

const request = async (label, url) => {
  console.log('========================================');
  console.log(`[ExpenseController] ${label} ->`, url);

  const response = await authFetch(url, { method: 'GET' });

  console.log('[ExpenseController] Status:', response.status);

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
  }

  console.log('[ExpenseController] Response:', data);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      (data && typeof data === 'object' ? JSON.stringify(data) : data) ||
      `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
};

// ==========================================================
// FILTER -> QUERY
// period 'month' -> month=YYYY-MM
// period 'date'  -> date=YYYY-MM-DD
// ==========================================================

const buildQuery = ({ period, month, date }) => {
  const params = new URLSearchParams();

  if (period === 'date') {
    params.append('date', date);
  } else {
    params.append('month', month);
  }

  return params.toString();
};

// "next" is a full URL; keep only its query string so the request
// always goes through our own base URL.
const nextSearch = (nextUrl) => {
  try {
    return new URL(nextUrl, window.location.origin).search;
  } catch (e) {
    return '';
  }
};

// ==========================================================
// CATEGORIES (used only to resolve names when API sends ids)
// ==========================================================

export const getExpenseCategories = async () => {
  const data = await request('LIST CATEGORIES', API_ENDPOINTS.EXPENSES.CATEGORIES);
  return fromApiCategoryList(data);
};

// ==========================================================
// EXPENSES (all pages)
// ==========================================================

const getExpenseRows = async (filter) => {
  let url = `${API_ENDPOINTS.EXPENSES.LIST}?${buildQuery(filter)}`;

  const rows = [];
  const seen = new Set();
  let pages = 0;

  while (url && pages < MAX_PAGES) {
    pages += 1;

    const data = await request(`LIST EXPENSES (page ${pages})`, url);

    const batch = fromApiExpenseList(data);

    let added = 0;

    batch.forEach((row) => {
      const key = String(row.id);
      if (seen.has(key)) return;
      seen.add(key);
      rows.push(row);
      added += 1;
    });

    const next = data && typeof data === 'object' ? data.next : null;

    if (!next || added === 0) break;

    const search = nextSearch(next);

    url = search ? `${API_ENDPOINTS.EXPENSES.LIST}${search}` : null;
  }

  return rows;
};

const getExpenseSummary = async (filter) => {
  const data = await request(
    'SUMMARY',
    `${API_ENDPOINTS.EXPENSES.SUMMARY}?${buildQuery(filter)}`
  );

  return fromApiSummary(data);
};

// ==========================================================
// COMBINED LOAD FOR THE PAGE
// Summary numbers come from the API when present, otherwise
// they are worked out from the expense rows.
// ==========================================================

export const getExpenseOverview = async (filter) => {
  const [rowsResult, summaryResult, categoriesResult] = await Promise.allSettled([
    getExpenseRows(filter),
    getExpenseSummary(filter),
    getExpenseCategories(),
  ]);

  if (rowsResult.status === 'rejected') {
    throw rowsResult.reason;
  }

  const categoryNames = {};

  if (categoriesResult.status === 'fulfilled') {
    categoriesResult.value.forEach((c) => {
      categoryNames[String(c.id)] = c.name;
    });
  }

  const rows = rowsResult.value.map((row) => ({
    ...row,
    categoryName:
      row.categoryName || categoryNames[String(row.categoryId)] || 'Uncategorised',
  }));

  const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;

  const computedTotal = rows.reduce((sum, r) => sum + r.amount, 0);

  const total = summary?.total ?? computedTotal;
  const count = summary?.count ?? rows.length;
  const average = count > 0 ? total / count : 0;

  let byCategory = summary?.byCategory || [];

  if (byCategory.length === 0) {
    const map = new Map();

    rows.forEach((r) => {
      const current = map.get(r.categoryName) || { name: r.categoryName, amount: 0, count: 0 };
      current.amount += r.amount;
      current.count += 1;
      map.set(r.categoryName, current);
    });

    byCategory = Array.from(map.values());
  }

  byCategory = [...byCategory].sort((a, b) => b.amount - a.amount);

  return {
    rows,
    total,
    count,
    average,
    byCategory,
    topCategory: byCategory[0] || null,
  };
};

// ==========================================================
// DATE HELPERS
// ==========================================================

const pad2 = (n) => String(n).padStart(2, '0');

export const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

export const currentMonthString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-11-08..." -> "8 Nov 2026" (no timezone shift)
export const formatExpenseDate = (value) => {
  const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(value || '-');
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
};