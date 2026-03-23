// pages/ProductDetailPage.jsx
// CONTENT PROTECTION NOTE:
// Browser-based apps cannot guarantee 100% screenshot prevention on all devices/browsers.
// We implement the strongest practical frontend deterrents:
//  - Disable right-click on PDF preview area
//  - Disable common keyboard shortcuts (Ctrl+S, Ctrl+P, Ctrl+C, PrintScreen)
//  - Blur PDF viewer when tab loses focus
//  - Overlay watermark on the PDF preview
//  - Disable text selection in preview area
// These are deterrents only — determined users on some platforms can still capture screens.

// PDF VIEWER STRATEGY (Chrome-compatible):
// Chrome blocks direct PDF iframes from many origins due to X-Frame-Options / CSP.
// Solution: Use Google Docs Viewer (viewer.google.com) which wraps any public PDF URL
// and renders it as HTML — no Chrome blocking. Falls back to PDF.js CDN viewer.

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../config/AppContext';
import { addRecentlyViewed, savePdf, isSaved, removeSavedPdf } from '../storage/db';
import { useToast } from '../components/ToastProvider';
import './ProductDetailPage.css';

// ─── PDF URL helpers ──────────────────────────────────────────────────────────

/**
 * Convert any Google Drive share/view URL to a direct download URL.
 * e.g. https://drive.google.com/file/d/FILE_ID/view  →  direct export url
 */
function toDirectPdfUrl(url) {
  if (!url) return url;
  // Already a direct uc?export link
  if (url.includes('drive.google.com/uc')) return url;
  // drive.google.com/file/d/ID/view  or  /open?id=ID
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?\s]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }
  const openMatch = url.match(/[?&]id=([^&\s]+)/);
  if (url.includes('drive.google.com') && openMatch) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }
  return url;
}

/**
 * Build Google Docs Viewer URL for any publicly accessible PDF.
 * This bypasses Chrome's iframe PDF block because Google renders it as HTML.
 */
function toGoogleDocsViewerUrl(rawUrl) {
  const direct = toDirectPdfUrl(rawUrl);
  return `https://docs.google.com/viewer?url=${encodeURIComponent(direct)}&embedded=true`;
}

/**
 * Build PDF.js CDN viewer URL as a fallback.
 */
