// src/models/authModel.js

// ==========================================================
// API -> UI
// ==========================================================

export const loginResponseFromApi = (json) => ({
  access:  json?.access  ?? '',
  refresh: json?.refresh ?? '',
});

export const refreshResponseFromApi = (json) => ({
  access: json?.access ?? '',
});

// ==========================================================
// UI -> API
// ==========================================================

export const toLoginPayload = (email, password) => ({
  email: String(email || '').trim(),
  password: String(password || ''),
});