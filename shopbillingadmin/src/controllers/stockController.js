// src/controllers/stockController.js

import { API_ENDPOINTS } from '../constants/apiConstants';
import { authFetch } from '../services/apiService';
import { stockResponseFromApi } from '../models/stockModel';

export class StockError extends Error {}

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
// Total stock ever = stock left + all-time sold (total_sold)
// Shown after the "/" in "remaining / total"
// ------------------------------------------------------------
const totalFor = (item) => item.stockQty + item.totalSold;

// ------------------------------------------------------------
// Progress ratio (0..1) = stock left / total stock ever
// ------------------------------------------------------------
const ratioFor = (item) => {
  const total = totalFor(item);

  if (total <= 0) return 0;

  return Math.min(Math.max(item.stockQty / total, 0), 1);
};

// ------------------------------------------------------------
// Progress color key: 'error' | 'warning' | 'success'
// ------------------------------------------------------------
const progressColorKeyFor = (item) => {
  if (totalFor(item) > 0) {
    const ratio = ratioFor(item);

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
      totalSold: item.totalSold,
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

    // ---------- DEBUG: is total_sold coming from the API? ----------
    const hasTotalSold = Array.isArray(json?.stock_levels)
      && json.stock_levels.some((i) => i?.total_sold !== undefined);

    if (!hasTotalSold) {
      console.warn(
        '[StockController] total_sold is missing in stock_levels. Total sold will show 0.'
      );
    }

    // ---------- DEBUG: stock + total_sold vs API target_qty ----------
    console.table(
      raw.stockLevels.map((i) => ({
        category: i.category,
        stock_qty: i.stockQty,
        total_sold: i.totalSold,
        'stock + total_sold': i.stockQty + i.totalSold,
        api_target_qty: i.targetQty,
      }))
    );

    const totalSoldAll = raw.stockLevels.reduce(
      (sum, i) => sum + i.totalSold,
      0
    );

    const result = {
      date: raw.date,
      totalRemaining: raw.totalStockLeft,
      totalSold: totalSoldAll,
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