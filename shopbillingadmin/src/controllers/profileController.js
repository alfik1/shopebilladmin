// src/controllers/profileController.js

import { API_ENDPOINTS } from '../constants/apiConstants';
import { authFetch } from '../services/apiService';
import { profileResponseFromApi, meResponseFromApi } from '../models/profileModel';

export class ProfileError extends Error {}

// ------------------------------------------------------------
// GET /api/mobile/profile/
// ------------------------------------------------------------
const getProfileRaw = async () => {
  const url = API_ENDPOINTS.PROFILE.GET;

  console.log('[ProfileController] GET PROFILE ->', url);

  const response = await authFetch(url, { method: 'GET' });

  console.log('[ProfileController] GET PROFILE status:', response.status);

  const text = await response.text();

  console.log('[ProfileController] GET PROFILE body:', text);

  if (!response.ok) {
    throw new ProfileError(`Failed to load profile (${response.status})`);
  }

  const json = JSON.parse(text);

  return profileResponseFromApi(json);
};

// ------------------------------------------------------------
// GET /api/auth/me/ — phone fallback only
// ------------------------------------------------------------
const getMe = async () => {
  const url = API_ENDPOINTS.AUTH.ME;

  console.log('[ProfileController] GET ME ->', url);

  const response = await authFetch(url, { method: 'GET' });

  console.log('[ProfileController] GET ME status:', response.status);

  if (!response.ok) {
    throw new ProfileError(`Failed to load /me (${response.status})`);
  }

  const json = await response.json();

  return meResponseFromApi(json);
};

// ------------------------------------------------------------
// Combined profile load (name/role + phone fallback)
// ------------------------------------------------------------
export const getProfile = async () => {
  try {
    const profile = await getProfileRaw();

    let phone = profile.user.phone;

    if (!phone) {
      try {
        const me = await getMe();
        phone = me.phone;
        console.log('[ProfileController] phone loaded from /me ->', phone);
      } catch (e) {
        console.warn('[ProfileController] phone lookup failed (non-fatal):', e);
      }
    }

    return {
      username: profile.user.name,
      role: profile.user.displayTitle,
      phone,
    };
  } catch (error) {
    console.error('[ProfileController] getProfile ERROR:', error);

    if (error instanceof ProfileError) {
      throw error;
    }

    throw new ProfileError('Could not load profile. Please try again.');
  }
};

// ------------------------------------------------------------
// PATCH /api/auth/profile/
// ------------------------------------------------------------
export const updateProfile = async ({ name, phone }) => {
  const url = API_ENDPOINTS.AUTH.UPDATE_PROFILE;

  console.log('[ProfileController] UPDATE PROFILE ->', url, { name, phone });

  const response = await authFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone }),
  });

  console.log('[ProfileController] UPDATE PROFILE status:', response.status);

  const text = await response.text();

  console.log('[ProfileController] UPDATE PROFILE body:', text);

  if (!response.ok) {
    throw new ProfileError(`Could not update profile. (${response.status})`);
  }

  const json = JSON.parse(text);
  const me = meResponseFromApi(json);

  return { name: me.name, phone: me.phone };
};