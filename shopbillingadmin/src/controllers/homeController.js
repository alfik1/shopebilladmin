// src/controllers/homeController.js

import { API_ENDPOINTS } from '../constants/apiConstants';
import { authFetch } from '../services/apiService';
import { homeResponseFromApi } from '../models/homeModel';

export class HomeError extends Error {}

// ------------------------------------------------------------
// Current month param, e.g. "2026-10"
// ------------------------------------------------------------
export const currentMonthParam = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

// ------------------------------------------------------------
// Current month display name, e.g. "October"
// ------------------------------------------------------------
export const currentMonthName = () => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[new Date().getMonth()];
};

// ------------------------------------------------------------
// Category -> icon background color key (view resolves the color)
// ------------------------------------------------------------
export const iconBackgroundKeyForName = (name) => {
  const key = String(name || '').trim().toLowerCase();

  switch (key) {
    case 'shirts':
    case 'shirt':
    case 't-shirt':
    case 'tshirts':
    case 't-shirts':
      return 'shirtsBg';
    case 'pants':
    case 'pant':
      return 'pantsBg';
    case 'innerwear':
    case 'innerwears':
      return 'innerwearBg';
    default:
      return 'defaultBg';
  }
};

// ------------------------------------------------------------
// Date formatting: DD/MM/YYYY
// ------------------------------------------------------------
export const formatTransactionDate = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};

// ------------------------------------------------------------
// Date + time formatting
// ------------------------------------------------------------
export const formatDateTime = (value) => {
  if (!value) return { date: '', time: '' };

  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return { date: value, time: '' };

  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  const date = `${dd}/${mm}/${yyyy}`;

  let hour = dt.getHours();
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minute = String(dt.getMinutes()).padStart(2, '0');
  const time = `${hour}:${minute} ${period}`;

  return { date, time };
};

// ------------------------------------------------------------
// Transactions
// ------------------------------------------------------------
const mapTransactions = (raw) =>
  raw.map((t) => ({
    title: t.category || 'Transaction',
    date: formatTransactionDate(t.at),
    amount: Math.abs(t.amount),
    isExpense: String(t.type || '').trim().toLowerCase() === 'expense',
  }));

// ------------------------------------------------------------
// Monthly budgets
// ------------------------------------------------------------
const BUDGET_PALETTE = ['success', 'budgetOrange', 'primary'];

const mapBudgets = (raw) =>
  raw.map((b, index) => ({
    categoryId: b.categoryId,
    title: b.category || 'Category',
    spent: b.spent,
    total: b.budget,
    percentUsed: b.percentUsed,
    colorKey: BUDGET_PALETTE[index % BUDGET_PALETTE.length],
  }));

// ------------------------------------------------------------
// Recent activity
// ------------------------------------------------------------
const mapRecentActivity = (raw) =>
  raw.map((a) => {
    const { date, time } = formatDateTime(a.paidAt);
    const quantity = a.itemCount <= 0 ? 1 : a.itemCount;
    const perItemSalePrice = quantity > 0 ? a.total / quantity : a.total;

    return {
      id: a.id,
      itemName: a.category || 'Item',
      billId: a.billNo,
      date,
      time,
      price: perItemSalePrice,
      salePrice: perItemSalePrice,
      cost: a.cost,
      grossProfit: a.grossProfit,
      quantity,
      paymentMode: a.paymentMethod || 'Cash',
      iconBackgroundKey: iconBackgroundKeyForName(a.category),
      total: a.total,
    };
  });

// ------------------------------------------------------------
// Sales trend
// ------------------------------------------------------------
const mapSalesTrend = (raw) => raw.map((item) => item.total);

// ------------------------------------------------------------
// GET HOME DASHBOARD
// GET /api/mobile/home/?month=2026-10
// ------------------------------------------------------------
export const getHome = async () => {
  const month = currentMonthParam();
  const url = API_ENDPOINTS.HOME.FOR_MONTH(month);

  console.log('========================================');
  console.log('[HomeController] GET HOME');
  console.log('[HomeController] URL:', url);
  console.log('[HomeController] MONTH:', month);
  console.log('========================================');

  try {
    const response = await authFetch(url, { method: 'GET' });

    console.log('[HomeController] Status:', response.status);

    const text = await response.text();

    console.log('[HomeController] Body:', text);

    if (!response.ok) {
      throw new HomeError(`Failed to load home data (${response.status})`);
    }

    if (!text) {
      throw new HomeError('Home API returned an empty response.');
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error('[HomeController] JSON decode error:', e);
      throw new HomeError('Invalid JSON response from home API.');
    }

    const raw = homeResponseFromApi(json);

    const chartPoints = mapSalesTrend(raw.salesTrend);
    const transactions = mapTransactions(raw.transactions);
    const budgets = mapBudgets(raw.monthlyBudgets);
    const recentActivity = mapRecentActivity(raw.recentActivity);

    console.log(
      '[HomeController] sales=', raw.totalSales,
      'income=', raw.income,
      'expense=', raw.expense,
      'cost=', raw.costOfGoods,
      'profit=', raw.profit,
    );

    return {
      month: raw.month,
      totalSales: raw.totalSales,
      income: raw.income,
      expense: raw.expense,
      costOfGoods: raw.costOfGoods,
      profit: raw.profit,
      chartPoints,
      transactions,
      budgets,
      recentActivity,
    };
  } catch (error) {
    console.error('[HomeController] ERROR:', error);

    if (error instanceof HomeError) {
      throw error;
    }

    throw new HomeError('Unable to load home dashboard.');
  }
};