// src/constants/apiConstants.js

export const BASE_URL = 'http://34.171.55.230';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:          `${BASE_URL}/api/auth/login/`,
    REFRESH:        `${BASE_URL}/api/auth/refresh/`,
    ME:             `${BASE_URL}/api/auth/me/`,
    UPDATE_PROFILE: `${BASE_URL}/api/auth/profile/`,
  },

  HOME: {
    FOR_MONTH: (month) => `${BASE_URL}/api/mobile/home/?month=${month}`,
  },

  HISTORY: {
    LIST:   `${BASE_URL}/api/mobile/history/`,
    REPORT: `${BASE_URL}/api/mobile/history/report.pdf`,
  },

  STOCK: {
    LIST: `${BASE_URL}/api/mobile/stock/`,
  },

  COLLECTION: {
    LIST: `${BASE_URL}/api/mobile/collection/`,
  },

  PROFILE: {
    GET:    `${BASE_URL}/api/mobile/profile/`,
    UPDATE: `${BASE_URL}/api/mobile/profile/`,
  },

  EMPLOYEES: {
    LIST:   `${BASE_URL}/api/mobile/employees/`,
    DETAIL: (id) => `${BASE_URL}/api/mobile/employees/${id}/`,
    SALARY: (id) => `${BASE_URL}/api/mobile/employees/${id}/salary/`,
    SALARY_HISTORY: (id) => `${BASE_URL}/api/mobile/employees/${id}/salary-history/`,
  },
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'access_token',
  REFRESH_TOKEN: 'refresh_token',
};