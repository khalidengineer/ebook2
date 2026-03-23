// services/sheetsService.js
// Fetches data from Google Sheets using the public JSON feed.
// The sheet must be published to the web (File > Share > Publish to web).

const SHEET_ID = '1P6aL26noUdb9G_we8vvcOXpulTlVZKMIpXMi8-hOo6c';

// Build URL for a specific sheet tab using Google Sheets CSV export
const getSheetUrl = (tabName) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;

/**
 * Parse Google Sheets gviz JSON response into an array of plain objects.
 * The response wraps JSON in a callback: google.visualization.Query.setResponse({...})
 */
function parseGvizResponse(text) {
  // Strip the JSONP wrapper
  const json = text.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
  const data = JSON.parse(json);
  const cols = data.table.cols.map((c) => c.label || c.id);
  const rows = (data.table.rows || []).map((row) => {
    const obj = {};
    row.c.forEach((cell, i) => {
      obj[cols[i]] = cell ? (cell.v !== null && cell.v !== undefined ? cell.v : '') : '';
    });
    return obj;
  });
  return rows;
}

/**
 * Fetch a single sheet tab and return parsed rows.
 */
async function fetchTab(tabName) {
  try {
    const res = await fetch(getSheetUrl(tabName));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return parseGvizResponse(text);
  } catch (err) {
    console.error(`[sheetsService] Error fetching tab "${tabName}":`, err);
    return [];
  }
}

/**
 * Fetch all required tabs in parallel and return structured data.
 */
export async function fetchAllData() {
  const [products, categories, banners, appConfig] = await Promise.all([
    fetchTab('Products'),
    fetchTab('Categories'),
    fetchTab('Banners'),
    fetchTab('App_Config'),
  ]);

  // Normalize products
  const normalizedProducts = products
    .filter((p) => String(p.status || '').toLowerCase() === 'active')
    .map((p) => ({
      id: String(p.id || p.product_id || Math.random()),
      name: String(p.product_name || p.name || ''),
      category: String(p.category || ''),
      subcategory: String(p.subcategory || ''),
      childCategory: String(p.child_category || ''),
      description: String(p.description || ''),
      shortDescription: String(p.short_description || p.description || '').slice(0, 120),
      price: parseFloat(p.price) || 0,
      thumbnailUrl: String(p.thumbnail_url || p.thumbnail || ''),
      pdfLink: String(p.pdf_link || p.pdf_url || ''),
      authorName: String(p.author_name || p.author || ''),
      rating: parseFloat(p.rating) || 0,
      keywords: String(p.keywords || ''),
      featured: String(p.featured || '').toLowerCase() === 'true' || p.featured === true,
      status: String(p.status || ''),
      createdAt: String(p.created_at || ''),
    }));

  // Normalize categories
  const normalizedCategories = categories
    .filter((c) => String(c.status || '').toLowerCase() !== 'inactive')
    .map((c) => ({
      categoryId: String(c.category_id || c.id || Math.random()),
      categoryName: String(c.category_name || c.category || ''),
      subcategoryName: String(c.subcategory_name || c.subcategory || ''),
      childCategoryName: String(c.child_category_name || c.child_category || ''),
    }));

  // Normalize banners
  const normalizedBanners = banners
    .filter((b) => String(b.status || '').toLowerCase() === 'active')
    .sort((a, b) => (parseInt(a.priority) || 99) - (parseInt(b.priority) || 99))
    .map((b) => ({
      bannerId: String(b.banner_id || b.id || Math.random()),
      title: String(b.banner_title || b.title || ''),
      subtitle: String(b.banner_subtitle || b.subtitle || ''),
      imageUrl: String(b.banner_image_url || b.image_url || b.image || ''),
      targetType: String(b.target_type || ''),
      targetValue: String(b.target_value || ''),
      priority: parseInt(b.priority) || 99,
    }));

  // Normalize app config
  const config = {};
  appConfig.forEach((row) => {
    if (row.key) config[String(row.key)] = String(row.value || '');
  });

  return { products: normalizedProducts, categories: normalizedCategories, banners: normalizedBanners, config };
}
