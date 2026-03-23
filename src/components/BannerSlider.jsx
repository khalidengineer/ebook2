// components/BannerSlider.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './BannerSlider.css';

// Fallback gradient banners if no data from sheets
const FALLBACK_BANNERS = [
  { bannerId: '1', title: 'Premium PDFs', subtitle: 'Discover curated digital products', imageUrl: '', gradient: 'linear-gradient(135deg, #1a2235, #0f172a)' },
  { bannerId: '2', title: 'Top Resources', subtitle: 'Expert knowledge at your fingertips', imageUrl: '', gradient: 'linear-gradient(135deg, #1e1a35, #0a0e1a)' },
];

export default function BannerSlider({ banners }) {
  const items = banners?.length ? banners : FALLBACK_BANNERS;
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const next = () => setCurrent((c) => (c + 1) % items.length);
  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4000);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  const handleBannerClick = (banner) => {
    if (banner.targetType === 'product' && banner.targetValue) {
      navigate(`/product/${banner.targetValue}`);
    } else if (banner.targetType === 'category' && banner.targetValue) {
      navigate(`/?category=${encodeURIComponent(banner.targetValue)}`);
    }
  };

  return (
    <div className="banner-slider">
      <div className="banner-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((banner, i) => (
          <div
            key={banner.bannerId}
            className="banner-slide"
            onClick={() => handleBannerClick(banner)}
            style={{ cursor: banner.targetType ? 'pointer' : 'default' }}
          >
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="banner-img"
                loading="lazy"
              />
            ) : (
              <div className="banner-gradient" style={{ background: banner.gradient || 'linear-gradient(135deg, #1a2235, #0f172a)' }}>
                <div className="banner-pattern" />
              </div>
            )}
            <div className="banner-overlay" />
            <div className="banner-content">
              {banner.title && <h2 className="banner-title">{banner.title}</h2>}
              {banner.subtitle && <p className="banner-subtitle">{banner.subtitle}</p>}
              {banner.targetType && (
                <span className="banner-cta">Explore →</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="banner-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`banner-dot ${i === current ? 'active' : ''}`}
            onClick={() => { setCurrent(i); resetTimer(); }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Prev/Next for desktop */}
      {items.length > 1 && (
        <>
          <button className="banner-nav banner-prev" onClick={() => { prev(); resetTimer(); }}>‹</button>
          <button className="banner-nav banner-next" onClick={() => { next(); resetTimer(); }}>›</button>
        </>
      )}
    </div>
  );
}
