/**
 * Currency follows the loaded catalogue: the curated seed is USD, the Kaggle
 * Amazon import is INR. Set VITE_CURRENCY=INR in client/.env when seeding the
 * Kaggle dataset, otherwise ₹1,099 products will print as $1,099.
 */
const CURRENCY = (import.meta.env.VITE_CURRENCY || 'USD').toUpperCase();
const LOCALE = CURRENCY === 'INR' ? 'en-IN' : 'en-US';
const SYMBOL = CURRENCY === 'INR' ? '₹' : '$';

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole units print without decimals: $18 / ₹1,099, but $6.99 keeps them. */
export function formatPrice(value) {
  const n = Number(value) || 0;
  return Number.isInteger(n) ? `${SYMBOL}${n.toLocaleString(LOCALE)}` : currencyFormatter.format(n);
}

/** Compact form for tight spaces like the comparison grid. */
export const formatCompactPrice = (value) => formatPrice(value);

export const discountPercent = (price, mrp) =>
  mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Readable headings for free-form spec keys. `specs` is a Map, so keys vary by
 * category — anything not listed falls back to de-camel-casing the key, which
 * keeps new attributes readable without a code change.
 */
const SPEC_LABELS = {
  // Skincare
  skinType: 'Skin type',
  keyIngredient: 'Key ingredient',
  concentration: 'Strength',
  texture: 'Texture',
  fragrance: 'Fragrance',
  finish: 'Finish',
  usage: 'How to use',
  // Furniture
  lumbarSupport: 'Lumbar support',
  adjustability: 'Adjustability',
  weightCapacity: 'Weight capacity',
  assembly: 'Assembly',
  dimensions: 'Dimensions',
  // Fitness
  terrain: 'Terrain',
  cushioning: 'Cushioning',
  drop: 'Heel drop',
  support: 'Support',
  surface: 'Surface',
  thickness: 'Thickness',
  resistance: 'Resistance',
  weightRange: 'Weight range',
  // Apparel
  insulation: 'Insulation',
  waterproofing: 'Waterproofing',
  season: 'Season',
  fit: 'Fit',
  care: 'Care',
  colour: 'Colours',
  sizes: 'Sizes',
  // Kitchen
  capacity: 'Capacity',
  dishwasherSafe: 'Dishwasher safe',
  heatSources: 'Works on',
  servings: 'Serves',
  hardness: 'Hardness',
  balance: 'Balance',
  // Generic
  material: 'Material',
  size: 'Size',
  weight: 'Weight',
  warranty: 'Warranty',
  includes: 'In the box',
  extras: 'Extras',
  storage: 'Storage',
  safety: 'Safety',
  shelves: 'Shelves',
  bulb: 'Bulb',
  brightness: 'Brightness',
  cord: 'Cord',
  adjustment: 'Adjustment',
};

export function specLabel(key) {
  if (SPEC_LABELS[key]) return SPEC_LABELS[key];
  // "weightCapacity" → "Weight capacity"
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Every product image is a remote URL, so a dead link would leave a blank card.
 * Swap in an on-palette placeholder instead.
 */
export function handleImageError(event) {
  const el = event.currentTarget;
  if (el.dataset.fallbackApplied) return;
  el.dataset.fallbackApplied = 'true';
  el.src =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
         <rect width="600" height="600" fill="#f5f4f1"/>
         <circle cx="300" cy="270" r="86" fill="none" stroke="#b9dcc4" stroke-width="6"/>
         <path d="M258 300l30-34 26 30 22-24 36 42H258z" fill="#8bc4a0"/>
         <text x="300" y="410" text-anchor="middle" fill="#8a8378"
               font-family="Inter,sans-serif" font-size="24">Image unavailable</text>
       </svg>`
    );
}
