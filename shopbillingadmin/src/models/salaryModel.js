// src/models/salaryModel.js

import { employeeFromApi } from './employeeModel';

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toInt = (value, fallback = 0) => {
  if (typeof value === 'number') return Math.trunc(value);
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

// ==========================================================
// SALARY HISTORY ENTRY
// ==========================================================

export const salaryHistoryFromApi = (json) => ({
  id: toInt(json?.id),
  employee: toInt(json?.employee),
  previousSalary: toNumber(json?.previous_salary),
  newSalary: toNumber(json?.new_salary),
  effectiveOn: String(json?.effective_on ?? ''),
  reason: String(json?.reason ?? ''),
  changedBy: toInt(json?.changed_by),
  createdAt: json?.created_at ? new Date(json.created_at) : null,
});

export const salaryHistoryListFromApi = (data) => {
  const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  return list.map(salaryHistoryFromApi);
};

// ==========================================================
// SALARY UPDATE RESPONSE
// ==========================================================

export const salaryUpdateResponseFromApi = (json) => ({
  employee: employeeFromApi(json?.employee || {}),
  salaryChange: salaryHistoryFromApi(json?.salary_change || {}),
});

// ==========================================================
// UI -> API
// ==========================================================

export const toSalaryUpdatePayload = ({ monthlySalary, effectiveOn, reason }) => {
  const payload = { monthly_salary: monthlySalary };

  if (effectiveOn) payload.effective_on = effectiveOn;
  if (reason && reason.trim()) payload.reason = reason.trim();

  return payload;
};