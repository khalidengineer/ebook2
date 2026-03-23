// pages/RecentlyViewedPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentlyViewed, removeRecentlyViewed, clearRecentlyViewed } from '../storage/db';
import { EmptyState } from '../components/StateViews';
import { useToast } from '../components/ToastProvider';
import './RecentlyViewedPage.css';

export default function RecentlyViewedPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const showToast = useToast();

  const load = async () => {
    setLoading(true);
    const data = await getRecentlyViewed();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    await removeRecentlyViewed(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast('Removed from history');
  };

  const handleClearAll = async () => {
    await clearRecentlyViewed();
    setItems([]);
    showToast('History cleared');
  };

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'Just now';
  };

  return (
    <div className="page rv-page">
      <div className="rv-container">
        {items.length > 0 && (
          <div className="rv-header">
            <span className="rv-count">{items.length} items</span>
            <button className="btn btn-ghost rv-clear" onClick={handleClearAll}>
              Clear All
            </button>
          </div>
        )}

        {loading ? (
          <div className="rv-skeletons">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rv-skeleton">
                <div className="skeleton" style={{ width: 64, height: 80, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton skeleton-line" style={{ height: 12 }} />
                  <div className="skeleton skeleton-line short" style={{ height: 10, width: '60%' }} />
                  <div className="skeleton skeleton-line" style={{ height: 10, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="🕐"
            title="No recent history"
            message="Products you view will appear here automatically."
          />
        ) : (
          <div className="rv-list">
            {items.map((item) => (
              <div
                key={item.id}
                className="rv-card card"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <div className="rv-thumb">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.name} loading="lazy" />
                  ) : (
                    <span>📄</span>
                  )}
                </div>
                <div className="rv-info">
                  <p className="rv-category">{item.subcategory || item.category}</p>
                  <h3 className="rv-title">{item.name}</h3>
                  <div className="rv-meta">
                    <span className="rv-price">
                      {item.price === 0 ? 'Free' : `₹${item.price?.toLocaleString('en-IN')}`}
                    </span>
                    <span className="rv-time">{formatTime(item.viewedAt)}</span>
                  </div>
                </div>
                <button
                  className="rv-remove"
                  onClick={(e) => handleRemove(e, item.id)}
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
