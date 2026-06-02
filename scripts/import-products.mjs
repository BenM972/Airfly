#!/usr/bin/env node

/**
 * Import produits WooCommerce - AIRFLY Surf Shop
 * Source: docs/Produits site internet.xlsx
 */

const WC_URL = process.env.WC_URL;
const WP_EMAIL = process.env.WP_APP_USER_EMAIL;
const WP_APP_PASS = process.env.WP_APP_PASSWORD;
const BASE = `${WC_URL}/wp-json/wc/v3`;

const AUTH_HEADER = 'Basic ' + Buffer.from(`${WP_EMAIL}:${WP_APP_PASS}`).toString('base64');

// ─── WooCommerce fetch helper ─────────────────────────────────────────────────

async function wc(path, method = 'GET', body = null, extraParams = {}) {
  const params = new URLSearchParams(extraParams);
  const url = params.toString() ? `${BASE}${path}?${params}` : `${BASE}${path}`;
  const headers = { Authorization: AUTH_HEADER };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`WC ${method} ${path} → ${res.status}: ${JSON.stringify(data).slice(0, 400)}`);
  }
  return data;
}

// ─── Categories ───────────────────────────────────────────────────────────────

async function ensureCategory(name, parentId = 0) {
  const cats = await wc('/products/categories', 'GET', null, { search: name, per_page: '50' });
  const existing = cats.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() && c.parent === parentId
  );
  if (existing) {
    console.log(`  ↳ Catégorie existante : ${name} (id: ${existing.id})`);
    return existing.id;
  }
  const cat = await wc('/products/categories', 'POST', { name, parent: parentId });
  console.log(`  ✓ Catégorie créée : ${name} (id: ${cat.id})`);
  return cat.id;
}

// ─── Product creation ─────────────────────────────────────────────────────────

async function createProduct({ name, sku, colors, sizes, price, stock }, categoryIds) {
  const hasColors = colors.length > 0;
  const hasSizes = sizes.length > 1 || (sizes.length === 1 && sizes[0] !== 'Taille unique');
  const isSingleSize = sizes.length === 1 && sizes[0] === 'Taille unique';
  const isVariable = hasColors || hasSizes;

  const attributes = [];
  if (hasColors) {
    attributes.push({ name: 'Couleur', visible: true, variation: true, options: colors });
  }
  if (hasSizes || isSingleSize) {
    attributes.push({ name: 'Taille', visible: true, variation: isSingleSize ? false : true, options: sizes });
  }

  const payload = {
    name,
    ...(sku ? { sku } : {}),
    type: isVariable ? 'variable' : 'simple',
    status: 'publish',
    regular_price: String(price),
    categories: categoryIds.map((id) => ({ id })),
    attributes,
    manage_stock: true,
    stock_quantity: stock,
  };

  console.log(`\nCréation : ${name}`);
  const product = await wc('/products', 'POST', payload);

  if (isVariable && product.id) {
    const variations = buildVariations(colors, hasSizes ? sizes : [], price);
    if (variations.length > 0) {
      // Batch par 50 (limite WC)
      for (let i = 0; i < variations.length; i += 50) {
        const batch = variations.slice(i, i + 50);
        await wc(`/products/${product.id}/variations/batch`, 'POST', { create: batch });
      }
      console.log(`  → ${variations.length} variation(s) créée(s)`);
    }
  }

  return product;
}

