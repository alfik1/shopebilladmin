// src/controllers/authController.js

import { API_ENDPOINTS } from '../constants/apiConstants';
import tokenService from '../services/tokenService';
import {
  loginResponseFromApi,
  refreshResponseFromApi,
  toLoginPayload,
} from '../models/authModel';

export class AuthError extends Error {}

/**
 * POST /api/auth/login/
 */
export async function login(email, password) {
  const uri = API_ENDPOINTS.AUTH.LOGIN;

  console.debug('[AuthController] login -> POST', uri, '{email:', email, '}');

  const response = await fetch(uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toLoginPayload(email, password)),
  });

  console.debug('[AuthController] login <- status:', response.status);

  const text = await response.text();

  if (!response.ok) {
    console.error('[AuthController] login failed:', response.status, text);
    throw new AuthError(`Login failed (${response.status}): ${text}`);
  }

  const json = JSON.parse(text);
  const result = loginResponseFromApi(json);

  tokenService.setTokens({ access: result.access, refresh: result.refresh });
  console.debug('[AuthController] login success, tokens saved');

  return result;
}

/**
 * POST /api/auth/refresh/
 */
export async function refreshAccessToken() {
  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new AuthError('No refresh token available');
  }

  const uri = API_ENDPOINTS.AUTH.REFRESH;

  console.debug('[AuthController] refreshAccessToken -> POST', uri);

  const response = await fetch(uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  console.debug('[AuthController] refreshAccessToken <- status:', response.status);

  if (!response.ok) {
    throw new AuthError(`Refresh failed (${response.status})`);
  }

  const json = await response.json();
  const result = refreshResponseFromApi(json);

  tokenService.setAccessToken(result.access);

  return result;
}

/**
 * Logout — clear all tokens.
 */
export function logout() {
  console.debug('[AuthController] logout');
  tokenService.clearTokens();
}

export function hasToken() {
  return tokenService.hasToken();
}