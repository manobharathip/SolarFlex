import React from 'react';
import { useStore } from '../store';
import { Moon, Sun, Bell } from 'lucide-react';

function TopBar({ title, subtitle }) {
  const { theme, toggleTheme, data } = useStore();

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h1>{title || 'ColdGrid'}</h1>
        {subtitle && <span>{subtitle}</span>}
      </div>

      <div className="top-bar-right">
        <div className="status-badge success">
          <span className="status-dot" />
          {data.system.status}
        </div>

        <span className="last-sync">{data.system.lastSync}</span>

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className="notification-btn">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}

export default TopBar;