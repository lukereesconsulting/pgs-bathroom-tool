# Phase 2 completion — build spec for Fable

Status: **ready to build**. Planned and scoped 10 July 2026. Read `CLAUDE.md`
first for full project orientation, then this file for the specific task.

## Goal

Bring the other 5 bathroom styles up to the same standard as Modern Metro
(real sourced Tile Africa products/prices, fully wired into the quote +
AI-redesign flow) and fix a real bug where the style the customer picks in
the UI is never actually sent to the backend. No UX/UI redesign. No room
measurement feature. No Phase 3 (decking/paving) work — this pass is
bathroom-tool only.

## Hard constraints — do not deviate

- **Never fabricate a price or product.** Match the existing discipline in
  `catalog/bathroom-catalog-modern-metro.json` exactly: every product name
  and price must be a real, currently-listed Tile Africa product. Anything
  you can't confirm gets `"product": "needs_confirmation", "price": null`
  and a note in `known_gaps` — same as the existing wall tile budget/mid
  entries. Excluded-from-quote-with-a-note beats a guessed number, always.
- **No visual/UX changes.** Same layout, same CSS, same interaction flow in
  `bathroom-tool.html`. You're enabling existing disabled buttons and
  wiring data behind them, not redesigning anything.
- **No room measurement / floor-plan feature.** Room size and wall tile
  area stay as the existing hardcoded constants for every style.
- **No decking/paving/Phase 3 work.** Out of scope for this pass.
- **Commit directly to `main`**, in logical incremental commits (roughly:
  one per new catalog file, one for the backend generalization, one for
  the frontend wiring/bug fix). Push when done. Vercel auto-deploys on
  push — verify the live site afterward.

## Task 1 — Source 5 new catalogs

Tile Africa's real collection names (confirmed in `bathroom-tool.html`'s
existing disabled options and cross-checked against tileafrica.co.za):

| UI placeholder label | Real Tile Africa name | Slug to use |
|---|---|---|
| Coastal | Coastal Hue | `coastal-hue` |
| Classic | Luxe Living | `luxe-living` |
| Vintage | Vintage Romance | `vintage-romance` |
| Eclectic | Eclectic Mix | `eclectic-mix` |
| Natural | Naturally Beautiful | `naturally-beautiful` |

For each, create `catalog/bathroom-catalog-<slug>.json` by researching
Tile Africa's real bathroom range for that collection (their style pages
follow the pattern `https://www.tileafrica.co.za/our-styles/<slug>/bathroom`
— confirm the exact URL per style, it may differ slightly from Modern
Metro's). Use **exactly the same JSON shape** as
`catalog/bathroom-catalog-modern-metro.json`:

```json
{
  "style": "Coastal Hue",
  "style_note": "...",
  "supplier": "Tile Africa",
  "source": "https://www.tileafrica.co.za/our-styles/coastal-hue/bathroom",
  "last_updated": "<today's date>",
  "known_gaps": ["..."],
  "categories": {
    "vanity": { "budget": {...}, "mid": {...}, "premium": {...} },
    "toilet": {...},
    "bath_freestanding": {...},
    "bath_built_in": {...},
    "basin_mixer": {...},
    "bath_mixer": {...},
    "shower_mixer": {...},
    "shower_head": {...},
    "floor_tile": {...},
    "wall_tile": {...},
    "mirror": {...},
    "towel_rail": {...}
  }
}
```

Important: **do not assume every style is freestanding-only like Modern
Metro.** Check each style's actual range for a built-in/inset bath option
— if one exists, add a `bath_built_in` category so that style genuinely
supports the "Built-in" toggle instead of silently substituting. If a
style truly has no built-in option (like Modern Metro), that's fine —
the existing fallback-with-a-note logic in `api/quote.js` already handles
it correctly, just confirm that's still true rather than assuming it.

While Modern Metro's `wall_tile` budget/mid entries are marked
`needs_confirmation` — if you're already on Tile Africa's site sourcing
the other 5 styles, and can confirm real Modern Metro budget/mid wall tile
products along the way, that's a welcome bonus fix but not required.

## Task 2 — Generalize the backend

`api/quote.js` and `api/redesign.js` both currently do:

```js
const catalog = require("../catalog/bathroom-catalog-modern-metro.json");
```

Replace this in both files with a style-keyed map, e.g.:

```js
const CATALOGS = {
  "modern-metro": require("../catalog/bathroom-catalog-modern-metro.json"),
  "coastal-hue": require("../catalog/bathroom-catalog-coastal-hue.json"),
  "luxe-living": require("../catalog/bathroom-catalog-luxe-living.json"),
  "vintage-romance": require("../catalog/bathroom-catalog-vintage-romance.json"),
  "eclectic-mix": require("../catalog/bathroom-catalog-eclectic-mix.json"),
  "naturally-beautiful": require("../catalog/bathroom-catalog-naturally-beautiful.json"),
};
function getCatalog(style) {
  return CATALOGS[style] || CATALOGS["modern-metro"];
}
```

Thread a `style` parameter through `buildQuote(...)` in both files (it's
currently `buildQuote(tier, bathType)` — becomes
`buildQuote(style, tier, bathType)`), and read `style` from `req.query`
(quote.js) / `req.body` (redesign.js), defaulting to `"modern-metro"` and
validating against the known slug list (reject/fallback gracefully on an
unknown style, same pattern as the existing tier validation).

Keep the existing deliberate duplication between `quote.js` and
`redesign.js` — don't refactor into a shared module as part of this pass,
that's separate cleanup noted in `CLAUDE.md`, not required here.

## Task 3 — Fix the frontend (real existing bug + wiring)

In `bathroom-tool.html`:

1. **Bug fix:** `redesign()`'s fetch body sends `tier`, `bathType`,
   `imageBase64`, `imageMimeType` — but never `style`. `currentStyle` is
   tracked in JS but never actually sent to `/api/redesign`, so the
   backend always silently uses Modern Metro regardless of what the
   customer picked. Add `style: currentStyle` to the request body.
2. Enable the 5 disabled `.style-opt` buttons. Update their visible
   labels to the real names (Coastal Hue / Luxe Living / Vintage Romance /
   Eclectic Mix / Naturally Beautiful) and wire `onclick="selectStyle(...)"`
   with the matching slug (`coastal-hue`, `luxe-living`, etc.) so
   `currentStyle` matches the backend's catalog keys exactly.
3. Remove the `disabled` class/state and `.soon` sub-labels from those 5
   buttons — everything they need now genuinely works.
4. No other changes to markup, CSS, or layout.

## Verification before calling this done

1. `npm`/local syntax-check the two API files if possible (no bash in
   Cowork — if you're Fable running in a different environment with shell
   access, use it; otherwise careful manual review).
2. After pushing, use Claude in Chrome to load
   `https://pgs-bathroom-tool.vercel.app/bathroom-tool.html`, select each
   of the 6 styles in turn with a test photo, and confirm: the style
   picker updates, the request actually varies by style (check the
   `style` field is present in the network request), and the resulting
   quote reflects that style's real catalog (different products/prices
   between styles, not always Modern Metro's).
3. Update `CLAUDE.md`'s "Bathroom tool — current gaps" section to reflect
   the new reality (which styles are now live, what if anything is still
   `needs_confirmation`) — the doc is only useful if it stays current.
