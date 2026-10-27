import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout, hasToken } from '../controllers/authController';
import { setForceLogoutHandler } from '../services/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasToken());
  const navigate = useNavigate();

  const login = useCallback(async (email, password) => {
    await apiLogin(email, password);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  // Register this context's logout with apiService so a 401/refresh
  // failure anywhere in the app can force a logout + redirect.
  useEffect(() => {
    setForceLogoutHandler(() => {
      apiLogout();
      setIsAuthenticated(false);
      navigate('/login');
    });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}