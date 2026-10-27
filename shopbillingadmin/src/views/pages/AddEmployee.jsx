import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployee } from '../../controllers/employeeController';
import { IconProfile } from '../components/Icons';

export default function AddEmployee() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('staff');
  const [jobTitle, setJobTitle] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const validate = () => {
    const next = {};

    if (!name.trim()) next.name = 'Name is required';

    if (!phone.trim()) next.phone = 'Phone number is required';
    else if (phone.trim().length < 10) next.phone = 'Enter a valid phone number';

    if (!email.trim()) next.email = 'Email is required';
    else if (!email.includes('@') || !email.includes('.')) next.email = 'Enter a valid email';

    if (!username.trim()) next.username = 'Username is required';

    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must contain at least 6 characters';

    if (!jobTitle.trim()) next.jobTitle = 'Job title is required';

    if (!monthlySalary.trim()) next.monthlySalary = 'Monthly salary is required';
    else {
      const salary = Number(monthlySalary.trim());
      if (Number.isNaN(salary)) next.monthlySalary = 'Enter a valid salary';
      else if (salary < 0) next.monthlySalary = 'Salary cannot be negative';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setFormError('');

    try {
      await createEmployee({
        email, username, name, phone, role, jobTitle, monthlySalary, password,
      });
      navigate(-1);
    } catch (err) {
      console.error('[AddEmployee] CREATE ERROR:', err);
      setFormError(err.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-employee-page">
      <div className="add-employee-topbar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <span>Add Employee</span>
      </div>

      <form onSubmit={handleSubmit} className="add-employee-form">
        <div className="add-employee-hero">
          <div className="add-employee-hero-avatar">
            <IconProfile size={28} color="#fff" />
          </div>
          <div>
            <div className="add-employee-hero-title">New Employee</div>
            <div className="add-employee-hero-sub">Enter employee details below</div>
          </div>
        </div>

        <div className="form-section-title">Personal Information</div>

        <div className="form-group">
          <label>Full Name</label>
          <input className="input" placeholder="Enter employee name" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input className="input" placeholder="9876543211" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {errors.phone && <div className="error-text">{errors.phone}</div>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input className="input" type="email" placeholder="employee@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>

        <div className="form-section-title">Account Information</div>

        <div className="form-group">
          <label>Username</label>
          <input className="input" placeholder="cashier" value={username} onChange={(e) => setUsername(e.target.value)} />
          {errors.username && <div className="error-text">{errors.username}</div>}
        </div>

        <div className="form-group">
          <label>Role</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-with-icon">
            <input
              className="input"
              type={obscurePassword ? 'password' : 'text'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: 14 }}
            />
            <button type="button" className="input-suffix-btn" onClick={() => setObscurePassword((v) => !v)}>
              {obscurePassword ? '👁' : '🙈'}
            </button>
          </div>
          {errors.password && <div className="error-text">{errors.password}</div>}
        </div>

        <div className="form-section-title">Job Information</div>

        <div className="form-group">
          <label>Job Title</label>
          <input className="input" placeholder="Cashier" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          {errors.jobTitle && <div className="error-text">{errors.jobTitle}</div>}
        </div>

        <div className="form-group">
          <label>Monthly Salary</label>
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="15000.00"
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(e.target.value)}
          />
          {errors.monthlySalary && <div className="error-text">{errors.monthlySalary}</div>}
        </div>

        {formError && <div className="error-text">{formError}</div>}

        <button className="btn btn-primary sheet-submit" type="submit" disabled={submitting}>
          {submitting ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2.5 }} /> : 'Create Employee'}
        </button>
      </form>
    </div>
  );
}