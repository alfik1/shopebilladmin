// src/controllers/employeeSalaryController.js

import { API_ENDPOINTS } from '../constants/apiConstants';
import { authFetch } from '../services/apiService';
import {
  salaryHistoryListFromApi,
  salaryUpdateResponseFromApi,
  toSalaryUpdatePayload,
} from '../models/salaryModel';

const buildErrorMessage = async (response) => {
  try {
    const text = await response.text();
    if (!text) return `Request failed (${response.status})`;

    const data = JSON.parse(text);

    if (data?.detail) return data.detail;

    if (Array.isArray(data?.monthly_salary) && data.monthly_salary.length) {
      return data.monthly_salary[0];
    }

    return Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('\n');
  } catch {
    return `Request failed (${response.status})`;
  }
};

// ------------------------------------------------------------
// GET /api/mobile/employees/{id}/salary-history/
// ------------------------------------------------------------
export const getSalaryHistory = async (employeeId) => {
  const url = API_ENDPOINTS.EMPLOYEES.SALARY_HISTORY(employeeId);

  console.log('[EmployeeSalaryController] GET HISTORY ->', url);

  const response = await authFetch(url, { method: 'GET' });

  console.log('[EmployeeSalaryController] Status:', response.status);

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  const json = await response.json();

  return salaryHistoryListFromApi(json);
};

// ------------------------------------------------------------
// PATCH /api/mobile/employees/{id}/salary/
// ------------------------------------------------------------
export const updateSalary = async (employeeId, { monthlySalary, effectiveOn, reason }) => {
  const url = API_ENDPOINTS.EMPLOYEES.SALARY(employeeId);
  const payload = toSalaryUpdatePayload({ monthlySalary, effectiveOn, reason });

  console.log('[EmployeeSalaryController] UPDATE SALARY ->', url, payload);

  const response = await authFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.log('[EmployeeSalaryController] Status:', response.status);

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  const json = await response.json();

  return salaryUpdateResponseFromApi(json);
};