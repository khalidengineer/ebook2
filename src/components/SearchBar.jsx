// components/SearchBar.jsx
import React, { useRef } from 'react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder = 'Search products, categories...' }) {
  const inputRef = useRef(null);

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        ref={inputRef}
        type="search"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => { onChange(''); inputRef.current?.focus(); }}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
