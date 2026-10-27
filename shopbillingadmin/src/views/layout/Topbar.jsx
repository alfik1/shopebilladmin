import { useNavigate } from 'react-router-dom';
import { IconMenu, IconProfile } from '../components/Icons';
import { APP_ROUTES } from '../../routes/appRoutes';

export default function Topbar({ title, onMenuClick }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <IconMenu />
        </button>
        <div className="topbar-title">{title}</div>
      </div>

      <button
        className="topbar-profile-btn"
        aria-label="Profile"
        onClick={() => navigate(APP_ROUTES.profile)}
      >
        <IconProfile size={18} />
      </button>
    </header>
  );
}