// components/BottomNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/categories', label: 'Categories', icon: '📂' },
  { path: '/recently-viewed', label: 'Recent', icon: '🕐' },
  { path: '/saved', label: 'Saved', icon: '📥' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ path, label, icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{icon}</span>
          <span className="bottom-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
