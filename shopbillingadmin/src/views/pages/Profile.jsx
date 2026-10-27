import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../controllers/profileController';
import { getEmployees, updateEmployee, deleteEmployee } from '../../controllers/employeeController';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { IconAlert, IconProfile, IconClose } from '../components/Icons';
import { APP_ROUTES } from '../../routes/appRoutes';

const initials = (name) => {
  const parts = String(name || '').trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.map((p) => p[0]).slice(0, 2).join('').toUpperCase();
};

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getProfile();
      setProfile(result);
    } catch (err) {
      console.error('[Profile] LOAD ERROR:', err);
      setError(err.message || 'Could not load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    setEmployeesLoading(true);

    try {
      const result = await getEmployees();
      setEmployees(result);
    } catch (err) {
      console.error('[Profile] LOAD EMPLOYEES ERROR:', err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadEmployees();
  }, []);

  const handleSaveProfile = async ({ name, phone }) => {
    const updated = await updateProfile({ name, phone });
    setProfile((prev) => ({ ...prev, username: updated.name, phone: updated.phone }));
  };

  const handleSaveEmployee = async (input) => {
    await updateEmployee(editEmployee.id, input);
    await loadEmployees();
    setEditEmployee(null);
  };

  const handleConfirmDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);

    try {
      await deleteEmployee(target.id);
      await loadEmployees();
    } catch (err) {
      console.error('[Profile] DEACTIVATE ERROR:', err);
    }
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(false);
    logout();
  };

  const totalMonthlySalary = employees.reduce((sum, e) => sum + e.monthlySalary, 0);

  if (loading) {
    return (
      <div className="home-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-center">
        <div className="home-error">
          <IconAlert color={COLORS.error} />
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadProfile}>Retry</button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-page">
      <div className="profile-header-card">
        <div className="profile-header-avatar">
          <IconProfile size={34} color="#fff" />
        </div>
        <div className="profile-header-body">
          <div className="profile-header-name">{profile.username}</div>
          <div className="profile-header-role">{profile.role}</div>
        </div>
        <button className="profile-edit-btn" onClick={() => setEditProfileOpen(true)} aria-label="Edit profile">
          ✎
        </button>
      </div>

      <div className="stock-summary-grid">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: `${COLORS.primary}1F` }}>
            <IconProfile size={18} color={COLORS.primary} />
          </div>
          <div className="summary-value">{employees.length}</div>
          <div className="summary-label">Employees</div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: `${COLORS.success}1F` }}>₹</div>
          <div className="summary-value">₹{totalMonthlySalary.toFixed(0)}</div>
          <div className="summary-label">Monthly Payroll</div>
        </div>
      </div>

      <div className="section-header">
        <span>Employee Cards</span>
        <button className="add-employee-btn" onClick={() => navigate(APP_ROUTES.addEmployee)}>
          + Add Employee
        </button>
      </div>

      {employeesLoading ? (
        <div className="home-center" style={{ minHeight: 120 }}>
          <div className="loading-spinner" />
        </div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <p>No employees found</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate(APP_ROUTES.addEmployee)}>
            + Add Employee
          </button>
        </div>
      ) : (
        <div className="tile-list">
          {employees.map((e) => (
            <div className="employee-card" key={e.id}>
              <div
                className="employee-avatar clickable"
                onClick={() => navigate(APP_ROUTES.employeeSalary(e.id))}
              >
                {initials(e.name)}
              </div>
              <div className="employee-body clickable" onClick={() => navigate(APP_ROUTES.employeeSalary(e.id))}>
                <div className="employee-name">{e.name}</div>
                <div className="employee-role">{e.jobTitle || e.role}</div>
                <div className="employee-phone">{e.phone}</div>
                <div className="employee-status">
                  <span className={`status-dot${e.isActive ? ' active' : ' inactive'}`} />
                  {e.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="employee-right">
                <div className="employee-salary">₹{e.monthlySalary.toFixed(0)}</div>
                <div className="employee-salary-label">Monthly</div>
                <div className="employee-actions">
                  <button className="icon-btn" title="Salary & History" onClick={() => navigate(APP_ROUTES.employeeSalary(e.id))}>
                    💰
                  </button>
                  <button className="icon-btn" title="Edit" onClick={() => setEditEmployee(e)}>
                    ✎
                  </button>
                  <button className="icon-btn danger" title="Deactivate" onClick={() => setDeleteTarget(e)}>
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="logout-outline-btn" onClick={() => setLogoutConfirmOpen(true)}>
        Logout
      </button>

      {editProfileOpen && (
        <EditProfileModal initial={profile} onClose={() => setEditProfileOpen(false)} onSave={handleSaveProfile} />
      )}

      {editEmployee && (
        <EditEmployeeModal employee={editEmployee} onClose={() => setEditEmployee(null)} onSave={handleSaveEmployee} />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-title">Deactivate Employee</div>
            <div className="confirm-text">Are you sure you want to deactivate {deleteTarget.name}?</div>
            <div className="confirm-actions">
              <button className="confirm-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="confirm-btn danger" onClick={handleConfirmDelete}>Deactivate</button>
            </div>
          </div>
        </div>
      )}

      {logoutConfirmOpen && (
        <div className="modal-overlay" onClick={() => setLogoutConfirmOpen(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-title">Logout</div>
            <div className="confirm-text">Are you sure you want to logout?</div>
            <div className="confirm-actions">
              <button className="confirm-btn" onClick={() => setLogoutConfirmOpen(false)}>Cancel</button>
              <button className="confirm-btn danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditProfileModal({ initial, onClose, onSave }) {
  const [name, setName] = useState(initial.username);
  const [phone, setPhone] = useState(initial.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError('');

    try {
      await onSave({ name: name.trim(), phone: phone.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <span>Edit Profile</span>
          <button className="icon-btn" onClick={onClose}><IconClose size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="sheet-body">
          <div className="form-group">
            <label>Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn btn-primary sheet-submit" type="submit" disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditEmployeeModal({ employee, onClose, onSave }) {
  const [name, setName] = useState(employee.name);
  const [jobTitle, setJobTitle] = useState(employee.jobTitle);
  const [phone, setPhone] = useState(employee.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) { setError('Please enter name'); return; }
    if (!jobTitle.trim()) { setError('Please enter job title'); return; }
    if (!phone.trim()) { setError('Please enter phone number'); return; }

    setSaving(true);
    setError('');

    try {
      await onSave({ name: name.trim(), jobTitle: jobTitle.trim(), phone: phone.trim() });
    } catch (err) {
      setError(err.message || 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <span>Edit Employee</span>
          <button className="icon-btn" onClick={onClose}><IconClose size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="sheet-body">
          <div className="form-group">
            <label>Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Job Title</label>
            <input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn btn-primary sheet-submit" type="submit" disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Update Employee'}
          </button>
        </form>
      </div>
    </div>
  );
}