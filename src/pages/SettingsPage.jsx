// pages/SettingsPage.jsx
import React, { useState } from 'react';
import { useApp } from '../config/AppContext';
import { clearAllData, clearRecentlyViewed } from '../storage/db';
import { useToast } from '../components/ToastProvider';
import './SettingsPage.css';

const APP_VERSION = '1.0.0';

function SettingsRow({ icon, label, desc, onClick, danger, value }) {
  return (
    <button className={`settings-row ${danger ? 'danger' : ''}`} onClick={onClick}>
      <span className="settings-row-icon">{icon}</span>
      <div className="settings-row-text">
        <span className="settings-row-label">{label}</span>
        {desc && <span className="settings-row-desc">{desc}</span>}
      </div>
      {value ? (
        <span className="settings-row-value">{value}</span>
      ) : (
        <span className="settings-row-arrow">›</span>
      )}
    </button>
  );
}

export default function SettingsPage() {
  const { state, loadData } = useApp();
  const showToast = useToast();
  const [clearing, setClearing] = useState(false);

  const handleClearCache = async () => {
    if (!window.confirm('Clear all app cache and saved data?')) return;
    setClearing(true);
    try {
      await clearAllData();
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      showToast('Cache cleared ✓', 'success');
    } catch {
      showToast('Failed to clear cache', 'error');
    } finally {
      setClearing(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear recently viewed history?')) return;
    await clearRecentlyViewed();
    showToast('History cleared ✓', 'success');
  };

  const handleRefresh = async () => {
    await loadData();
    showToast('Data refreshed ✓', 'success');
  };

  const latestVersion = state.config?.['latest_app_version'] || APP_VERSION;
  const updateAvailable = latestVersion !== APP_VERSION;

  return (
    <div className="page settings-page">
      <div className="settings-container">

        {/* App Info */}
        <div className="settings-section">
          <div className="settings-app-card">
            <div className="settings-app-icon">📚</div>
            <div>
              <h2 className="settings-app-name">PDF Store</h2>
              <p className="settings-app-tagline">Premium Digital Products</p>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="settings-section">
          <p className="settings-section-label">Data & Cache</p>
          <div className="settings-group card">
            <SettingsRow
              icon="🔄"
              label="Refresh Data"
              desc="Fetch latest products from server"
              onClick={handleRefresh}
            />
            <div className="settings-divider" />
            <SettingsRow
              icon="🕐"
              label="Clear Recently Viewed"
              desc="Remove browsing history"
              onClick={handleClearHistory}
            />
            <div className="settings-divider" />
            <SettingsRow
              icon="🗑"
              label={clearing ? 'Clearing…' : 'Clear All Cache'}
              desc="Reset all saved data and cache"
              onClick={handleClearCache}
              danger
            />
          </div>
        </div>

        {/* App */}
        <div className="settings-section">
          <p className="settings-section-label">App</p>
          <div className="settings-group card">
            <SettingsRow
              icon="ℹ️"
              label="App Version"
              value={APP_VERSION}
              onClick={() => {}}
            />
            {updateAvailable && (
              <>
                <div className="settings-divider" />
                <SettingsRow
                  icon="🚀"
                  label="Update Available"
                  desc={`Version ${latestVersion} is available`}
                  value="Update"
                  onClick={() => window.open(state.config?.['update_url'] || '/', '_blank')}
                />
              </>
            )}
            <div className="settings-divider" />
            <SettingsRow
              icon="📊"
              label="Data Source"
              desc="Google Sheets (live sync)"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Support */}
        <div className="settings-section">
          <p className="settings-section-label">Support</p>
          <div className="settings-group card">
            <SettingsRow
              icon="💬"
              label="Support"
              desc={state.config?.['support_email'] || 'Contact us for help'}
              onClick={() => {
                const email = state.config?.['support_email'];
                if (email) window.open(`mailto:${email}`);
              }}
            />
            <div className="settings-divider" />
            <SettingsRow
              icon="🔒"
              label="Privacy Notice"
              desc="How we handle your data"
              onClick={() => alert('All data is stored locally on your device. No personal data is collected or sent to external servers.')}
            />
            <div className="settings-divider" />
            <SettingsRow
              icon="📱"
              label="About App"
              desc="PDF Store is a PWA for premium digital PDF products."
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Footer */}
        <p className="settings-footer">
          Made with ❤️ · PDF Store v{APP_VERSION}<br />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            Data synced from Google Sheets
          </span>
        </p>
      </div>
    </div>
  );
}
