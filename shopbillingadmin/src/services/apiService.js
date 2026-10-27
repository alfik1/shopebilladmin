// src/services/apiService.js
// Shared fetch wrapper for every authenticated API call.
//
// - Attaches the saved access token to every request.
// - On a 401, tries once to refresh the access token via
//   API_ENDPOINTS.AUTH.REFRESH, then retries the original request.
// - If there's no refresh token, or the refresh call itself fails,
//   clears the stored tokens and forces navigation back to login
//   (session expired).

import { API_ENDPOINTS } from '../constants/apiConstants';
import tokenService from './tokenService';

let forceLogoutHandler = null;

// The app (AuthContext) registers a handler here so this service can
// trigger a logout + redirect without needing a React component itself.
export function setForceLogoutHandler(handler) {
  forceLogoutHandler = handler;
}

async function tryRefreshToken() {
  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) {
    console.debug('[ApiService] tryRefreshToken -> no refresh token stored');
    return false;
  }

  try {
    const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    console.debug('[ApiService] tryRefreshToken <- status:', response.status);

    if (response.ok) {
      const json = await response.json();

      if (json.access) {
        tokenService.setAccessToken(json.access);
        console.debug('[ApiService] tryRefreshToken -> access token updated');
        return true;
      }
    }
  } catch (err) {
    console.error('[ApiService] tryRefreshToken -> error:', err);
  }

  return false;
}

async function forceLogout() {
  tokenService.clearTokens();
  console.debug('[ApiService] tokens cleared, forcing logout');

  if (forceLogoutHandler) {
    forceLogoutHandler();
  } else {
    window.location.href = '/login';
  }
}

export async function authFetch(url, options = {}, isRetry = false) {
  const accessToken = tokenService.getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  console.debug('[ApiService] authFetch ->', options.method || 'GET', url, '(retry:', isRetry, ')');

  const response = await fetch(url, { ...options, headers });

  console.debug('[ApiService] authFetch <- status:', response.status);

  if (response.status === 401 && !isRetry) {
    console.warn('[ApiService] 401 received, attempting token refresh');

    const refreshed = await tryRefreshToken();

    if (refreshed) {
      console.debug('[ApiService] refresh succeeded, retrying original request');
      return authFetch(url, options, true);
    }

    console.warn('[ApiService] refresh failed, forcing logout');
    await forceLogout();
  }

  return response;
}