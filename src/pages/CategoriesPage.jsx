// pages/CategoriesPage.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../config/AppContext';
import { LoadingGrid, EmptyState } from '../components/StateViews';
import './CategoriesPage.css';

export default function CategoriesPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [expandedCat, setExpandedCat] = useState(null);

  // Build category tree
  const tree = useMemo(() => {
    const map = {};
    state.categories.forEach((c) => {
      const cat = c.categoryName;
      if (!cat) return;
      if (!map[cat]) map[cat] = { name: cat, subcategories: {} };
      const sub = c.subcategoryName;
      if (sub) {
        if (!map[cat].subcategories[sub]) map[cat].subcategories[sub] = [];
        const child = c.childCategoryName;
        if (child) map[cat].subcategories[sub].push(child);
      }
    });
    return Object.values(map);
  }, [state.categories]);

  // Count products per category
  const countFor = (cat, sub, child) => {
    return state.products.filter((p) => {
      if (child) return p.category === cat && p.subcategory === sub && p.childCategory === child;
      if (sub) return p.category === cat && p.subcategory === sub;
      return p.category === cat;
    }).length;
  };

  const browse = (cat, sub, child) => {
    let url = `/?category=${encodeURIComponent(cat)}`;
    navigate(url);
  };

  if (state.loading) return <div className="page"><div style={{ padding: 16 }}><LoadingGrid count={4} /></div></div>;

  return (
    <div className="page categories-page">
      <div className="cat-container">
        {tree.length === 0 ? (
          <EmptyState icon="📂" title="No categories yet" message="Categories will appear here once added in the sheet." />
        ) : (
          tree.map((cat) => {
            const isExpanded = expandedCat === cat.name;
            const subs = Object.keys(cat.subcategories);
            const count = countFor(cat.name);

            return (
              <div key={cat.name} className="cat-group card">
                <button
                  className="cat-row"
                  onClick={() => {
                    setExpandedCat(isExpanded ? null : cat.name);
                    if (subs.length === 0) browse(cat.name);
                  }}
                >
                  <div className="cat-icon">📁</div>
                  <div className="cat-info">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-count">{count} products</span>
                  </div>
                  <span className="cat-arrow" style={{ transform: isExpanded ? 'rotate(90deg)' : '' }}>›</span>
                </button>

                {isExpanded && subs.length > 0 && (
                  <div className="cat-sub-list">
                    {subs.map((sub) => (
                      <button
                        key={sub}
                        className="cat-sub-row"
                        onClick={() => browse(cat.name, sub)}
                      >
                        <span className="cat-sub-dot">◦</span>
                        <span className="cat-sub-name">{sub}</span>
                        <span className="cat-sub-count">{countFor(cat.name, sub)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
