// hooks/useFilteredProducts.js
// Returns products filtered by search query + category/subcategory/child hierarchy.

import { useMemo } from 'react';

export default function useFilteredProducts(products, { query, category, subcategory, child }) {
  return useMemo(() => {
    let filtered = products;

    // Category filter
    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (subcategory) {
      filtered = filtered.filter((p) => p.subcategory === subcategory);
    }
    if (child) {
      filtered = filtered.filter((p) => p.childCategory === child);
    }

    // Full-text search
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.childCategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.keywords.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [products, query, category, subcategory, child]);
}
