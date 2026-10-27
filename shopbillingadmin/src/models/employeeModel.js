// src/models/employeeModel.js

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

const asArray = (value) => (Array.isArray(value) ? value : []);

// ==========================================================
// API -> UI
// ==========================================================

export const employeeFromApi = (json) => ({
  id: toInt(json?.id),
  email: String(json?.email ?? ''),
  username: String(json?.username ?? ''),
  name: String(json?.name ?? ''),
  phone: String(json?.phone ?? ''),
  role: String(json?.role ?? ''),
  jobTitle: String(json?.job_title ?? ''),
  monthlySalary: toNumber(json?.monthly_salary),
  isActive: json?.is_active === true,
});

export const employeesFromApi = (data) => {
  console.log('[EmployeeModel] employeesFromApi input:', data);

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

  const employees = asArray(list).map(employeeFromApi);

  console.log('[EmployeeModel] employeesFromApi output count:', employees.length);

  return employees;
};

// ==========================================================
// UI -> API
// ==========================================================

// POST /api/mobile/employees/
export const toCreateEmployeePayload = ({
  email, username, name, phone, role, jobTitle, monthlySalary, password,
}) => ({
  email: String(email || '').trim(),
  username: String(username || '').trim(),
  name: String(name || '').trim(),
  phone: String(phone || '').trim(),
  role: String(role || 'staff'),
  job_title: String(jobTitle || '').trim(),
  monthly_salary: String(monthlySalary || '').trim(),
  password: String(password || ''),
});

// PATCH /api/mobile/employees/{id}/  — only name/phone/jobTitle/email/username/role
export const toUpdateEmployeePayload = ({ name, phone, jobTitle, email, username, role }) => {
  const payload = {};

  if (name !== undefined) payload.name = name;
  if (phone !== undefined) payload.phone = phone;
  if (jobTitle !== undefined) payload.job_title = jobTitle;
  if (email !== undefined) payload.email = email;
  if (username !== undefined) payload.username = username;
  if (role !== undefined) payload.role = role;

  return payload;
};