// components/UpdatePopup.jsx
// Compares current app version with latest_app_version from App_Config sheet.

import React, { useState, useEffect } from 'react';
import { useApp } from '../config/AppContext';
import './UpdatePopup.css';

const CURRENT_VERSION = '1.0.0';

function versionGreater(latest, current) {
  const a = latest.split('.').map(Number);
  const b = current.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}

export default function UpdatePopup() {
  const { state } = useApp();
  const [show, setShow] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [updateUrl, setUpdateUrl] = useState('');

  useEffect(() => {
    if (!state.config || Object.keys(state.config).length === 0) return;
    const latestVersion = state.config['latest_app_version'];
    const force = state.config['force_update'] === 'true';
    const url = state.config['update_url'] || '/';
    if (latestVersion && versionGreater(latestVersion, CURRENT_VERSION)) {
      setForceUpdate(force);
      setUpdateUrl(url);
      setShow(true);
    }
  }, [state.config]);

  if (!show) return null;

  return (
    <div className="update-overlay">
      <div className="update-popup animate-slideUp">
        <div className="update-icon">🚀</div>
        <h2 className="update-title">Update Available</h2>
        <p className="update-desc">
          A new version of PDF Store is available. Update now for the latest features and improvements.
        </p>
        <a
          href={updateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary update-btn"
        >
          Update Now
        </a>
        {!forceUpdate && (
          <button className="btn btn-ghost" onClick={() => setShow(false)}>
            Later
          </button>
        )}
      </div>
    </div>
  );
}
