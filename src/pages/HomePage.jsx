// pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../config/AppContext';
import BannerSlider from '../components/BannerSlider';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import { LoadingGrid, ErrorState, EmptyState } from '../components/StateViews';
import useFilteredProducts from '../hooks/useFilteredProducts';
import './HomePage.css';

export default function HomePage() {
  const { state, loadData } = useApp();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedChild, setSelectedChild] = useState('');

  // Handle category from banner click
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const filteredProducts = useFilteredProducts(state.products, {
    query,
    category: selectedCategory,
    subcategory: selectedSubcategory,
    child: selectedChild,
  });

  const featuredProducts = state.products.filter((p) => p.featured);

  const handleFilterChange = ({ category, subcategory, child }) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedChild(child);
  };

  return (
    <div className="page home-page">
      {/* Banner Slider */}
      <BannerSlider banners={state.banners} />

      <div className="home-content">
        {/* Search */}
        <div className="home-section">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {/* Filters */}
        {state.categories.length > 0 && (
          <div className="home-section">
            <FilterBar
              categories={state.categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              selectedChild={selectedChild}
              onChange={handleFilterChange}
            />
          </div>
        )}

        {state.loading ? (
          <div className="home-section">
            <LoadingGrid count={6} />
          </div>
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={loadData} />
        ) : (
          <>
            {/* Featured Products – only show when not filtering */}
            {!query && !selectedCategory && featuredProducts.length > 0 && (
              <div className="home-section">
                <h2 className="section-title">⭐ Featured</h2>
                <div className="featured-scroll scroll-x">
                  {featuredProducts.map((p) => (
                    <div key={p.id} className="featured-item">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All / Filtered Products */}
            <div className="home-section">
              <h2 className="section-title">
                {query || selectedCategory ? '🔍 Results' : '📚 All Products'}
                <span className="section-count">{filteredProducts.length}</span>
              </h2>

              {filteredProducts.length === 0 ? (
                <EmptyState
                  icon="📭"
                  title="No products found"
                  message={query ? `No results for "${query}"` : 'No products in this category yet.'}
                />
              ) : (
                <div className="grid-2 animate-fadeIn">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Refresh button */}
        {!state.loading && (
          <div className="home-section home-refresh">
            <button className="btn btn-ghost refresh-btn" onClick={loadData}>
              🔄 Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
