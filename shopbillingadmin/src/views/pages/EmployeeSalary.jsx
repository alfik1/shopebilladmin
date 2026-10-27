import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEmployee } from '../../controllers/employeeController';
import { getSalaryHistory, updateSalary } from '../../controllers/employeeSalaryController';
import { COLORS } from '../../constants/colors';
import { IconAlert } from '../components/Icons';

const initials = (name) => {
  const parts = String(name || '').trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.map((p) => p[0]).slice(0, 2).join('').toUpperCase();
};

const formatDateTime = (date) => {
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()} ${hh}:${min}`;
};

export default function EmployeeSalary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [updateOpen, setUpdateOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const emp = await getEmployee(id);
      const hist = await getSalaryHistory(id);
      setEmployee(emp);
      setHistory(hist);
    } catch (err) {
      console.error('[EmployeeSalary] LOAD ERROR:', err);
      setError(err.message || 'Failed to load salary data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdated = (updatedEmployee) => {
    setEmployee(updatedEmployee);
    setUpdateOpen(false);
    load();
  };

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
          <button className="btn btn-primary" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="salary-page">
      <div className="add-employee-topbar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <span>Salary & History</span>
      </div>

      <div className="salary-employee-header">
        <div className="salary-employee-avatar">{initials(employee.name)}</div>
        <div>
          <div className="salary-employee-name">{employee.name}</div>
          <div className="salary-employee-role">{employee.jobTitle || employee.role}</div>
        </div>
      </div>

      <div className="salary-current-card">
        <div className="salary-current-row">
          <div className="salary-current-icon">₹</div>
          <span className="salary-current-label">Current Monthly Salary</span>
          <span className="salary-current-value">₹{employee.monthlySalary.toFixed(2)}</span>
        </div>
        <button className="btn btn-primary sheet-submit" onClick={() => setUpdateOpen(true)}>
          ✎ Update Salary
        </button>
      </div>

      <div className="section-header">
        <span>Salary History</span>
        <span className="bills-count-label">{history.length} records</span>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <p>No salary history</p>
        </div>
      ) : (
        <div className="tile-list">
          {history.map((h) => {
            const increase = h.newSalary > h.previousSalary;

            return (
              <div className="salary-history-card" key={h.id}>
                <div className="salary-history-head">
                  <div
                    className="salary-history-icon"
                    style={{
                      background: increase ? `${COLORS.success}1F` : `${COLORS.primary}1F`,
                      color: increase ? COLORS.success : COLORS.primary,
                    }}
                  >
                    {increase ? '↑' : '₹'}
                  </div>
                  <div className="salary-history-body">
                    <div className="salary-history-reason">{h.reason || 'Salary Change'}</div>
                    <div className="salary-history-date">Effective {h.effectiveOn}</div>
                  </div>
                </div>

                <div className="salary-history-values">
                  <div>
                    <div className="salary-value-label">Previous</div>
                    <div className="salary-value-amount">₹{h.previousSalary.toFixed(2)}</div>
                  </div>
                  <span className="salary-arrow">→</span>
                  <div>
                    <div className="salary-value-label">New Salary</div>
                    <div className="salary-value-amount highlight">₹{h.newSalary.toFixed(2)}</div>
                  </div>
                </div>

                {h.createdAt && (
                  <div className="salary-recorded">Recorded {formatDateTime(h.createdAt)}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {updateOpen && (
        <UpdateSalaryModal
          employee={employee}
          onClose={() => setUpdateOpen(false)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}

function UpdateSalaryModal({ employee, onClose, onUpdated }) {
  const [salary, setSalary] = useState('');
  const [effectiveOn, setEffectiveOn] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const value = Number(salary.trim());

    if (!salary.trim()) { setError('Please enter new salary'); return; }
    if (Number.isNaN(value)) { setError('Please enter a valid salary'); return; }
    if (value === employee.monthlySalary) { setError('New salary must differ from current salary.'); return; }

    setSaving(true);
    setError('');

    try {
      const result = await updateSalary(employee.id, {
        monthlySalary: value.toFixed(2),
        effectiveOn,
        reason,
      });
      onUpdated(result.employee);
    } catch (err) {
      console.error('[UpdateSalaryModal] SAVE ERROR:', err);
      setError(err.message || 'Failed to update salary');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <span>Update Salary</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="sheet-body">
          <div className="salary-current-row" style={{ background: '#F4F6FB', borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <span className="salary-current-label">Current Salary</span>
            <span className="salary-current-value" style={{ fontSize: 14, fontWeight: 700 }}>
              ₹{employee.monthlySalary.toFixed(2)}
            </span>
          </div>

          <div className="form-group">
            <label>New Monthly Salary</label>
            <input className="input" type="number" step="0.01" value={salary} onChange={(e) => setSalary(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Effective Date</label>
            <input className="input" type="date" value={effectiveOn} onChange={(e) => setEffectiveOn(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Reason</label>
            <input className="input" placeholder="Annual salary revision" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          {error && <div className="error-text">{error}</div>}

          <button className="btn btn-primary sheet-submit" type="submit" disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Update Salary'}
          </button>
        </form>
      </div>
    </div>
  );
}