// components/StateViews.jsx
// Loading skeleton, error retry, and empty state views.

import React from 'react';
import './StateViews.css';

export function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-image" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line medium" />
            <div className="skeleton skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{message || 'Failed to load content. Please check your connection.'}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'Nothing here', message = '' }) {
  return (
    <div className="empty-state animate-fadeIn">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}
