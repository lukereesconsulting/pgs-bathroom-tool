// Vercel serverless function - lives at /api/quote once deployed.
const catalog = require("../catalog/bathroom-catalog-modern-metro.json");

const ROOM_LENGTH_M = 3.0;
const ROOM_WIDTH_M = 2.35;
const FLOOR_WASTE_FACTOR = 1.15;
const WALL_TILE_AREA_M2 = 14.25;

function pick(category, tier) {
  const cat = catalog.categories[category];
  if (!cat) return null;
  const entry = cat[tier];
  if (!entry || entry.price == null) return null;
  return entry;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function buildQuote(tier, bathType) {
  const notes = [];
  const lineItems = [];
  let subtotal = 0;

  let bathCategory = `bath_${bathType}`;
  let bath = pick(bathCategory, tier);
  if (!bath) {
    const fallback = pick("bath_freestanding", tier);
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
  }

  const fixedCategories = [
    ["vanity", "Vanity"], ["toilet", "Toilet"], ["basin_mixer", "Basin mixer"],
    ["bath_mixer", "Bath mixer"], ["shower_mixer", "Shower mixer"],
    ["shower_head", "Shower head"], ["mirror", "Mirror"], ["towel_rail", "Towel rail"],
  ];
  for (const [category, label] of fixedCategories) {
    const item = pick(category, tier);
    if (item) {
      lineItems.push({ category: label, product: item.product, unit: item.unit, quantity: "1", cost: item.price });
      subtotal += item.price;
    } else {
      notes.push(`${label}: no confirmed price yet for this style/tier, excluded from quote.`);
    }
  }

  const floorArea = round2(ROOM_LENGTH_M * ROOM_WIDTH_M * FLOOR_WASTE_FACTOR);
  const floorTile = pick("floor_tile", tier);
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

  const wallTile = pick("wall_tile", tier);
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
    bath_type_used: bath ? bathCategory.replace("bath_", "") : null,
    room_size: `${ROOM_LENGTH_M}m x ${ROOM_WIDTH_M}m`,
    line_items: lineItems,
    confirmed_subtotal: round2(subtotal),
    notes_for_christian: notes,
    ai_prompt: aiPrompt,
  };
}

module.exports = (req, res) => {
  const tier = String(req.query.tier || "budget").toLowerCase();
  const bathType = String(req.query.bathType || "freestanding").toLowerCase();

  if (!["budget", "mid", "premium"].includes(tier)) {
    res.status(400).json({ error: "tier must be 'budget', 'mid', or 'premium'" });
    return;
  }

  res.status(200).json(buildQuote(tier, bathType));
};
