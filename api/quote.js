// Vercel serverless function - lives at /api/quote once deployed.
const CATALOGS = {
  "modern-metro": require("../catalog/bathroom-catalog-modern-metro.json"),
  "mediterranean-hues": require("../catalog/bathroom-catalog-mediterranean-hues.json"),
  "luxe-living": require("../catalog/bathroom-catalog-luxe-living.json"),
  "vintage-romance": require("../catalog/bathroom-catalog-vintage-romance.json"),
  "eclectic-mix": require("../catalog/bathroom-catalog-eclectic-mix.json"),
  "naturally-beautiful": require("../catalog/bathroom-catalog-naturally-beautiful.json"),
};

const ROOM_LENGTH_M = 3.0;
const ROOM_WIDTH_M = 2.35;
const FLOOR_WASTE_FACTOR = 1.15;
const WALL_TILE_AREA_M2 = 14.25;

function pick(catalog, category, tier) {
  const cat = catalog.categories[category];
  if (!cat) return null;
  const entry = cat[tier];
  if (!entry || entry.price == null) return null;
  return entry;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function buildQuote(style, tier, bathType) {
  const catalog = CATALOGS[style] || CATALOGS["modern-metro"];
  const notes = [];
  const lineItems = [];
  let subtotal = 0;

  // UI sends 'built-in'; catalog keys use underscores ('bath_built_in')
  let bathCategory = `bath_${bathType.replace(/-/g, "_")}`;
  let bath = pick(catalog, bathCategory, tier);
  if (!bath) {
    const fallback = pick(catalog, "bath_freestanding", tier);
    if (fallback) {
      notes.push(
        `Customer selected '${bathType}' bath, but ${catalog.style} style only offers ` +
        `freestanding baths - substituted freestanding, flag this to the customer.`
      );
      bath = fallback;
      bathCategory = "bath_freestanding";
    }
  }
  if (bath) {
    lineItems.push({ category: "Bath", product: bath.product, unit: bath.unit, quantity: "1", cost: bath.price });
    subtotal += bath.price;
  } else {
    notes.push("Bath: no confirmed price yet for this style/tier, excluded from quote.");
  }

  const fixedCategories = [
    ["vanity", "Vanity"], ["toilet", "Toilet"], ["basin_mixer", "Basin mixer"],
    ["bath_mixer", "Bath mixer"], ["shower_mixer", "Shower mixer"],
    ["shower_head", "Shower head"], ["mirror", "Mirror"], ["towel_rail", "Towel rail"],
  ];
  for (const [category, label] of fixedCategories) {
    const item = pick(catalog, category, tier);
    if (item) {
      lineItems.push({ category: label, product: item.product, unit: item.unit, quantity: "1", cost: item.price });
      subtotal += item.price;
    } else {
      notes.push(`${label}: no confirmed price yet for this style/tier, excluded from quote.`);
    }
  }

  const floorArea = round2(ROOM_LENGTH_M * ROOM_WIDTH_M * FLOOR_WASTE_FACTOR);
  const floorTile = pick(catalog, "floor_tile", tier);
  if (floorTile) {
    const cost = round2(floorArea * floorTile.price);
    lineItems.push({
      category: "Floor tile", product: floorTile.product,
      quantity: `${floorArea} m2 (incl. 15% waste)`, cost,
    });
    subtotal += cost;
  } else {
    notes.push("Floor tile: no confirmed price yet, excluded from quote.");
  }

  const wallTile = pick(catalog, "wall_tile", tier);
  if (wallTile) {
    const cost = round2(WALL_TILE_AREA_M2 * wallTile.price);
    lineItems.push({
      category: "Wall tile", product: wallTile.product,
      quantity: `${WALL_TILE_AREA_M2} m2 (bath surround + shower walls)`, cost,
    });
    subtotal += cost;
  } else {
    notes.push("Wall tile: no confirmed price yet for this style/tier, excluded from quote.");
  }

  const groundedCategories = ["Bath", "Vanity", "Toilet", "Floor tile", "Wall tile", "Basin mixer", "Bath mixer", "Shower mixer", "Shower head", "Mirror"];
  const productDescriptions = lineItems
    .filter((li) => groundedCategories.includes(li.category))
    .map((li) => li.product);

  const aiPrompt =
    `Redesign this exact bathroom in the ${catalog.style} style. Keep the same camera angle, ` +
    `room layout, window position and door position as the original photo - only change ` +
    `surfaces and fixtures. Apply these specific products: ${productDescriptions.join("; ")}. ` +
    `Photorealistic, natural lighting, real-estate photography style.`;

  return {
    style: catalog.style,
    tier,
    bath_type_requested: bathType,
    bath_type_used: bath ? bathCategory.replace("bath_", "").replace(/_/g, "-") : null,
    room_size: `${ROOM_LENGTH_M}m x ${ROOM_WIDTH_M}m`,
    line_items: lineItems,
    confirmed_subtotal: round2(subtotal),
    notes_for_christian: notes,
    ai_prompt: aiPrompt,
  };
}

module.exports = (req, res) => {
  const style = String(req.query.style || "modern-metro").toLowerCase();
  const tier = String(req.query.tier || "budget").toLowerCase();
  const bathType = String(req.query.bathType || "freestanding").toLowerCase();

  if (!CATALOGS[style]) {
    res.status(400).json({ error: `style must be one of: ${Object.keys(CATALOGS).join(", ")}` });
    return;
  }

  if (!["budget", "mid", "premium"].includes(tier)) {
    res.status(400).json({ error: "tier must be 'budget', 'mid', or 'premium'" });
    return;
  }

  res.status(200).json(buildQuote(style, tier, bathType));
};
