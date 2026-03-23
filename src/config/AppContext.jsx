// config/AppContext.jsx
// Global app state using React Context + useReducer.

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { fetchAllData } from '../services/sheetsService';

const AppContext = createContext(null);

const initialState = {
  products: [],
  categories: [],
  banners: [],
  config: {},
  loading: true,
  error: null,
  lastFetched: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        products: action.payload.products,
        categories: action.payload.categories,
        banners: action.payload.banners,
        config: action.payload.config,
        lastFetched: Date.now(),
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await fetchAllData();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Failed to load data' });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, loadData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
