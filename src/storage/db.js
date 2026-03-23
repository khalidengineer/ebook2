// storage/db.js
// Browser-side persistent storage using IndexedDB (via idb library).

import { openDB } from 'idb';

const DB_NAME = 'pdf-store-db';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Recently viewed products
        if (!db.objectStoreNames.contains('recentlyViewed')) {
          const store = db.createObjectStore('recentlyViewed', { keyPath: 'id' });
          store.createIndex('viewedAt', 'viewedAt');
        }
        // Saved / offline PDF metadata
        if (!db.objectStoreNames.contains('savedPdfs')) {
          db.createObjectStore('savedPdfs', { keyPath: 'id' });
        }
        // User preferences
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// ── Recently Viewed ──────────────────────────────────────────────────────────

export async function addRecentlyViewed(product) {
  const db = await getDB();
  await db.put('recentlyViewed', { ...product, viewedAt: Date.now() });
  // Keep max 50 items
  const all = await db.getAllFromIndex('recentlyViewed', 'viewedAt');
  if (all.length > 50) {
    const toDelete = all.slice(0, all.length - 50);
    for (const item of toDelete) await db.delete('recentlyViewed', item.id);
  }
}

export async function getRecentlyViewed() {
  const db = await getDB();
  const all = await db.getAllFromIndex('recentlyViewed', 'viewedAt');
  return all.reverse(); // newest first
}

export async function removeRecentlyViewed(id) {
  const db = await getDB();
  await db.delete('recentlyViewed', id);
}

export async function clearRecentlyViewed() {
  const db = await getDB();
  await db.clear('recentlyViewed');
}

// ── Saved PDFs ───────────────────────────────────────────────────────────────

export async function savePdf(product) {
  const db = await getDB();
  await db.put('savedPdfs', { ...product, savedAt: Date.now() });
}

export async function getSavedPdfs() {
  const db = await getDB();
  const all = await db.getAll('savedPdfs');
  return all.sort((a, b) => b.savedAt - a.savedAt);
}

export async function removeSavedPdf(id) {
  const db = await getDB();
  await db.delete('savedPdfs', id);
}

export async function isSaved(id) {
  const db = await getDB();
  const item = await db.get('savedPdfs', id);
  return !!item;
}

// ── Preferences ──────────────────────────────────────────────────────────────

export async function setPreference(key, value) {
  const db = await getDB();
  await db.put('preferences', { key, value });
}

export async function getPreference(key, defaultValue = null) {
  const db = await getDB();
  const item = await db.get('preferences', key);
  return item ? item.value : defaultValue;
}

export async function clearAllData() {
  const db = await getDB();
  await db.clear('recentlyViewed');
  await db.clear('savedPdfs');
  await db.clear('preferences');
}
