import React from 'react';
import { useStore } from '../store';
import {
  LayoutDashboard,
  Box,
  BrainCircuit,
  Sun,
  BarChart2,
  Bell,
  Settings,
  Info
} from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'modules', label: 'Modules', icon: Box },
  { id: 'adaptive-control', label: 'Adaptive Control', icon: BrainCircuit },
  { id: 'energy', label: 'Energy', icon: Sun },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'alerts', label: 'Alerts & Logs', icon: Bell }
];

function Sidebar() {
  const { setActivePage } = useStore();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>ColdGrid</h1>
        <span>Modular Solar Cold Storage</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="nav-item"
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-item">
          <Settings size={18} />
          <span>Settings</span>
        </div>
        <div className="sidebar-footer-item">
          <Info size={18} />
          <span>System Information</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;