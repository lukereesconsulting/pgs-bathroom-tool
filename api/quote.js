// Vercel serverless function - lives at /api/quote once deployed.
const CATALOGS = {
  "modern-metro": require("../catalog/bathroom-catalog-modern-metro.json"),
  "mediterranean-hues": require("../catalog/bathroom-catalog-mediterranean-hues.json"),
  "luxe-living": require("../catalog/bathroom-catalog-luxe-living.json"),
  "vintage-romance": require("../catalog/bathroom-catalog-vintage-romance.json"),
  "eclectic-mix": require("../catalog/bathroom-catalog-eclectic-mix.json"),
  "naturally-beautiful": require("../catalog/bathroom-catalog-naturally-beautiful.json"),
};
const PLUMBLINK = require("../catalog/plumbing-catalog-plumblink.json");

// Fallback room size, used when the customer doesn't provide real dimensions.
// Also the baseline the original hardcoded wall-tile-area assumption (14.25m2)
// was based on - we scale that assumption proportionally to whatever room
// size is actually entered (see wallTileArea below).
const BASE_LENGTH_M = 3.0;
const BASE_WIDTH_M = 2.35;
const FLOOR_WASTE_FACTOR = 1.15;
const BASE_WALL_TILE_AREA_M2 = 14.25;
const BASE_PERIMETER_M = 2 * (BASE_LENGTH_M + BASE_WIDTH_M);

// Floor area (before waste factor) at/above which a bathroom gets the fuller
// storage option instead of the compact one. ~6m2 is roughly the boundary
// between a "small" and a "comfortable family" bathroom in SA sizing guides.
const STORAGE_SIZE_THRESHOLD_M2 = 6;

// Categories Plumblink actually sells (plumbing fixtures only - no tiles,
// vanities, mirrors, towel rails or storage furniture). Bath is handled
// separately below since Plumblink only has freestanding, not built-in.
const PLUMBLINK_CATEGORIES = ["toilet", "basin_mixer", "bath_mixer", "shower_mixer", "shower_head", "bath_freestanding"];

function pick(catalog, category, tier) {
  const cat = catalog.categories[category];
  if (!cat) return null;
  const entry = cat[tier];
  if (!entry || entry.price == null) return null;
  return entry;
}