function toPdfJsViewerUrl(rawUrl) {
  const direct = toDirectPdfUrl(rawUrl);
  return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(direct)}`;
}

function StarRating({ rating }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ opacity: s <= Math.round(rating) ? 1 : 0.25 }}>★</span>
      ))}
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const showToast = useToast();

  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfBlurred, setPdfBlurred] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // viewer: 'google' | 'pdfjs' | 'direct'
  const [viewerMode, setViewerMode] = useState('google');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const previewRef = useRef(null);

  const product = state.products.find((p) => p.id === id);

  // Track recently viewed & check saved state
  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
      isSaved(product.id).then(setSaved);
    }
  }, [product]);

  // ─── Content protection event listeners ──────────────────────────────────
  useEffect(() => {
    if (!showPreview) return;

    // Disable right-click
    const noContext = (e) => e.preventDefault();
    // Block keyboard shortcuts
    const noKeys = (e) => {
      const blockedCombos = [
        e.ctrlKey && e.key === 's',   // Save
        e.ctrlKey && e.key === 'p',   // Print
        e.ctrlKey && e.key === 'c',   // Copy
        e.ctrlKey && e.key === 'u',   // View source
        e.key === 'PrintScreen',
        e.metaKey && e.key === 's',
        e.metaKey && e.key === 'p',
      ];
      if (blockedCombos.some(Boolean)) {
        e.preventDefault();
        showToast('Content is protected', 'error');
        return false;
      }
    };
    // Blur PDF when tab is inactive
    const onBlur = () => setPdfBlurred(true);
    const onFocus = () => setPdfBlurred(false);

    document.addEventListener('contextmenu', noContext);
    document.addEventListener('keydown', noKeys);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('contextmenu', noContext);
      document.removeEventListener('keydown', noKeys);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [showPreview]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (saved) {
      await removeSavedPdf(product.id);
      setSaved(false);
      showToast('Removed from saved PDFs');
    } else {
      await savePdf(product);
      setSaved(true);
      showToast('Saved for offline access ✓', 'success');
    }
  };

  const handleDownload = async () => {
    if (!product.pdfLink) { showToast('No PDF link available', 'error'); return; }
    setDownloading(true);
    try {
      const response = await fetch(product.pdfLink);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${product.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Download started ✓', 'success');
    } catch {
      showToast('Download failed. Try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const formatPrice = (price) => price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`;

  if (state.loading) {
    return (
      <div className="detail-loading">
        <div className="skeleton" style={{ width: '100%', height: 300 }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80 }}>
        <p style={{ fontSize: '3rem' }}>🔍</p>
        <h2 style={{ fontFamily: 'var(--font-display)', marginTop: 12 }}>Product not found</h2>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="page detail-page">
      {/* Back button */}
      <button className="detail-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="detail-container">
        {/* Hero */}
        <div className="detail-hero">
          {product.thumbnailUrl ? (
            <img src={product.thumbnailUrl} alt={product.name} className="detail-hero-img" />
          ) : (
            <div className="detail-hero-placeholder">📄</div>
          )}
          {product.featured && <span className="badge badge-featured detail-featured-badge">⭐ Featured</span>}
        </div>

        {/* Info */}
        <div className="detail-info">
          {/* Breadcrumb */}
          <div className="detail-breadcrumb">
            {[product.category, product.subcategory, product.childCategory].filter(Boolean).join(' › ')}
          </div>

          <h1 className="detail-title">{product.name}</h1>

          {product.authorName && (
            <p className="detail-author">by {product.authorName}</p>
          )}

          {product.rating > 0 && <StarRating rating={product.rating} />}

          <div className="detail-price">{formatPrice(product.price)}</div>

          {/* Action buttons */}
          <div className="detail-actions">
            {product.pdfLink && (
              <button
                className="btn btn-primary detail-btn"
                onClick={() => {
                  setViewerMode('google');
                  setLoadAttempt(0);
                  setPdfLoading(true);
                  setShowPreview(true);
                }}
              >
                👁 Preview PDF
              </button>
            )}
            <button
              className={`btn detail-btn ${saved ? 'btn-secondary' : 'btn-secondary'}`}
              onClick={handleSave}
            >
              {saved ? '💾 Saved' : '📥 Save Offline'}
            </button>
            {product.pdfLink && (
              <button
                className="btn btn-secondary detail-btn"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? '⏳ Downloading…' : '⬇️ Download PDF'}
              </button>
            )}
          </div>

          {/* Description */}
          <div className="detail-section">
            <h3 className="detail-section-title">About this product</h3>
            <p className="detail-description">{product.description || product.shortDescription}</p>
          </div>

          {product.keywords && (
            <div className="detail-section">
              <h3 className="detail-section-title">Tags</h3>
              <div className="detail-tags">
                {product.keywords.split(',').map((k) => k.trim()).filter(Boolean).map((tag) => (
                  <span key={tag} className="badge badge-secondary">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── PDF Preview Modal ─── */}
      {showPreview && (
        <div
          className="pdf-modal"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div className="pdf-modal-inner">
            {/* Header */}
            <div className="pdf-modal-header">
              <span className="pdf-modal-title">{product.name}</span>
              <div className="pdf-modal-header-actions">
                {/* Viewer mode switcher */}
                <div className="pdf-viewer-toggle">
                  {['google', 'pdfjs', 'direct'].map((mode) => (
                    <button
                      key={mode}
                      className={`pdf-toggle-btn ${viewerMode === mode ? 'active' : ''}`}
                      onClick={() => { setViewerMode(mode); setPdfLoading(true); setLoadAttempt(a => a + 1); }}
                      title={mode === 'google' ? 'Google Viewer' : mode === 'pdfjs' ? 'PDF.js Viewer' : 'Direct'}
                    >
                      {mode === 'google' ? 'G' : mode === 'pdfjs' ? 'P' : 'D'}
                    </button>
                  ))}
                </div>
                <button className="btn btn-icon" onClick={() => setShowPreview(false)}>✕</button>
              </div>
            </div>

            {/* Viewer */}
            <div
              className={`pdf-viewer-wrap ${pdfBlurred ? 'blurred' : ''}`}
              ref={previewRef}
              onContextMenu={(e) => e.preventDefault()}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              {/* Watermark overlay */}
              <div className="pdf-watermark" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i}>PDF Store • Preview Only</span>
                ))}
              </div>

              {pdfBlurred && (
                <div className="pdf-blur-overlay">
                  <p>🔒 Return to app to continue viewing</p>
                </div>
              )}

              {pdfLoading && (
                <div className="pdf-loading">
                  <div className="pdf-spinner" />
                  <p>Loading preview…</p>
                  <span className="pdf-loading-hint">
                    {viewerMode === 'google' ? 'Using Google Docs Viewer' : viewerMode === 'pdfjs' ? 'Using PDF.js Viewer' : 'Direct embed'}
                  </span>
                </div>
              )}

              {/* Smart iframe — switches between Google Docs Viewer, PDF.js, and direct */}
              <PdfFrame
                key={`${viewerMode}-${loadAttempt}`}
                pdfLink={product.pdfLink}
                viewerMode={viewerMode}
                onLoad={() => setPdfLoading(false)}
                onError={() => {
                  setPdfLoading(false);
                  // Auto-fallback chain: google → pdfjs → direct
                  if (viewerMode === 'google') {
                    showToast('Switching to PDF.js viewer…');
                    setViewerMode('pdfjs');
                    setPdfLoading(true);
                  } else if (viewerMode === 'pdfjs') {
                    showToast('Switching to direct viewer…');
                    setViewerMode('direct');
                    setPdfLoading(true);
                  } else {
                    showToast('Could not load PDF. Check the link is publicly accessible.', 'error');
                  }
                }}
              />
            </div>

            <p className="pdf-protection-note">
              🔒 This preview is protected. Downloading or sharing is not permitted.
              {viewerMode !== 'google' && (
                <button
                  className="pdf-retry-btn"
                  onClick={() => { setViewerMode('google'); setPdfLoading(true); setLoadAttempt(a => a + 1); }}
                >
                  Try Google Viewer
                </button>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PdfFrame component ──────────────────────────────────────────────────────
// Renders correct iframe src based on viewerMode.
// Google Docs Viewer: works for most public PDFs, bypasses Chrome block.
// PDF.js CDN: open-source viewer, works for direct URLs.
// Direct: raw iframe (may be blocked by Chrome for some hosts).
function PdfFrame({ pdfLink, viewerMode, onLoad, onError }) {
  const src = viewerMode === 'google'
    ? toGoogleDocsViewerUrl(pdfLink)
    : viewerMode === 'pdfjs'
    ? toPdfJsViewerUrl(pdfLink)
    : toDirectPdfUrl(pdfLink);

  return (
    <iframe
      src={src}
      title="PDF Preview"
      className="pdf-frame"
      onLoad={onLoad}
      onError={onError}
      // No sandbox restriction — Google viewer needs full access
      allow="autoplay"
    />
  );
}
