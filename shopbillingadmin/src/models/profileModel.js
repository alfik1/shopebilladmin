// src/models/profileModel.js

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toInt = (value, fallback = 0) => Math.trunc(toNumber(value, fallback));

const asArray = (value) => (Array.isArray(value) ? value : []);

// ==========================================================
// "user" block of GET /api/mobile/profile/
// ==========================================================

export const profileUserFromApi = (json) => {
  const name = String(json?.name ?? json?.username ?? 'User');
  const role = String(json?.role ?? '');
  const jobTitle = String(json?.job_title ?? '');

  return {
    id: toInt(json?.id),
    name,
    role,
    jobTitle,
    phone: String(json?.phone ?? ''),
    displayTitle: jobTitle || role,
  };
};

// ==========================================================
// "employees" entries inside GET /api/mobile/profile/
// (used only as a fallback — the Profile page loads the live
// list separately via employeeController)
// ==========================================================

export const profileEmployeeFromApi = (json) => ({
  id: toInt(json?.id),
  name: String(json?.name ?? ''),
  jobTitle: String(json?.job_title ?? ''),
  monthlySalary: toNumber(json?.monthly_salary),
});

// ==========================================================
// Full GET /api/mobile/profile/ response
// ==========================================================

export const profileResponseFromApi = (json) => {
  console.log('[ProfileModel] profileResponseFromApi input:', json);

  const result = {
    user: profileUserFromApi(json?.user || {}),
    employeeCount: toInt(json?.employee_count),
    lastMonth: String(json?.last_month ?? ''),
    lastMonthScheduledPayroll: toNumber(json?.last_month_scheduled_payroll),
    employees: asArray(json?.employees).map(profileEmployeeFromApi),
  };

  console.log('[ProfileModel] profileResponseFromApi output:', result);

  return result;
};

// ==========================================================
// GET /api/auth/me/ — phone fallback
// ==========================================================

export const meResponseFromApi = (json) => ({
  id: String(json?.id ?? ''),
  name: String(json?.name ?? json?.username ?? json?.full_name ?? 'User'),
  email: String(json?.email ?? ''),
  role: String(json?.role ?? 'Shop Owner'),
  phone: String(json?.phone ?? ''),
});
