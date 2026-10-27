// src/models/stockModel.js

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toInt = (value, fallback = 0) => Math.trunc(toNumber(value, fallback));

const toNullableNumber = (value) => {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

// ==========================================================
// API -> RAW MODEL
// ==========================================================

export const stockResponseFromApi = (json) => {
  console.log('[StockModel] stockResponseFromApi input:', json);

  const stockLevels = asArray(json?.stock_levels).map((item) => ({
    categoryId: toInt(item?.category_id),
    category: String(item?.category ?? ''),
    icon: String(item?.icon ?? ''),
    stockQty: toInt(item?.stock_qty),
    targetQty: toInt(item?.target_qty),
    soldToday: toInt(item?.sold_today),
    percentOfTarget: toNullableNumber(item?.percent_of_target),
  }));

  const result = {
    date: json?.date ? new Date(json.date) : new Date(),
    totalStockLeft: toInt(json?.total_stock_left),
    soldToday: toInt(json?.sold_today),
    stockLevels,
  };

  console.log('[StockModel] stockResponseFromApi output:', result);

  return result;
};