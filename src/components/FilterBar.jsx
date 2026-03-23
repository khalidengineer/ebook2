// components/FilterBar.jsx
// Hierarchical category → subcategory → child category filter chips.

import React, { useMemo } from 'react';
import './FilterBar.css';

export default function FilterBar({ categories, selectedCategory, selectedSubcategory, selectedChild, onChange }) {
  // Derive unique categories
  const cats = useMemo(() => {
    const set = new Set(categories.map((c) => c.categoryName).filter(Boolean));
    return ['All', ...set];
  }, [categories]);

  // Derive subcategories based on selected category
  const subs = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All') return [];
    const set = new Set(
      categories
        .filter((c) => c.categoryName === selectedCategory)
        .map((c) => c.subcategoryName)
        .filter(Boolean)
    );
    return ['All', ...set];
  }, [categories, selectedCategory]);

  // Derive child categories based on selected subcategory
  const children = useMemo(() => {
    if (!selectedSubcategory || selectedSubcategory === 'All') return [];
    const set = new Set(
      categories
        .filter((c) => c.categoryName === selectedCategory && c.subcategoryName === selectedSubcategory)
        .map((c) => c.childCategoryName)
        .filter(Boolean)
    );
    return ['All', ...set];
  }, [categories, selectedCategory, selectedSubcategory]);

  const handleCategory = (cat) => {
    onChange({ category: cat === 'All' ? '' : cat, subcategory: '', child: '' });
  };

  const handleSub = (sub) => {
    onChange({ category: selectedCategory, subcategory: sub === 'All' ? '' : sub, child: '' });
  };

  const handleChild = (child) => {
    onChange({ category: selectedCategory, subcategory: selectedSubcategory, child: child === 'All' ? '' : child });
  };

  return (
    <div className="filter-bar">
      {/* Category row */}
      <div className="scroll-x filter-row">
        {cats.map((cat) => (
          <button
            key={cat}
            className={`chip ${(selectedCategory === cat || (cat === 'All' && !selectedCategory)) ? 'active' : ''}`}
            onClick={() => handleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Subcategory row */}
      {subs.length > 1 && (
        <div className="scroll-x filter-row">
          {subs.map((sub) => (
            <button
              key={sub}
              className={`chip chip-sm ${(selectedSubcategory === sub || (sub === 'All' && !selectedSubcategory)) ? 'active' : ''}`}
              onClick={() => handleSub(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Child category row */}
      {children.length > 1 && (
        <div className="scroll-x filter-row">
          {children.map((child) => (
            <button
              key={child}
              className={`chip chip-sm ${(selectedChild === child || (child === 'All' && !selectedChild)) ? 'active' : ''}`}
              onClick={() => handleChild(child)}
            >
              {child}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