// Picks a category's product, preferring Plumblink when requested and
// available; otherwise falls back to the style's Tile Africa catalog.
// Always returns which supplier the item actually came from, so the
// frontend can group the quote into labelled sections.
function pickWithSupplier(catalog, category, tier, wantPlumblink) {
  if (wantPlumblink && PLUMBLINK_CATEGORIES.includes(category)) {
    const plumblinkEntry = pick(PLUMBLINK, category, tier);
    if (plumblinkEntry) return { entry: plumblinkEntry, supplier: "Plumblink" };
  }
  const entry = pick(catalog, category, tier);
  return entry ? { entry, supplier: "Tile Africa" } : { entry: null, supplier: null };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Customer-entered dimensions in metres; falls back to the old hardcoded
// default and is clamped to a plausible domestic bathroom range so a bad
// input can't produce a nonsense quote.
function sanitizeRoomDim(value, fallback) {
  const n = parseFloat(value);
  if (!isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.max(n, 1.2), 8);
}

function isValidRoomDim(value) {
  const n = parseFloat(value);
  return isFinite(n) && n > 0;
}

function buildQuote(style, tier, bathType, roomLength, roomWidth, supplier) {
  const catalog = CATALOGS[style] || CATALOGS["modern-metro"];
  const wantPlumblink = supplier === "plumblink";
  const notes = [];
  const lineItems = [];
  let subtotal = 0;

  const length = sanitizeRoomDim(roomLength, BASE_LENGTH_M);
  const width = sanitizeRoomDim(roomWidth, BASE_WIDTH_M);
  const rawFloorArea = round2(length * width);
  const perimeter = 2 * (length + width);

  // UI sends 'built-in'; catalog keys use underscores ('bath_built_in').
  // Plumblink only stocks freestanding baths (see catalog known_gaps), so a
  // built-in request under the Plumblink toggle always comes from Tile Africa.
  let bathCategory = `bath_${bathType.replace(/-/g, "_")}`;
  let bath = null;
  let bathSupplier = null;
  if (bathCategory === "bath_freestanding") {
    const picked = pickWithSupplier(catalog, "bath_freestanding", tier, wantPlumblink);
    bath = picked.entry;
    bathSupplier = picked.supplier;
  } else {
    const built = pick(catalog, "bath_built_in", tier);
    if (built) {
      bath = built;
      bathSupplier = "Tile Africa";
      if (wantPlumblink) {
        notes.push("Built-in bath isn't sold by Plumblink, so this line still comes from Tile Africa.");
      }
    }
  }
  if (!bath) {
    const fallback = pickWithSupplier(catalog, "bath_freestanding", tier, wantPlumblink);
    if (fallback.entry) {
      notes.push(
        `Customer selected '${bathType}' bath, but ${catalog.style} style only offers ` +
        `freestanding baths - substituted freestanding, flag this to the customer.`
      );
      bath = fallback.entry;
      bathSupplier = fallback.supplier;
      bathCategory = "bath_freestanding";
    }
  }
  if (bath) {
    lineItems.push({ category: "Bath", product: bath.product, unit: bath.unit, quantity: "1", cost: bath.price, supplier: bathSupplier });
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
    const { entry: item, supplier: itemSupplier } = pickWithSupplier(catalog, category, tier, wantPlumblink);
    if (item) {
      lineItems.push({ category: label, product: item.product, unit: item.unit, quantity: "1", cost: item.price, supplier: itemSupplier });
      subtotal += item.price;
    } else {
      notes.push(`${label}: no confirmed price yet for this style/tier, excluded from quote.`);
    }
  }

  // Storage: which product is quoted depends on the room's actual floor area,
  // not the style/tier alone - a small bathroom gets a space-saving option,
  // a larger one gets a fuller freestanding/wall-hung unit. Always Tile
  // Africa - Plumblink doesn't sell bathroom storage furniture.
  const storageCategory = rawFloorArea >= STORAGE_SIZE_THRESHOLD_M2 ? "storage_full" : "storage_compact";
  const storageItem = pick(catalog, storageCategory, tier);
  if (storageItem) {
    lineItems.push({ category: "Storage", product: storageItem.product, unit: storageItem.unit, quantity: "1", cost: storageItem.price, supplier: "Tile Africa" });
    subtotal += storageItem.price;
  } else {
    notes.push("Storage: no confirmed price yet for this style/tier, excluded from quote.");
  }

  const floorArea = round2(rawFloorArea * FLOOR_WASTE_FACTOR);
  const floorTile = pick(catalog, "floor_tile", tier);
  if (floorTile) {
    const cost = round2(floorArea * floorTile.price);
    lineItems.push({
      category: "Floor tile", product: floorTile.product,
      quantity: `${floorArea} m2 (incl. 15% waste)`, cost, supplier: "Tile Africa",
    });
    subtotal += cost;
  } else {
    notes.push("Floor tile: no confirmed price yet, excluded from quote.");
  }

  // Wall tile area isn't measured (it's bath surround + shower walls, not the
  // whole room), so we scale the original hardcoded assumption proportionally
  // to the room's perimeter. This is an estimate, disclosed below - not a
  // substitute for an on-site measurement.
  const wallTileArea = round2(BASE_WALL_TILE_AREA_M2 * (perimeter / BASE_PERIMETER_M));
  const wallTile = pick(catalog, "wall_tile", tier);
  if (wallTile) {
    const cost = round2(wallTileArea * wallTile.price);
    lineItems.push({
      category: "Wall tile", product: wallTile.product,
      quantity: `${wallTileArea} m2 (bath surround + shower walls, estimated)`, cost, supplier: "Tile Africa",
    });
    subtotal += cost;
  } else {
    notes.push("Wall tile: no confirmed price yet for this style/tier, excluded from quote.");
  }
  notes.push(
    `Wall tile area (${wallTileArea} m2) is estimated from your room dimensions, not measured on site - ` +
    `Christian will confirm the exact figure during a site visit.`
  );

  const groundedCategories = ["Bath", "Vanity", "Toilet", "Floor tile", "Wall tile", "Basin mixer", "Bath mixer", "Shower mixer", "Shower head", "Mirror", "Storage"];
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
    supplier: wantPlumblink ? "plumblink" : "tile-africa",
    bath_type_requested: bathType,
    bath_type_used: bath ? bathCategory.replace("bath_", "").replace(/_/g, "-") : null,
    room_size: `${length}m x ${width}m`,
    room_size_source: (isValidRoomDim(roomLength) && isValidRoomDim(roomWidth)) ? "customer-entered" : "default estimate",
    floor_area_m2: rawFloorArea,
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
  const roomLength = req.query.roomLength;
  const roomWidth = req.query.roomWidth;
  const supplier = String(req.query.supplier || "tile-africa").toLowerCase();

  if (!CATALOGS[style]) {
    res.status(400).json({ error: `style must be one of: ${Object.keys(CATALOGS).join(", ")}` });
    return;
  }

  if (!["budget", "mid", "premium"].includes(tier)) {
    res.status(400).json({ error: "tier must be 'budget', 'mid', or 'premium'" });
    return;
  }

  if (!["tile-africa", "plumblink"].includes(supplier)) {
    res.status(400).json({ error: "supplier must be 'tile-africa' or 'plumblink'" });
    return;
  }

  res.status(200).json(buildQuote(style, tier, bathType, roomLength, roomWidth, supplier));
};
