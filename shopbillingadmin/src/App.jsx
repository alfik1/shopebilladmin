import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './views/pages/Login';
import Layout from './views/layout/Layout';
import Home from './views/pages/Home';
import History from './views/pages/History';
import Stock from './views/pages/Stock';
import Collection from './views/pages/Collection';
import Profile from './views/pages/Profile';
import AddEmployee from './views/pages/AddEmployee';
import EmployeeSalary from './views/pages/EmployeeSalary';
import { APP_ROUTES } from './routes/appRoutes';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to={APP_ROUTES.login} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={APP_ROUTES.login} element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path={APP_ROUTES.home} element={<Home />} />
        <Route path={APP_ROUTES.history} element={<History />} />
        <Route path={APP_ROUTES.stock} element={<Stock />} />
        <Route path={APP_ROUTES.collection} element={<Collection />} />
        <Route path={APP_ROUTES.profile} element={<Profile />} />
        <Route path={APP_ROUTES.addEmployee} element={<AddEmployee />} />
        <Route path="/employees/:id/salary" element={<EmployeeSalary />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}