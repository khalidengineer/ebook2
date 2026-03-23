// components/ProductCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

function StarRating({ rating }) {
  const stars = Math.round(rating * 2) / 2;
  return (
    <span className="stars" aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ opacity: s <= stars ? 1 : 0.25 }}>★</span>
      ))}
    </span>
  );
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="product-card card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="product-card-image">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="product-card-placeholder" style={{ display: product.thumbnailUrl ? 'none' : 'flex' }}>
          <span>📄</span>
        </div>
        {product.featured && <span className="badge badge-featured product-card-badge">⭐ Featured</span>}
      </div>

      <div className="product-card-body">
        <p className="product-card-category">{product.subcategory || product.category}</p>
        <h3 className="product-card-title">{product.name}</h3>
        {product.shortDescription && (
          <p className="product-card-desc">{product.shortDescription}</p>
        )}
        <div className="product-card-footer">
          <span className="price">{formatPrice(product.price)}</span>
          {product.rating > 0 && <StarRating rating={product.rating} />}
        </div>
      </div>
    </div>
  );
}
