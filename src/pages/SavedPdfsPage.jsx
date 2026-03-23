// pages/SavedPdfsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedPdfs, removeSavedPdf } from '../storage/db';
import { EmptyState } from '../components/StateViews';
import { useToast } from '../components/ToastProvider';
import './SavedPdfsPage.css';

export default function SavedPdfsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const showToast = useToast();

  const load = async () => {
    setLoading(true);
    const data = await getSavedPdfs();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    await removeSavedPdf(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast('Removed from saved PDFs');
  };

  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="page saved-page">
      <div className="saved-container">
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="📥"
            title="No saved PDFs"
            message="Save PDFs from any product page to access their details offline."
          />
        ) : (
          <>
            <p className="saved-note">
              💡 Saved metadata persists offline. Open product pages while online to preview or download.
            </p>
            <div className="saved-list">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="saved-card card"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div className="saved-thumb">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.name} loading="lazy" />
                    ) : (
                      <span>📄</span>
                    )}
                  </div>

                  <div className="saved-info">
                    <p className="saved-category">{item.subcategory || item.category}</p>
                    <h3 className="saved-title">{item.name}</h3>
                    {item.authorName && (
                      <p className="saved-author">by {item.authorName}</p>
                    )}
                    <div className="saved-meta">
                      <span className="saved-price">
                        {item.price === 0 ? 'Free' : `₹${item.price?.toLocaleString('en-IN')}`}
                      </span>
                      <span className="saved-date">Saved {formatDate(item.savedAt)}</span>
                    </div>
                  </div>

                  <div className="saved-actions">
                    <span className="saved-badge">💾</span>
                    <button
                      className="saved-remove"
                      onClick={(e) => handleRemove(e, item.id)}
                      aria-label="Remove saved PDF"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
