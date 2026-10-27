// src/services/tokenService.js
// Handles all JWT token storage — single source of truth for localStorage access

import { STORAGE_KEYS } from '../constants/apiConstants';

const tokenService = {

  // ── Store ─────────────────────────────────────────────────────────────────

  setAccessToken(token) {
    const value = String(token || '').trim();

    if (!value) {
      console.warn('[TokenService] refusing to save empty access token');
      return;
    }

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, value);
    console.debug('[TokenService] access token updated');
  },

  setRefreshToken(token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    console.debug('[TokenService] refresh token saved');
  },

  setTokens({ access, refresh }) {
    this.setAccessToken(access);
    this.setRefreshToken(refresh);
    console.debug('[TokenService] access + refresh tokens saved');
  },

  // ── Retrieve ──────────────────────────────────────────────────────────────

  getAccessToken() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.debug('[TokenService] getAccessToken ->', !!token);
    return token && token.trim() ? token.trim() : null;
  },

  getRefreshToken() {
    const token = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    console.debug('[TokenService] getRefreshToken ->', !!token);
    return token && token.trim() ? token.trim() : null;
  },

  // ── Utility ───────────────────────────────────────────────────────────────

  hasToken() {
    const token = this.getAccessToken();
    return !!token;
  },

  // ── Clear ─────────────────────────────────────────────────────────────────

  clearTokens() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    console.debug('[TokenService] tokens cleared');
  },
};

export default tokenService;