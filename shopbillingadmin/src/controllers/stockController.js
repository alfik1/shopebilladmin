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
// Progress ratio (0..1)
// ------------------------------------------------------------
const ratioFor = (item) => {
  if (item.percentOfTarget !== null) {
    return Math.min(Math.max(item.percentOfTarget / 100, 0), 1);
  }

  if (item.targetQty <= 0) return 0;

  return Math.min(Math.max(item.stockQty / item.targetQty, 0), 1);
};

// ------------------------------------------------------------
// Progress color key: 'error' | 'warning' | 'success'
// ------------------------------------------------------------
const progressColorKeyFor = (item) => {
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
};

// ------------------------------------------------------------
// Map stock levels -> UI items
// ------------------------------------------------------------
const mapStockItems = (levels) =>
  levels.map((item) => ({
    categoryId: item.categoryId,
    name: item.category,
    iconBackgroundKey: iconBackgroundKeyForStock(item.icon),
    remaining: item.stockQty,
    total: item.targetQty,
    soldToday: item.soldToday,
    percentOfTarget: item.percentOfTarget,
    ratio: ratioFor(item),
    colorKey: progressColorKeyFor(item),
  }));

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

    return {
      date: raw.date,
      totalRemaining: raw.totalStockLeft,
      totalSoldToday: raw.soldToday,
      items: mapStockItems(raw.stockLevels),
    };
  } catch (error) {
    console.error('[StockController] ERROR:', error);

    if (error instanceof StockError) {
      throw error;
    }

    throw new StockError('Unable to load stock.');
  }
};