// src/models/historyModel.js

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toInt = (value, fallback = 0) => {
  const n = toNumber(value, fallback);
  return Math.trunc(n);
};

const asArray = (value) => (Array.isArray(value) ? value : []);

// ==========================================================
// API -> RAW MODEL
// ==========================================================

export const historyResponseFromApi = (json) => {
  console.log('[HistoryModel] historyResponseFromApi input:', json);

  const collectionInsights = asArray(json?.collection_insights).map((item) => ({
    date: item?.date ? new Date(item.date) : new Date(),
    total: toNumber(item?.total),
  }));

  const transactions = asArray(json?.transactions).map((item) => ({
    id: toInt(item?.id),
    billNo: String(item?.bill_no ?? ''),
    paidAt: item?.paid_at ? new Date(item.paid_at) : null,
    category: String(item?.category ?? ''),
    itemCount: toInt(item?.item_count, 1),
    paymentMethod: String(item?.payment_method ?? ''),
    total: toNumber(item?.total),
    cost: toNumber(item?.cost),
    grossProfit: toNumber(item?.gross_profit),
  }));

  const result = {
    period: String(json?.period ?? ''),
    startDate: String(json?.start_date ?? ''),
    endDate: String(json?.end_date ?? ''),
    collection: toNumber(json?.collection),
    billCount: toInt(json?.bill_count),
    collectionInsights,
    transactions,
  };

  console.log('[HistoryModel] historyResponseFromApi output:', result);

  return result;
};