function buildVariations(colors, sizes, price) {
  const variations = [];
  const priceStr = String(price);

  if (colors.length > 0 && sizes.length > 0) {
    for (const color of colors) {
      for (const size of sizes) {
        variations.push({
          regular_price: priceStr,
          attributes: [
            { name: 'Couleur', option: color },
            { name: 'Taille', option: size },
          ],
        });
      }
    }
  } else if (colors.length > 0) {
    for (const color of colors) {
      variations.push({
        regular_price: priceStr,
        attributes: [{ name: 'Couleur', option: color }],
      });
    }
  } else if (sizes.length > 0) {
    for (const size of sizes) {
      variations.push({
        regular_price: priceStr,
        attributes: [{ name: 'Taille', option: size }],
      });
    }
  }

  return variations;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function sizeRange(start, end, suffix = '') {
  const sizes = [];
  for (let i = start; i <= end; i++) sizes.push(suffix ? `${i} ${suffix}` : String(i));
  return sizes;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TEXTILE_AIRFLY = [
  {
    name: 'T-shirt Airfly Femme',
    colors: ['Noir', 'Blanc'],
    sizes: ['S', 'M', 'L'],
    price: 25,
    stock: 4,
  },
  {
    name: 'T-shirt Airfly Homme',
    colors: ['Noir', 'Blanc', 'Kaki'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    price: 25,
    stock: 4,
  },
  {
    name: 'T-shirt Airfly Enfants',
    colors: ['Noir', 'Blanc'],
    sizes: ['4 ans', '6 ans', '8 ans', '10 ans', '12 ans'],
    price: 20,
    stock: 4,
  },
  {
    name: 'Casquette Airfly',
    colors: ['Noir'],
    sizes: ['Taille unique'],
    price: 25,
    stock: 5,
  },
];

const TEXTILE_ZANDOLI = [
  {
    name: 'Stick solaire Seventy One',
    colors: ['Invisible', 'Bleu', 'Rose', 'Blanc', 'Marron'],
    sizes: [],
    price: 20,
    stock: 8,
  },
  {
    name: 'Sac de plage Zandoli',
    colors: ['Rose', 'Blanc', 'Noir', 'Kaki', 'Beige'],
    sizes: [],
    price: 25,
    stock: 6,
  },
  {
    name: 'Tongs pailletes léopard Zandoli Femme',
    colors: ['Noir', 'Marron', 'Beige'],
    sizes: sizeRange(37, 42),
    price: 14.90,
    stock: 4,
  },
  {
    name: 'Tongs lanière tissu Zandoli Homme',
    colors: ['Noir', 'Kaki', 'Bleu marine', 'Marron'],
    sizes: sizeRange(38, 47),
    price: 19.90,
    stock: 6,
  },
];

const SALTY_CREW_FEMME = [
  {
    name: 'Robe Mainland Salty Crew',
    sku: '21035122W',
    colors: ['Noir', 'Bleu'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 65,
    stock: 1,
  },
  {
    name: 'Robe Mainland Salty Crew (Bleu/Ocre)',
    sku: '21035122W-B',
    colors: ['Bleu', 'Ocre'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 69.95,
    stock: 1,
  },
  {
    name: 'Bloomed Surfsuit Salty Crew',
    sku: '75035022W',
    colors: ['Noir'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 99.95,
    stock: 1,
  },
  {
    name: 'Ray Days Surfsuit Salty Crew',
    sku: '75035010W',
    colors: ['Orchidé'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 94.95,
    stock: 1,
  },
  {
    name: 'T-shirt Tippet Cali Salty Crew',
    sku: '25035041W',
    colors: ['Blanc', 'Bleu marine'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 39.95,
    stock: 1,
  },
  {
    name: 'Croptop Even Keel Salty Crew',
    sku: '20035884W',
    colors: ['Taupe', 'Bleu'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 39.95,
    stock: 1,
  },
  {
    name: 'Débardeur Out To Sea Salty Crew',
    sku: '20635260W',
    colors: ['Turquoise', 'Abricot'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 34.95,
    stock: 1,
  },
  {
    name: 'Pantalon Driftwood Salty Crew',
    sku: '30135063W',
    colors: ['Noir', 'Kaki', 'Bleu marine'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 69.95,
    stock: 1,
  },
  {
    name: "T-shirt Sailors Delight Raglan Salty Crew",
    sku: '25035037W',
    colors: ['Bordeaux', 'Bleu'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 39.95,
    stock: 1,
  },
  {
    name: 'Crop top Fish Bowl Salty Crew',
    sku: '20035796W',
    colors: ['Marron', 'Bleu'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 39.95,
    stock: 1,
  },
];

const SALTY_CREW_HOMME = [
  {
    name: 'Débardeur Yellowfin Salty Crew',
    sku: '20635210',
    colors: ['Blanc', 'Bleu'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    price: 35.90,
    stock: 1,
  },
  {
    name: 'Mariner LS Tech Tee Salty Crew',
    sku: '20135556',
    colors: ['Camo'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    price: 62,
    stock: 1,
  },
  {
    name: 'Lycra Jimmy Hooded Salty Crew',
    sku: '20135645',
    colors: ['Marron', 'Gris'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    price: 65,
    stock: 1,
  },
  {
    name: 'Lycra perforé Apex Salty Crew',
    sku: '20135588',
    colors: ['Bleu', 'Turquoise'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    price: 69.95,
    stock: 1,
  },
  {
    name: 'Lycra Original Salty Crew',
    sku: '20135647',
    colors: ['Gris', 'Jaune'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    price: 65,
    stock: 1,
  },
  {
    name: 'Chapeau de paille Big Blue Salty Crew',
    sku: '120992',
    colors: [],
    sizes: ['Taille unique'],
    price: 45,
    stock: 1,
  },
  {
    name: 'Sweat Tippet Hood Tech Tee Salty Crew',
    sku: '20135565',
    colors: ['Noir', 'Gris', 'Bleu'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    price: 69.95,
    stock: 1,
  },
  {
    name: 'T-shirt manches longues Bruce Salty Crew',
    sku: '20135070',
    colors: ['Kaki'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    price: 49.95,
    stock: 1,
  },
  {
    name: 'Boardshort Sidebar Salty Crew',
    sku: '30335171',
    colors: ['Gris'],
    sizes: sizeRange(30, 38),
    price: 75.95,
    stock: 1,
  },
  {
    name: 'Boardshort Bloomin Salty Crew',
    sku: '30335173',
    colors: ['Noir'],
    sizes: sizeRange(30, 38),
    price: 75.95,
    stock: 1,
  },
  {
    name: 'T-shirt Tako Club Classic Salty Crew',
    sku: '25035080',
    colors: ['Bleu ciel'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    price: 43.95,
    stock: 1,
  },
];

const MATERIEL = [
  { name: 'Adaptateur pompe Duotone', sku: '44210-8068', colors: [], sizes: [], price: 6.90, stock: 4 },
  { name: "Wing Leash wrist coiled 5'5 Duotone", sku: '42250-7201', colors: [], sizes: [], price: 39.90, stock: 4 },
  { name: "Wing Wrist Leash 4' Duotone", sku: '44200-8013', colors: [], sizes: [], price: 39.90, stock: 4 },
  { name: 'Harness Line Wing 35,5"/90cm Duotone', sku: '48220-7070', colors: [], sizes: [], price: 29, stock: 4 },
  { name: 'Tuyau pompe Duotone', sku: '44210-8066', colors: [], sizes: [], price: 14.90, stock: 4 },
  { name: 'Chicken Loop S Duotone', sku: '44210-8131-S', colors: [], sizes: [], price: 44.90, stock: 3 },
  { name: 'Chicken Loop Trust L Duotone', sku: '44210-8131-L', colors: [], sizes: [], price: 44.90, stock: 3 },
  { name: 'Chicken Dig Trust S Duotone', sku: '44210-8142-S', colors: [], sizes: [], price: 12.90, stock: 3 },
  { name: 'Chicken Dig Trust L Duotone', sku: '44210-8142-L', colors: [], sizes: [], price: 12.90, stock: 3 },
  { name: 'Leash Kite Tec Safety Court Duotone', sku: '48240-7202', colors: ['Rose', 'Noir', 'Gris'], sizes: [], price: 69.99, stock: 6 },
  { name: 'Leash Handlepass Webbing Long 100/160 Duotone', sku: '48210-7067', colors: [], sizes: [], price: 52.90, stock: 3 },
  { name: 'Pompe Duotone XL', sku: '44200-7060', colors: [], sizes: [], price: 69.90, stock: 4 },
  { name: "Leash SUP Core Ankle 10' Duotone", sku: '48210-7050', colors: [], sizes: [], price: 59, stock: 4 },
  { name: "Leash SUP Tec Coiled Ankle 8' Duotone", sku: '48210-7052', colors: [], sizes: [], price: 54.90, stock: 4 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Import produits WooCommerce - AIRFLY');
  console.log('═══════════════════════════════════════════\n');

  // Catégories
  console.log('── Catégories ──────────────────────────────');
  const catTextile = await ensureCategory('Textile');
  const catMateriel = await ensureCategory('Matériel');
  const catAirfly = await ensureCategory('Airfly', catTextile);
  const catZandoli = await ensureCategory('Zandoli', catTextile);
  const catSCFemme = await ensureCategory('Salty Crew Femme', catTextile);
  const catSCHomme = await ensureCategory('Salty Crew Homme', catTextile);

  // Airfly
  console.log('\n── Airfly ──────────────────────────────────');
  for (const p of TEXTILE_AIRFLY) {
    await createProduct(p, [catAirfly, catTextile]);
  }

  // Zandoli
  console.log('\n── Zandoli ─────────────────────────────────');
  for (const p of TEXTILE_ZANDOLI) {
    await createProduct(p, [catZandoli, catTextile]);
  }

  // Salty Crew Femme
  console.log('\n── Salty Crew Femme ────────────────────────');
  for (const p of SALTY_CREW_FEMME) {
    await createProduct(p, [catSCFemme, catTextile]);
  }

  // Salty Crew Homme
  console.log('\n── Salty Crew Homme ────────────────────────');
  for (const p of SALTY_CREW_HOMME) {
    await createProduct(p, [catSCHomme, catTextile]);
  }

  // Matériel
  console.log('\n── Matériel ────────────────────────────────');
  for (const p of MATERIEL) {
    await createProduct(p, [catMateriel]);
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Import terminé !');
  console.log('═══════════════════════════════════════════');
}

main().catch((err) => {
  console.error('\n❌ Erreur :', err.message);
  process.exit(1);
});
