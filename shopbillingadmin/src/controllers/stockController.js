// src/controllers/stockController.js

import { API_ENDPOINTS } from '../constants/apiConstants';
import { authFetch } from '../services/apiService';
import { stockResponseFromApi } from '../models/stockModel';

export class StockError extends Error {}

// ------------------------------------------------------------
// What to show after the "/" in "remaining / total"
//
//   'startOfDay' -> stock_qty + sold_today (stock at start of day)
//                   ignores target_qty, so wrong backend targets
//                   no longer affect the screen
//   'target'     -> target_qty from the API (original behaviour)
//   'stock'      -> same as remaining (bar always full and green)
// ------------------------------------------------------------
const TOTAL_MODE = 'startOfDay';

// ------------------------------------------------------------
// Category -> icon background key (reuses Home's palette)
// ------------------------------------------------------------
const iconBackgroundKeyForStock = (icon) => {
  const value = String(icon || '').toLowerCase();

  if (value.includes('shirt')) return 'shirtsBg';
  if (value.includes('inner')) return 'innerwearBg';
  if (value.includes('pant')) return 'pantsBg';
  return 'defaultBg';
};

// ------------------------------------------------------------
// Total shown after the "/"
// ------------------------------------------------------------
const totalFor = (item) => {
  if (TOTAL_MODE === 'target') return item.targetQty;
  if (TOTAL_MODE === 'stock') return item.stockQty;

  // 'startOfDay'
  return item.stockQty + item.soldToday;
};

// ------------------------------------------------------------
// Progress ratio (0..1)
// ------------------------------------------------------------
const ratioFor = (item) => {
  if (TOTAL_MODE === 'target') {
    if (item.percentOfTarget !== null) {
      return Math.min(Math.max(item.percentOfTarget / 100, 0), 1);
    }

    if (item.targetQty <= 0) return 0;

    return Math.min(Math.max(item.stockQty / item.targetQty, 0), 1);
  }

  if (TOTAL_MODE === 'stock') {
    return item.stockQty > 0 ? 1 : 0;
  }

  // 'startOfDay'
  const total = item.stockQty + item.soldToday;

  if (total <= 0) return 0;

  return Math.min(Math.max(item.stockQty / total, 0), 1);
};

// ------------------------------------------------------------
// Progress color key: 'error' | 'warning' | 'success'
// ------------------------------------------------------------
const progressColorKeyFor = (item) => {
  if (TOTAL_MODE === 'stock') return 'success';

  if (TOTAL_MODE === 'target') {
    if (item.percentOfTarget !== null) {
      if (item.percentOfTarget <= 20) return 'error';
      if (item.percentOfTarget <= 50) return 'warning';
      return 'success';
    }

    if (item.targetQty > 0) {
      const ratio = item.stockQty / item.targetQty;
      if (ratio <= 0.2) return 'error';
      if (ratio <= 0.5) return 'warning';
    }

    return 'success';
  }

  // 'startOfDay'
  const ratio = ratioFor(item);

  if (item.stockQty + item.soldToday > 0) {
    if (ratio <= 0.2) return 'error';
    if (ratio <= 0.5) return 'warning';
  }

  return 'success';
};

// ------------------------------------------------------------
// Sort order: names starting with a number first (numeric order),
// then the rest A-Z. Case-insensitive.
// ------------------------------------------------------------
const startsWithNumber = (name) => /^\d/.test(String(name || '').trim());

const compareByName = (a, b) => {
  const aNum = startsWithNumber(a.name);
  const bNum = startsWithNumber(b.name);

  // numeric names go first
  if (aNum !== bNum) return aNum ? -1 : 1;

  return String(a.name || '')
    .trim()
    .localeCompare(String(b.name || '').trim(), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
};

// ------------------------------------------------------------
// Map stock levels -> UI items
// ------------------------------------------------------------
const mapStockItems = (levels) =>
  levels
    .map((item) => ({
      categoryId: item.categoryId,
      name: item.category,
      iconBackgroundKey: iconBackgroundKeyForStock(item.icon),
      remaining: item.stockQty,
      total: totalFor(item),
      soldToday: item.soldToday,
      percentOfTarget: item.percentOfTarget,
      ratio: ratioFor(item),
      colorKey: progressColorKeyFor(item),
    }))
    .sort(compareByName);

// ------------------------------------------------------------
// GET STOCK
// GET /api/mobile/stock/
// ------------------------------------------------------------
export const getStock = async () => {
  const url = API_ENDPOINTS.STOCK.LIST;

  console.log('========================================');
  console.log('[StockController] GET STOCK');
  console.log('[StockController] URL:', url);
  console.log('[StockController] TOTAL_MODE:', TOTAL_MODE);
  console.log('========================================');

  try {
    const response = await authFetch(url, { method: 'GET' });

    console.log('[StockController] Status:', response.status);

    const text = await response.text();

    console.log('[StockController] Body:', text);

    if (!response.ok) {
      throw new StockError(`Failed to load stock (${response.status})`);
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error('[StockController] JSON decode error:', e);
      throw new StockError('Invalid stock response.');
    }

    const raw = stockResponseFromApi(json);

    // ---------- DEBUG: categories where the API target looks wrong ----------
    const suspicious = raw.stockLevels
      .filter((i) => i.targetQty !== i.stockQty + i.soldToday)
      .map((i) => ({
        category: i.category,
        stock_qty: i.stockQty,
        sold_today: i.soldToday,
        expected_target: i.stockQty + i.soldToday,
        api_target_qty: i.targetQty,
      }));

    if (suspicious.length > 0) {
      console.warn(
        '[StockController] target_qty differs from stock_qty + sold_today for:'
      );
      console.table(suspicious);
    }

    const result = {
      date: raw.date,
      totalRemaining: raw.totalStockLeft,
      totalSoldToday: raw.soldToday,
      items: mapStockItems(raw.stockLevels),
    };

    console.log('[StockController] Result:', result);

    return result;
  } catch (error) {
    console.error('[StockController] ERROR:', error);

    if (error instanceof StockError) {
      throw error;
    }

    throw new StockError('Unable to load stock.');
  }
};