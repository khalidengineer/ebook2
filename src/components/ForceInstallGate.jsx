// components/ForceInstallGate.jsx
//
// LOGIC:
// 1. Desktop browser  → seedha app dikhao, koi block nahi
// 2. Mobile browser, PWA already installed → app dikhao (isPWA = true)
// 3. Mobile browser, PWA not installed, Chrome/Edge → beforeinstallprompt pakdo,
//    install screen dikhao, tab tak app block
// 4. Mobile browser, iOS Safari → manual "Add to Home Screen" instructions dikhao
// 5. Agar koi mobile pe browser se open kare aur PWA installed bhi ho →
//    deep-link attempt karo (Android Chrome supports this via web-app-identity)
//
// isPWA detection: display-mode: standalone  = PWA ke andar chal raha hai

import React, { useState, useEffect, useRef } from 'react';
import './ForceInstallGate.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function isRunningAsPWA() {
  // standalone = installed PWA (Android/Desktop)
  // fullscreen = some Android TWA
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true // iOS Safari
  );
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ForceInstallGate({ children }) {
  const [status, setStatus] = useState('checking'); // checking | pwa | show-install | ios-install
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const [installDone, setInstallDone] = useState(false);
  const promptCaptured = useRef(false);

  useEffect(() => {
    // Step 1: already running as PWA → let through
    if (isRunningAsPWA()) {
      setStatus('pwa');
      return;
    }

    // Step 2: desktop → let through (only enforce on mobile)
    if (!isMobileDevice()) {
      setStatus('pwa'); // desktop mein block nahi karna
      return;
    }

    // Step 3: mobile browser detected
    if (isIOS()) {
      // iOS mein beforeinstallprompt nahi hota, manual guide dikhao
      setStatus('ios-install');
      return;
    }

    // Step 4: Android / other — wait for beforeinstallprompt
    // If it fires, show our install screen
    const handler = (e) => {
      e.preventDefault();
      promptCaptured.current = true;
      setDeferredPrompt(e);
      setStatus('show-install');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If event doesn't fire within 2.5s (already installed or not supported),
    // check again if running as PWA, else show fallback
    const timer = setTimeout(() => {
      if (!promptCaptured.current) {
        if (isRunningAsPWA()) {
          setStatus('pwa');
        } else {
          // App may already be installed — try to let through
          // (some browsers don't fire the event if already installed)
          setStatus('pwa');
        }
      }
    }, 2500);

    // Also listen for appinstalled event — user installed from browser bar
    const onInstalled = () => {
      setInstallDone(true);
      setTimeout(() => setStatus('pwa'), 1500);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(timer);
    };
  }, []);

  // Trigger native install prompt
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallDone(true);
      setTimeout(() => setStatus('pwa'), 2000);
    } else {
      setInstalling(false);
    }
    setDeferredPrompt(null);
  };

  // ── Checking (brief) ──
  if (status === 'checking') {
    return <div className="fig-checking"><div className="fig-spinner" /></div>;
  }

  // ── PWA / Desktop → render children ──
  if (status === 'pwa') {
    return <>{children}</>;
  }

  // ── Android: show install gate ──
  if (status === 'show-install') {
    return (
      <div className="fig-overlay">
        <div className="fig-bg">
          <div className="fig-orb fig-orb1" />
          <div className="fig-orb fig-orb2" />
        </div>

        <div className="fig-card">
          <div className="fig-app-icon">📚</div>
          <h1 className="fig-title">PDF Store</h1>
          <p className="fig-subtitle">Premium Digital Products</p>

          <div className="fig-divider" />

          {installDone ? (
            <div className="fig-success">
              <div className="fig-success-icon">✅</div>
              <p>App installed! Opening…</p>
            </div>
          ) : (
            <>
              <p className="fig-desc">
                Yeh app sirf <strong>installed PWA</strong> ke through kaam karti hai.<br />
                Browser mein access allowed nahi hai.
              </p>

              <div className="fig-steps">
                <div className="fig-step">
                  <span className="fig-step-num">1</span>
                  <span>Neeche <strong>"Install App"</strong> button dabao</span>
                </div>
                <div className="fig-step">
                  <span className="fig-step-num">2</span>
                  <span>Chrome ka popup aayega — <strong>"Install"</strong> select karo</span>
                </div>
                <div className="fig-step">
                  <span className="fig-step-num">3</span>
                  <span>Home screen se app open karo</span>
                </div>
              </div>

              <button
                className="fig-install-btn"
                onClick={handleInstall}
                disabled={installing}
              >
                {installing ? (
                  <><span className="fig-btn-spinner" /> Installing…</>
                ) : (
                  <>⬇️ Install App</>
                )}
              </button>

              <p className="fig-note">
                Free install • No account needed
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── iOS Safari: manual guide ──
  if (status === 'ios-install') {
    return (
      <div className="fig-overlay">
        <div className="fig-bg">
          <div className="fig-orb fig-orb1" />
          <div className="fig-orb fig-orb2" />
        </div>

        <div className="fig-card">
          <div className="fig-app-icon">📚</div>
          <h1 className="fig-title">PDF Store</h1>
          <p className="fig-subtitle">Premium Digital Products</p>

          <div className="fig-divider" />

          <p className="fig-desc">
            Yeh app sirf <strong>home screen</strong> se kaam karti hai.<br />
            Safari browser mein access allowed nahi hai.
          </p>

          <div className="fig-ios-guide">
            <div className="fig-ios-step">
              <span className="fig-ios-icon">
                {/* Share icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </span>
              <span>Neeche <strong>Share button</strong> (⬆️) dabao</span>
            </div>
            <div className="fig-ios-arrow">↓</div>
            <div className="fig-ios-step">
              <span className="fig-ios-icon">➕</span>
              <span><strong>"Add to Home Screen"</strong> select karo</span>
            </div>
            <div className="fig-ios-arrow">↓</div>
            <div className="fig-ios-step">
              <span className="fig-ios-icon">🏠</span>
              <span>Home screen se app open karo</span>
            </div>
          </div>

          <div className="fig-ios-arrow-indicator">
            <div className="fig-ios-bottom-arrow">↓ Share button neeche hai</div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
