import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Email and password are required');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    console.debug('[Login] submitting login for', email);

    try {
      await login(email, password);
      console.debug('[Login] success, navigating to /');
      navigate('/');
    } catch (err) {
      console.error('[Login] failed ->', err);
      setErrorMessage('Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M14 2v5h5" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M8 12h8M8 15.5h8M8 9h4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <h1>Welcome Back</h1>
        <p>Login to manage your shop billing</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <div className="input-with-icon">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-with-icon">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6"/>
            </svg>
            <input
              type={obscurePassword ? 'password' : 'text'}
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="input-suffix-btn"
              onClick={() => setObscurePassword((v) => !v)}
              aria-label={obscurePassword ? 'Show password' : 'Hide password'}
            >
              {obscurePassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M10.6 10.6a2 2 0 1 0 2.8 2.8" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M6.6 6.7C4.5 8.1 3 10.2 2 12c1.6 3 5 7 10 7 1.7 0 3.2-.4 4.5-1.1M9.9 5.2A10.4 10.4 0 0 1 12 5c5 0 8.4 4 10 7-.5.9-1.2 1.9-2 2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.6"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="login-forgot">
          <button type="button" className="link-btn">Forgot Password?</button>
        </div>

        {errorMessage && <div className="error-text">{errorMessage}</div>}

        <button className="btn btn-primary login-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <span className="spinner" /> : 'Login'}
        </button>

        <div className="login-footer">
          Don't have an account? <span className="login-footer-link">Contact Admin</span>
        </div>
      </form>
    </div>
  );
}