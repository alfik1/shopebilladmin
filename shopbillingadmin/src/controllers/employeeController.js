// src/controllers/employeeController.js

import { API_ENDPOINTS } from '../constants/apiConstants';
import { authFetch } from '../services/apiService';
import {
  employeesFromApi,
  employeeFromApi,
  toCreateEmployeePayload,
  toUpdateEmployeePayload,
} from '../models/employeeModel';

const buildErrorMessage = async (response) => {
  try {
    const text = await response.text();
    if (!text) return `Request failed (${response.status})`;

    const data = JSON.parse(text);

    if (data?.detail) return data.detail;

    return Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('\n');
  } catch {
    return `Request failed (${response.status})`;
  }
};

// ------------------------------------------------------------
// GET /api/mobile/employees/
// ------------------------------------------------------------
export const getEmployees = async () => {
  const url = API_ENDPOINTS.EMPLOYEES.LIST;

  console.log('[EmployeeController] GET EMPLOYEES ->', url);

  const response = await authFetch(url, { method: 'GET' });

  console.log('[EmployeeController] Status:', response.status);

  const text = await response.text();

  console.log('[EmployeeController] Body:', text);

  if (!response.ok) {
    throw new Error(`Failed to load employees (${response.status})`);
  }

  const json = text ? JSON.parse(text) : [];

  return employeesFromApi(json);
};

// ------------------------------------------------------------
// GET /api/mobile/employees/{id}/
// ------------------------------------------------------------
export const getEmployee = async (id) => {
  const url = API_ENDPOINTS.EMPLOYEES.DETAIL(id);

  console.log('[EmployeeController] GET EMPLOYEE ->', url);

  const response = await authFetch(url, { method: 'GET' });

  console.log('[EmployeeController] Status:', response.status);

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  const json = await response.json();

  return employeeFromApi(json);
};

// ------------------------------------------------------------
// POST /api/mobile/employees/
// ------------------------------------------------------------
export const createEmployee = async (input) => {
  const url = API_ENDPOINTS.EMPLOYEES.LIST;
  const payload = toCreateEmployeePayload(input);

  console.log('[EmployeeController] CREATE EMPLOYEE ->', url, payload);

  const response = await authFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.log('[EmployeeController] Status:', response.status);

  if (response.status !== 201) {
    throw new Error(await buildErrorMessage(response));
  }

  const json = await response.json();

  return employeeFromApi(json);
};

// ------------------------------------------------------------
// PATCH /api/mobile/employees/{id}/
// ------------------------------------------------------------
export const updateEmployee = async (id, input) => {
  const url = API_ENDPOINTS.EMPLOYEES.DETAIL(id);
  const payload = toUpdateEmployeePayload(input);

  console.log('[EmployeeController] UPDATE EMPLOYEE ->', url, payload);

  const response = await authFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.log('[EmployeeController] Status:', response.status);

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  const json = await response.json();

  return employeeFromApi(json);
};

// ------------------------------------------------------------
// DELETE /api/mobile/employees/{id}/ (deactivate)
// ------------------------------------------------------------
export const deleteEmployee = async (id) => {
  const url = API_ENDPOINTS.EMPLOYEES.DETAIL(id);

  console.log('[EmployeeController] DELETE EMPLOYEE ->', url);

  const response = await authFetch(url, { method: 'DELETE' });

  console.log('[EmployeeController] Status:', response.status);

  if (response.status !== 204) {
    throw new Error(await buildErrorMessage(response));
  }

  return true;
};