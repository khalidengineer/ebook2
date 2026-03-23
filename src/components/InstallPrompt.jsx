// components/InstallPrompt.jsx
// Shows a native-style install banner for PWA home screen installation.

import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already installed and not dismissed recently
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShow(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="install-prompt animate-slideUp">
      <div className="install-prompt-icon">📚</div>
      <div className="install-prompt-text">
        <strong>Install PDF Store</strong>
        <span>Add to home screen for quick access</span>
      </div>
      <div className="install-prompt-actions">
        <button className="btn btn-primary install-btn" onClick={handleInstall}>Install</button>
        <button className="btn btn-ghost" onClick={handleDismiss}>✕</button>
      </div>
    </div>
  );
}
