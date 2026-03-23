# PDF Digital Store – PWA

A production-ready Progressive Web App for selling, previewing, and saving PDF-based digital products. All content is sourced dynamically from Google Sheets.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A modern browser (Chrome, Edge, Firefox, Safari)

### 1. Install dependencies
```bash
npm install
```

### 2. Run in development mode
```bash
npm run dev
```
Visit: `http://localhost:5173`

### 3. Build for production
```bash
npm run build
npm run preview   # preview production build locally
```

---

## 📊 Google Sheets Setup

The app reads from this sheet:
**https://docs.google.com/spreadsheets/d/1P6aL26noUdb9G_we8vvcOXpulTlVZKMIpXMi8-hOo6c**

### Required: Publish the Sheet
1. Open your Google Sheet
2. Go to **File → Share → Publish to web**
3. Select **Entire Document** and format **Web page**
4. Click **Publish**
5. This makes the sheet publicly readable (required for the gviz API)

### Sheet Tabs & Columns

#### `Products` tab
| Column | Description |
|--------|-------------|
| id | Unique product ID |
| product_name | Product title |
| category | Main category name |
| subcategory | Subcategory name |
| child_category | Child category name |
| description | Full description |
| short_description | Short preview text |
| price | Price (0 = Free) |
| thumbnail_url | Image URL |
| pdf_link | Direct PDF URL (Google Drive, Dropbox, etc.) |
| author_name | Author name |
| rating | Rating 0-5 |
| keywords | Comma-separated keywords |
| featured | `true` or `false` |
| status | `active` or `inactive` |
| created_at | Date created |

#### `Categories` tab
| Column | Description |
|--------|-------------|
| category_id | Unique ID |
| category_name | Category name |
| subcategory_name | Subcategory |
| child_category_name | Child category |
| status | `active` or `inactive` |

#### `Banners` tab
| Column | Description |
|--------|-------------|
| banner_id | Unique ID |
| banner_title | Banner heading |
| banner_subtitle | Banner subtext |
| banner_image_url | Image URL |
| target_type | `product` or `category` |
| target_value | Product ID or category name |
| status | `active` or `inactive` |
| priority | Sort order (1 = first) |

#### `App_Config` tab
| key | value |
|-----|-------|
| latest_app_version | `1.0.1` (triggers update popup if > current) |
| force_update | `true` or `false` |
| update_url | URL to open for update |
| support_email | support@yourdomain.com |
| app_name | PDF Store |

---

## 📱 PWA Installation

### Android (Chrome)
1. Open the app in Chrome
2. Tap the **"Install"** banner that appears at the bottom
3. Or tap ⋮ menu → **"Add to Home screen"**

### Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Or go to ⋮ menu → **"Install PDF Store"**

### iOS (Safari)
1. Tap the **Share** button
2. Tap **"Add to Home Screen"**

---

## 🗂️ Project Structure

```
pdf-store/
├── public/
│   ├── icons/          # PWA icons (192, 512, apple-touch)
│   ├── manifest.json   # PWA manifest
│   └── offline.html    # Offline fallback page
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── BannerSlider.jsx/css
│   │   ├── BottomNav.jsx/css
│   │   ├── FilterBar.jsx/css
│   │   ├── InstallPrompt.jsx/css
│   │   ├── ProductCard.jsx/css
│   │   ├── SearchBar.jsx/css
│   │   ├── StateViews.jsx/css
│   │   ├── ToastProvider.jsx
│   │   ├── TopBar.jsx/css
│   │   └── UpdatePopup.jsx/css
│   ├── config/
│   │   └── AppContext.jsx   # Global state (React Context)
│   ├── hooks/
│   │   └── useFilteredProducts.js
│   ├── pages/
│   │   ├── SplashScreen.jsx/css
│   │   ├── HomePage.jsx/css
│   │   ├── ProductDetailPage.jsx/css
│   │   ├── CategoriesPage.jsx/css
│   │   ├── RecentlyViewedPage.jsx/css
│   │   ├── SavedPdfsPage.jsx/css
│   │   └── SettingsPage.jsx/css
│   ├── services/
│   │   └── sheetsService.js     # Google Sheets API layer
│   ├── storage/
│   │   └── db.js                # IndexedDB (idb) helpers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                # Design system & global styles
├── index.html
├── vite.config.js               # Vite + PWA plugin config
└── package.json
```

---

## 🔒 Content Protection

The following browser-side deterrents are implemented on PDF preview pages:

| Protection | Implemented |
|------------|-------------|
| Disable right-click | ✅ |
| Block Ctrl+S, Ctrl+P, Ctrl+C | ✅ |
| Block PrintScreen key | ✅ |
| Blur PDF when tab loses focus | ✅ |
| Semi-transparent watermark overlay | ✅ |
| Disable text selection | ✅ |
| Sandboxed iframe | ✅ |

> **Important Limitation:** Browser-based apps **cannot guarantee 100% screenshot prevention** on all devices and browsers. These are strong frontend deterrents, not absolute guarantees. Native OS-level screenshot APIs are outside the reach of web technology.

---

## 🌐 Deploying

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag and drop the `dist/` folder to netlify.com
```

### Any static host
```bash
npm run build
# Upload contents of `dist/` to your server
```

---

## 🔧 Customization

### Change app name/branding
- Edit `index.html` → `<title>`
- Edit `public/manifest.json` → `name`, `short_name`
- Edit `src/components/TopBar.jsx` → `topbar-name`
- Edit `src/pages/SplashScreen.jsx` → title text

### Change Google Sheet
- Edit `src/services/sheetsService.js` → `SHEET_ID`

### Change currency symbol
- Edit `src/components/ProductCard.jsx` → `formatPrice()`
- Edit `src/pages/ProductDetailPage.jsx` → `formatPrice()`

### Change accent color
- Edit `src/index.css` → `--accent` CSS variable

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| react + react-dom | UI framework |
| react-router-dom | Client-side routing |
| idb | IndexedDB wrapper for offline storage |
| vite | Build tool |
| @vitejs/plugin-react | React fast refresh |
| vite-plugin-pwa | Service worker + manifest generation |

---

## ❓ Troubleshooting

**Data not loading?**
- Make sure the Google Sheet is published to web (File → Share → Publish to web)
- Check the Sheet ID in `sheetsService.js`
- Check the browser console for CORS/network errors

**PDF preview not loading?**
- Google Drive PDFs must be set to "Anyone with the link can view"
- Use the direct export URL format: `https://drive.google.com/uc?export=view&id=FILE_ID`

**Install prompt not showing?**
- Must be served over HTTPS in production
- Only appears once if dismissed; clear localStorage to reset

**PWA not updating?**
- The service worker updates automatically on next page load
- Hard reload (Ctrl+Shift+R) to force update in dev

---

## 📄 License
MIT — Free to use and modify.
