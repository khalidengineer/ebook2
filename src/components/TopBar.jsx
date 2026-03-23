// components/TopBar.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import './TopBar.css';

const PAGE_TITLES = {
  '/': 'PDF Store',
  '/categories': 'Categories',
  '/recently-viewed': 'Recently Viewed',
  '/saved': 'Saved PDFs',
  '/settings': 'Settings',
};

export default function TopBar() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'PDF Store';
  const isHome = location.pathname === '/';

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {isHome ? (
          <div className="topbar-brand">
            <span className="topbar-icon">📚</span>
            <span className="topbar-name">{title}</span>
          </div>
        ) : (
          <h1 className="topbar-title">{title}</h1>
        )}
      </div>
    </header>
  );
}
