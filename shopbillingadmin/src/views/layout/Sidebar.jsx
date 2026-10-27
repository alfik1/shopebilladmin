import { NavLink } from 'react-router-dom';
import { APP_ROUTES } from '../../routes/appRoutes';
import { IconHome, IconHistory, IconStock, IconCollection, IconProfile, IconLogout, IconClose } from '../components/Icons';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: APP_ROUTES.home, label: 'Home', Icon: IconHome, end: true },
  { to: APP_ROUTES.history, label: 'History', Icon: IconHistory },
  { to: APP_ROUTES.stock, label: 'Stock', Icon: IconStock },
  { to: APP_ROUTES.collection, label: 'Collection', Icon: IconCollection },
  { to: APP_ROUTES.profile, label: 'Profile', Icon: IconProfile },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
          <IconClose />
        </button>

        <div className="sidebar-logo">
          Shop<span>Billing</span>
        </div>

        <nav>
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={logout}>
            <IconLogout size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}