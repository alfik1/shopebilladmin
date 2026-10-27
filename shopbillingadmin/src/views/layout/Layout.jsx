import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-area">
        <Topbar title="Shop Billing" onMenuClick={() => setSidebarOpen(true)} />

        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}