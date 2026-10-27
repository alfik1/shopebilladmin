// src/models/homeModel.js

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

// ==========================================================
// API -> RAW MODEL
// ==========================================================

export const homeResponseFromApi = (json) => {
  console.log('[HomeModel] homeResponseFromApi input:', json);

  const salesTrend = asArray(json?.sales_trend).map((item) => ({
    date: String(item?.date ?? ''),
    total: toNumber(item?.total),
  }));

  const transactions = asArray(json?.transactions).map((item) => ({
    type: String(item?.type ?? ''),
    category: String(item?.category ?? ''),
    amount: toNumber(item?.amount),
    at: String(item?.at ?? ''),
  }));

  const monthlyBudgets = asArray(json?.monthly_budgets).map((item) => ({
    categoryId: Number(item?.category_id ?? 0),
    category: String(item?.category ?? ''),
    budget: toNumber(item?.budget),
    spent: toNumber(item?.spent),
    percentUsed: toNumber(item?.percent_used),
  }));

  const recentActivity = asArray(json?.recent_activity).map((item) => ({
    id: Number(item?.id ?? 0),
    billNo: String(item?.bill_no ?? ''),
    paidAt: String(item?.paid_at ?? ''),
    category: String(item?.category ?? ''),
    itemCount: Number(item?.item_count ?? 1),
    paymentMethod: String(item?.payment_method ?? ''),
    total: toNumber(item?.total),
    cost: toNumber(item?.cost),
    grossProfit: toNumber(item?.gross_profit),
  }));

  const result = {
    month: String(json?.month ?? ''),
    totalSales: toNumber(json?.total_sales),
    income: toNumber(json?.income),
    expense: toNumber(json?.expense),
    costOfGoods: toNumber(json?.cost_of_goods),
    profit: toNumber(json?.profit),
    salesTrend,
    transactions,
    monthlyBudgets,
    recentActivity,
  };

  console.log('[HomeModel] homeResponseFromApi output:', result);

  return result;
};