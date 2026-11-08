// src/models/expenseModel.js
// Read-only expense models for the admin app.

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const pick = (obj, keys, fallback = '') => {
  if (!obj || typeof obj !== 'object') return fallback;

  for (const key of keys) {
    const v = obj[key];
    if (v !== undefined && v !== null && v !== '') return v;
  }

  return fallback;
};

const toText = (value) => {
  if (value && typeof value === 'object') {
    return String(value.name || value.title || '');
  }
  return value === undefined || value === null ? '' : String(value);
};

const findList = (data) => {
  if (Array.isArray(data)) return data;

  if (data && typeof data === 'object') {
    const key = ['results', 'expenses', 'categories', 'items', 'data'].find(
      (k) => Array.isArray(data[k])
    );
    if (key) return data[key];
    if (data.data && typeof data.data === 'object') return findList(data.data);
  }

  return [];
};

// ==========================================================
// CATEGORY
// ==========================================================

export const fromApiCategoryList = (data) =>
  findList(data).map((raw) => ({
    id: pick(raw, ['id', 'category_id']),
    name: toText(pick(raw, ['name', 'title'])),
  }));

// ==========================================================
// EXPENSE
// ==========================================================

export const fromApiExpense = (raw) => {
  const category = raw?.category;
  const isObj = category && typeof category === 'object';

  return {
    id: pick(raw, ['id', 'expense_id']),
    categoryId: isObj ? (category.id ?? '') : (category ?? raw?.category_id ?? ''),
    categoryName: toText(
      pick(raw, ['category_name', 'category_title'], isObj ? category.name : '')
    ),
    amount: toNumber(pick(raw, ['amount', 'total', 'value']), 0),
    note: toText(pick(raw, ['note', 'notes', 'description'])),
    date: String(pick(raw, ['occurred_on', 'date', 'expense_date', 'created_at'])),
  };
};

export const fromApiExpenseList = (data) => findList(data).map(fromApiExpense);

// ==========================================================
// SUMMARY
// ==========================================================

export const fromApiSummary = (data) => {
  console.log('[ExpenseModel] fromApiSummary input:', data);

  const source =
    data && typeof data === 'object' && !Array.isArray(data)
      ? { ...data, ...(data.summary || {}) }
      : {};

  const totalRaw = pick(
    source,
    ['total', 'total_amount', 'total_expense', 'total_expenses', 'grand_total', 'amount'],
    null
  );

  const countRaw = pick(
    source,
    ['count', 'expense_count', 'entries', 'total_entries'],
    null
  );

  const listKey = [
    'by_category',
    'category_totals',
    'category_breakdown',
    'categories',
    'breakdown',
  ].find((k) => Array.isArray(source[k]));

  const byCategory = listKey
    ? source[listKey].map((item) => ({
        name: toText(pick(item, ['category_name', 'category', 'name'])),
        amount: toNumber(pick(item, ['total', 'amount', 'total_amount'])),
        count: toNumber(pick(item, ['count', 'entries'])),
      }))
    : [];

  const result = {
    total: totalRaw === null ? null : toNumber(totalRaw),
    count: countRaw === null ? null : toNumber(countRaw),
    byCategory,
  };

  console.log('[ExpenseModel] fromApiSummary output:', result);

  return result;
};