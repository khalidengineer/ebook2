// pages/SplashScreen.jsx
import React, { useEffect } from 'react';
import { useApp } from '../config/AppContext';
import './SplashScreen.css';

export default function SplashScreen({ onDone }) {
  const { loadData } = useApp();

  useEffect(() => {
    // Start fetching data while splash is shown
    loadData();
    // Show splash for at least 2.2 seconds
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="splash">
      <div className="splash-bg">
        <div className="splash-orb splash-orb-1" />
        <div className="splash-orb splash-orb-2" />
        <div className="splash-grid" />
      </div>

      <div className="splash-content">
        <div className="splash-logo">
          <div className="splash-logo-icon">📚</div>
        </div>
        <h1 className="splash-title">PDF Store</h1>
        <p className="splash-tagline">Premium Digital Products</p>
        <div className="splash-loader">
          <div className="splash-loader-bar" />
        </div>
      </div>

      <p className="splash-version">v1.0.0</p>
    </div>
  );
}
