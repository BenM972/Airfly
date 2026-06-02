#!/usr/bin/env node

/**
 * Import produits SeventyOne Percent - AIRFLY Surf Shop
 * Source: Catalogue SeventyOne 2024 FR
 */

const WC_URL = process.env.WC_URL ?? 'https://yellow-swan-973770.hostingersite.com';
const WP_EMAIL = process.env.WP_APP_USER_EMAIL ?? 'b.maubert34@gmail.com';
const WP_APP_PASS = process.env.WP_APP_PASSWORD ?? 'pX5L H41P OhJh iBEk V1AN Xuvh';
const BASE = `${WC_URL}/wp-json/wc/v3`;
const AUTH = 'Basic ' + Buffer.from(`${WP_EMAIL}:${WP_APP_PASS}`).toString('base64');

async function wc(path, method = 'GET', body = null, params = {}) {
  const qs = new URLSearchParams(params);
  const url = qs.toString() ? `${BASE}${path}?${qs}` : `${BASE}${path}`;
  const headers = { Authorization: AUTH };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(`WC ${method} ${path} → ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

async function ensureCategory(name, parentId = 0) {
  const cats = await wc('/products/categories', 'GET', null, { search: name, per_page: '50' });
  const existing = cats.find(c => c.name.toLowerCase() === name.toLowerCase() && c.parent === parentId);
  if (existing) { console.log(`  ↳ Existe : ${name} (${existing.id})`); return existing.id; }
  const cat = await wc('/products/categories', 'POST', { name, parent: parentId });
  console.log(`  ✓ Créée  : ${name} (${cat.id})`);
  return cat.id;
}

async function createProduct({ name, type = 'simple', colors, sizes, formats, price, stock = 1, shortDesc, catIds }) {
  const hasColors = colors?.length > 0;
  const hasSizes = sizes?.length > 1;
  const hasFormats = formats?.length > 0;
  const isVariable = hasColors || hasSizes || hasFormats;

  const attributes = [];
  if (hasColors)   attributes.push({ name: 'Couleur',  visible: true, variation: true, options: colors });
  if (hasSizes)    attributes.push({ name: 'Taille',   visible: true, variation: true, options: sizes });
  if (hasFormats)  attributes.push({ name: 'Format',   visible: true, variation: true, options: formats.map(f => f.label) });

  const payload = {
    name,
    type: isVariable ? 'variable' : 'simple',
    status: 'publish',
    regular_price: String(price),
    short_description: shortDesc ?? '',
    categories: catIds.map(id => ({ id })),
    attributes,
    manage_stock: !isVariable,
    stock_quantity: isVariable ? null : stock,
  };

  console.log(`\nCréation : ${name}`);
  const product = await wc('/products', 'POST', payload);

  if (isVariable && product.id) {
    const variations = [];
    if (hasColors && !hasSizes && !hasFormats) {
      colors.forEach(c => variations.push({ regular_price: String(price), attributes: [{ name: 'Couleur', option: c }] }));
    } else if (hasColors && hasSizes) {
      colors.forEach(c => sizes.forEach(s => variations.push({ regular_price: String(price), attributes: [{ name: 'Couleur', option: c }, { name: 'Taille', option: s }] })));
    } else if (hasFormats) {
      formats.forEach(f => variations.push({ regular_price: String(f.price), attributes: [{ name: 'Format', option: f.label }] }));
    } else if (hasSizes) {
      sizes.forEach(s => variations.push({ regular_price: String(price), attributes: [{ name: 'Taille', option: s }] }));
    }
    for (let i = 0; i < variations.length; i += 50) {
      await wc(`/products/${product.id}/variations/batch`, 'POST', { create: variations.slice(i, i + 50) });
    }
    console.log(`  → ${variations.length} variation(s)`);
  }
  return product;
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Import SeventyOne Percent - AIRFLY');
  console.log('═══════════════════════════════════════════════════\n');

  // ── Catégories
  console.log('── Catégories ─────────────────────────────────────');
  const catSoins    = await ensureCategory('Soins Solaires');
  const catGoWild   = await ensureCategory('Go Wild', catSoins);
  const catSunKiss  = await ensureCategory('Sun Kissed', catSoins);
  const catFeelGood = await ensureCategory('Feel Good', catSoins);

  // ── GO WILD ─────────────────────────────────────────────────────────────────
  console.log('\n── Go Wild ────────────────────────────────────────');

  await createProduct({
    name: 'Sun Stick SPF 50+ SeventyOne Percent',
    colors: ['Blanc', 'Ocean Blue', 'Sunset', 'Pacha Mama'],
    price: 17.90,
    stock: 8,
    shortDesc: 'Très haute protection visage SPF 50+. 87 à 92% naturels, vegan, water-resistant. Best-seller ELLE & Vogue. 15g.',
    catIds: [catGoWild, catSoins],
  });

  await createProduct({
    name: 'Invisible Sun Stick SPF 50 SeventyOne Percent',
    price: 17.90,
    stock: 4,
    shortDesc: 'Premier stick solaire Eco Label. Filtres clean nouvelle génération, ultra-efficaces et à très faible impact sur la biodiversité marine. 80% naturel, vegan. 15g.',
    catIds: [catGoWild, catSoins],
  });

  await createProduct({
    name: 'Eco Sun Shield SPF 50+ SeventyOne Percent',
    price: 24.90,
    stock: 4,
    shortDesc: 'Très haute protection visage/sport. 100% minéral non nano, 100% naturel. Le produit préféré des surfeurs. Format pocket 50ml.',
    catIds: [catGoWild, catSoins],
  });

  await createProduct({
    name: 'Second Skin SeventyOne Percent',
    price: 14.90,
    stock: 4,
    shortDesc: 'Soin huile en baume multi-usage. Protect, soothe & repair. 100% naturel, papaye fermentée & cire d\'abeille. Le must-have des surfeurs. 30ml.',
    catIds: [catGoWild, catSoins],
  });

  // ── SUN KISSED ──────────────────────────────────────────────────────────────
  console.log('\n── Sun Kissed ─────────────────────────────────────');

  await createProduct({
    name: 'Sun Kissed Sun Stick SPF 50 SeventyOne Percent',
    price: 17.90,
    stock: 4,
    shortDesc: 'Haute protection visage & zones sensibles. 80% naturel, vegan. Filtres clean validés Eco Label. 15g.',
    catIds: [catSunKiss, catSoins],
  });

  await createProduct({
    name: 'Sun Kissed Sun Stick SPF 30 SeventyOne Percent',
    price: 17.90,
    stock: 4,
    shortDesc: 'Protection visage & zones sensibles SPF 30. 80% naturel, vegan. Filtres clean, Eco Label. Nouveau 2024. 15g.',
    catIds: [catSunKiss, catSoins],
  });

  await createProduct({
    name: 'Eco Sun Shield Invisible SPF 50+ SeventyOne Percent',
    price: 24.90,
    stock: 4,
    shortDesc: 'Très haute protection visage. 99% naturel, minéral non nano. Filtres minéraux respectueux de l\'épiderme et de l\'environnement. Vegan. 50ml.',
    catIds: [catSunKiss, catSoins],
  });

  await createProduct({
    name: 'Eco Sun Spray SPF 50+ SeventyOne Percent',
    price: 29.90,
    stock: 4,
    shortDesc: 'Lait solaire très haute protection corps. Best-seller. SPF 50+, 100% minéral non nano, 99% naturel. Protection famille toute entière. 100ml.',
    catIds: [catSunKiss, catSoins],
  });

  await createProduct({
    name: 'Dry Sun Oil SPF 30 SeventyOne Percent',
    price: 29.90,
    stock: 4,
    shortDesc: 'Huile solaire visage/corps/cheveux SPF 30. 3 en 1, 80% naturel, vegan. Parfum jasmin & tiaré. Toucher velours, sans film gras. 100ml.',
    catIds: [catSunKiss, catSoins],
  });

  await createProduct({
    name: 'Cool Kids Sun Fluid SPF 50+ SeventyOne Percent',
    price: 29.90,
    stock: 4,
    shortDesc: 'Très haute protection enfants invisible. SPF 50+, dès 1 an. 82% naturel, very water-resistant. Fini invisible, parfum vanille. 100ml.',
    catIds: [catSunKiss, catSoins],
  });

  // ── FEEL GOOD ───────────────────────────────────────────────────────────────
  console.log('\n── Feel Good ──────────────────────────────────────');

  await createProduct({
    name: 'Feel Free SPF 30 SeventyOne Percent',
    price: 29.90,
    stock: 4,
    shortDesc: 'Fluide visage SPF 30 perfect combo. Anti-pollution & lumière bleue. 85% naturel, acide hyaluronique, prébiotique. Vegan. 40ml.',
    catIds: [catFeelGood, catSoins],
  });

  await createProduct({
    name: 'Feel Good SeventyOne Percent',
    formats: [{ label: '75ml', price: 15.90 }, { label: '200ml', price: 29.90 }],
    price: 15.90,
    stock: 4,
    shortDesc: 'Gel fondant hydratant universel. Après-soleil, prolonge le bronzage, lait démaquillant. 100% naturel, aloe vera. Vegan.',
    catIds: [catFeelGood, catSoins],
  });

  await createProduct({
    name: 'Feel Good Oil SeventyOne Percent',
    price: 29.90,
    stock: 4,
    shortDesc: 'Huile visage ultra protectrice & anti-oxydante. 99% naturel. Glow & mood booster, anti-lumière bleue. Anti-pollution. 50ml.',
    catIds: [catFeelGood, catSoins],
  });

  await createProduct({
    name: 'Feel Better SeventyOne Percent',
    price: 24.90,
    stock: 4,
    shortDesc: 'Baume apaisant ultra nourrissant visage & zones sensibles. Soin de nuit & après-soleil. 100% naturel, papaye fermentée. 40ml.',
    catIds: [catFeelGood, catSoins],
  });

  await createProduct({
    name: 'Feel the Glow SeventyOne Percent',
    price: 34.90,
    stock: 4,
    shortDesc: 'Sérum de jeunesse & brume protectrice UVA. Formule ultra concentrée. 90% naturel. ROKA INSIDE : 8h de protection UVA anti-âge. 50ml.',
    catIds: [catFeelGood, catSoins],
  });

  await createProduct({
    name: 'Feel Golden SPF 30 SeventyOne Percent',
    price: 29.90,
    stock: 4,
    shortDesc: 'Perfecteur naturel teinté SPF 30 longue durée. Hydrate, protège et matifie. 82% naturel, niacinamide & acide hyaluronique. ROKA INSIDE. 40ml.',
    catIds: [catFeelGood, catSoins],
  });

  await createProduct({
    name: "Sirens' Secret SeventyOne Percent",
    price: 24.90,
    stock: 4,
    shortDesc: 'Huile capillaire protectrice UV defense. Protège couleurs & éclat, anti-frisottis, sans rinçage. 98% naturel. ROKA INSIDE 8h. 50ml.',
    catIds: [catFeelGood, catSoins],
  });

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ✅ Import SeventyOne Percent terminé !');
  console.log('═══════════════════════════════════════════════════');
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1); });
