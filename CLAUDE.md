# PGS Website Project — Orientation

Read this file first, in every new session touching this project. It replaces
scattered chat history and old session scratch-folders as the source of truth.
Update it whenever something material changes — this doc is only useful if it
stays current.

## Who this is for

Christian "Choppy" Keefe runs PGS (Professional Green Solutions), a home
improvement business in East London, South Africa. Luke is building him a
practice/demo website for free, to show him what's possible before Christian
decides whether to invest further (see the 3-month free trial discussion —
Christian covers running costs only: hosting + AI agent usage, ~$10/month
estimated).

- Phone / WhatsApp: 072 762 7657 → `https://wa.me/27727627657`
- Email: ck@hotmail.co.za
- Brand colors: navy/near-black `#111312`, green `#8bc53f`
- PGS does more than plumbing: bathroom renovations, decking & fire pits,
  paving & storm water, general home improvements, renovations & additions,
  plumbing installs & maintenance, rainwater harvesting, waterproofing &
  painting.

## Client intake answers from Christian (in progress, 10 July 2026)

Christian is working through the intake questions Luke sent him (business
background, service area, trust/practical info, FAQs, testimonials).
**More answers are still coming** — check with Luke before treating this as
final/complete, and don't build homepage copy from it without confirming
scope first.

- **Business background:** PGS has been running ~7 years; Christian has been
  a qualified plumber for 26 years. Not solo — small team plus contractors.
  "What got him into the work" — still pending.
- **Service area:** Kidd's Beach to Kei Mouth, including King William's Town
  (Christian's own spelling was "Kyhsers beach" / "Kai Mouth" — confirm exact
  place names before publishing). He shared a map — check with Luke for it.
- **Which services matter most (of the 8 homepage service cards):** asked,
  not yet answered.
- **Testimonials:** Christian says he's on it — still collecting, not
  provided yet.
- **Trust/practical:**
  - No formal guarantee or warranty on his work.
  - Responds to emergencies (e.g. burst pipes) where possible; no stated
    turnaround time for standard quotes yet.
  - Payment: EFT (Christian's exact wording was "EMT? Or EFT?" — confirm
    with him before publishing).
  - Hours: 08:30–16:30, no after-hours emergency call-outs.
- **FAQs:** Christian will think on this — not yet answered.
- **Housekeeping:** phone number confirmed current. Still need to set up a
  Google Mail account for running the ads (Phase 4) — Christian flagged
  this himself, not yet done.

## Suppliers Christian actually uses

Collected from Christian directly (via Luke), as ground truth to check
against/replace the generic supplier research done during Phase 3 planning:

- **Plumbing:** Plumblink, Vincent Hardware.
- Bathroom tool currently sources from Tile Africa (see Phase 2 sections
  below) — not yet reconciled against these. Worth checking whether
  Plumblink/Vincent Hardware stock the plumbing fixtures (toilets, mixers,
  shower heads) currently quoted from Tile Africa, and whether prices
  differ, before treating Tile Africa as the sole source of truth for
  those categories.
- Still outstanding: suppliers for decking/fire pits/paving (Phase 3 is
  paused, see below, so not urgent).

## Live site & repo

- **Live URL:** https://pgs-bathroom-tool.vercel.app/
- **GitHub repo:** https://github.com/lukereesconsulting/pgs-bathroom-tool (branch `main`)
- **Local clone:** `C:\Users\Luke\Documents\GitHub\pgs-bathroom-tool` — cloned
  10 July 2026 via GitHub Desktop. Tracked in GitHub Desktop alongside
  `lukereesconsulting`.
- **Hosting:** Vercel, auto-deploys on every push to `main`. Zero-config —
  `/api/*.js` files are auto-detected as serverless functions, no
  framework/build step.

## How to work on this project (Cowork sessions)

**Cowork has no working shell.** `mcp__workspace__bash` runs in an isolated
sandbox that cannot see this repo or push anything. Do not try to `git`
anything through it.

1. At the start of every session, connect the local folder:
   `mcp__cowork__request_cowork_directory` with path
   `C:\Users\Luke\Documents\GitHub\pgs-bathroom-tool`
2. Once connected, use Read/Write/Edit/Grep/Glob directly on that path —
   this is a real local git clone, not a session scratchpad.
3. **Do not treat a session's own `outputs` scratch folder as project
   storage.** Each Cowork chat gets its own private, temporary outputs
   folder that no other session (including future ones) can read. A prior
   session did exactly this — left a worklog and a dozen prototype
   files sitting in its own scratch folder, invisible to every later
   session, until manually recovered via File Explorer. Anything meant to
   persist goes in this repo folder, not outputs.
4. To commit/push: either ask Luke to do it via GitHub Desktop (repo
   already staged there), or drive GitHub Desktop directly via computer-use
   (`request_access` for `githubdesktop.exe` — note: exact process name,
   not the display name — then use its UI: Changes tab → summary → "Commit
   to main" → "Push origin").
5. To view the running app, use Claude in Chrome
   (`mcp__claude-in-chrome__*`) against the live Vercel URL, not localhost.
6. **`mcp__workspace__bash` mounts this repo but can be stale/torn mid-edit.**
   During the 10 July 2026 sizing/storage build, the bash mount showed a
   truncated `api/quote.js` (cut off mid-string) for several calls in a row
   after an Edit, while the Read/Write/Edit tools already had the complete,
   correct file. Read/Write/Edit are the authoritative view of this repo —
   don't trust `bash` file contents here for verification. If you need to
   actually execute/smoke-test code, copy the files into the session's own
   `outputs` scratch folder first (that mount was reliable) and run node
   against the copy, not the live repo mount. Refinement found 10 July
   2026: even a file inside `outputs` can go stale/truncated on the bash
   mount after an Edit/Write, and waiting several seconds doesn't reliably
   fix it. The fix that does work: write the new content to a **fresh
   filename** (e.g. `quote2.js` instead of re-editing `quote.js`) — this
   immediately synced correctly every time it was tried.

Historically (before the local clone existed) all edits went through
GitHub.com's web editor — pencil icon → select all → paste → "Commit
changes..." → **a second "Commit changes" button inside the panel that
opens, easy to miss.** GitHub drag-and-drop is unreliable (mangles
filenames, can't handle nested folders) — never use it. This method still
works as a fallback but the local clone is faster and safer now.

## Repo structure

```
package.json
catalog/bathroom-catalog-<style>.json         — curated real Tile Africa product/price catalogs, budget/mid/premium tiers.
                                                Six styles: modern-metro, mediterranean-hues, luxe-living,
                                                vintage-romance, eclectic-mix, naturally-beautiful
catalog/plumbing-catalog-plumblink.json       — Plumblink plumbing-fixture catalog (no style split - see Plumblink section below)
api/quote.js                                  — serverless fn: builds a cost estimate from style+tier+bathType+supplier, returns JSON
api/redesign.js                               — serverless fn: same quote-building logic + sends photo to OpenAI images/edits, returns quote + redesigned image (base64)
index.html                                     — homepage
bathroom-tool.html                             — the design tool page
```

`api/quote.js` and `api/redesign.js` deliberately duplicate the same
quote-building logic rather than sharing a module — a conscious tradeoff to
minimize the number of files touched via the GitHub web UI. Worth revisiting
now that local editing is possible.

## The product, phased

- **Phase 1 — Homepage: done.** Lead-gen homepage, PGS-branded, services
  grid, real job photos, contact footer.
- **Phase 2 — Bathroom design tool: done, live, working end-to-end,
  all 6 styles selectable** (multi-style build completed 10 July 2026 —
  see next section). Customer uploads a bathroom photo, picks style /
  price tier / bath type, gets an AI-redesigned photo (OpenAI
  `gpt-image-1.5` images/edits) plus a cost estimate built from real
  sourced Tile Africa prices (never fabricated — unconfirmed items are
  marked `needs_confirmation`/`price: null` and excluded with a note).
  Ends in a WhatsApp handoff to Christian. Remaining polish: thin
  supplier ranges for some styles (see gaps section).
- **Phase 3 — Extend to paving and decking/fire pits: paused, deprioritized
  by Luke on 10 July 2026 in favour of focusing effort on the bathroom
  tool.** Not started, and not the current priority — don't pick this up
  without checking with Luke first, even though the architecture
  (shared tool engine, per-type catalogs/filters, dedicated page per
  type, real length×width sizing from day one) was already scoped in
  conversation. **Homepage cards reverted 10 July 2026** — Luke flagged
  that showing a "Design tool · soon" badge on Decking & fire pits and
  Paving & storm water was misleading since Phase 3 isn't happening
  right now. Both cards are back to plain lead-capture, matching the
  other non-bathroom service cards exactly (no badge, no `featured`
  border) — only Bathroom renovations keeps the green "Design tool"
  badge, since that's the only one with a real tool live.
- **Phase 4 — Google Ads "recommends, Christian approves" automation
  agent: being scoped, not built.** Diagram and cost estimate produced
  10 July 2026 (~$10/month running cost target, agent optimizes bids/budget
  day-to-day, Christian approves major changes). Multi-service complexity
  noted: PGS sells more than plumbing, so the agent needs to manage several
  service lines, not just one keyword set — open design question not yet
  resolved.
- Christian's other services (general home improvements, renovations &
  additions, plumbing, rainwater harvesting, waterproofing & painting) are
  simple lead-capture only — each homepage service card is a `wa.me` link
  with a pre-filled message. No design tool planned for these.

## Phase 2 completion build: done (10 July 2026)

The multi-style build described in the old `PHASE2-BUILD-SPEC.md` was
executed by Claude Fable 5 on 10 July 2026 and the spec file deleted (it
lives in git history if ever needed). What landed:

- All 6 styles sourced from Tile Africa and live in the tool: Modern
  Metro, Mediterranean Hues, Luxe Living, Vintage Romance, Eclectic Mix,
  Naturally Beautiful. One catalog JSON per style.
- **Naming note:** Tile Africa no longer has a "Coastal Hue" collection
  (the URL 404s) — its current coastal-look collection is **Mediterranean
  Hues**, which is what fills the old "Coastal" placeholder slot.
- Backend (`api/quote.js`, `api/redesign.js`) is style-keyed via a
  `CATALOGS` map + `buildQuote(style, tier, bathType)`; unknown styles
  400 with the valid slug list, missing style defaults to modern-metro.
- Frontend bug fixed: `redesign()` now sends `style: currentStyle` in the
  request body (previously the picked style never reached the backend and
  every quote was Modern Metro). All 6 style buttons enabled with real
  Tile Africa names; `selectStyle` now moves the `.active` highlight.
- Bonus: Modern Metro wall tile is now fully confirmed at all 3 tiers
  (Matrix Grey Matt R189.99/m² — price dropped from R239.99, Super White
  Glossy R199.99/m², Cambry Grey Gloss metro-format R350/m²).

## Bathroom tool — current gaps

- **All 6 catalogs are complete as of 10 July 2026.** Every category at
  every tier in every style has a real, confirmed Tile Africa product and
  price — no `needs_confirmation` entries remain, and all 36
  style×tier×bath-type combinations return full 12-item quotes (11 + the
  storage line added in the sizing/storage build below) with zero
  exclusion notes. Where a style's own Tile Africa sub-listing was thin,
  categories were style-matched from the wider catalogue (real products,
  real prices; the style pairing is our curation, not Tile Africa's
  tagging — each catalog's `known_gaps` says exactly which). Tile per-m²
  prices were individually confirmed on product detail pages, never
  derived from box prices.
- **Built-in baths work in all 6 styles.** Tile Africa's style collections
  are freestanding-only, but the general catalogue has a built-in baths
  category (untagged to any style) — every catalog now carries real
  `bath_built_in` entries, so the "Built-in" toggle genuinely changes the
  quote everywhere. The freestanding-substitution fallback logic in
  `api/quote.js`/`api/redesign.js` remains as a safety net but no longer
  fires. Related bug fixed 10 July 2026: the UI sends `built-in` (hyphen)
  but catalog keys are `bath_built_in` (underscore) — `buildQuote` now
  normalises, otherwise built-in would never match even where stocked.
- **Room size is now customer-entered (fixed 10 July 2026 — see below).**
  Not a click-the-corners photo plotter (still not built, was never
  scoped for this pass) — just two number inputs (length × width in
  metres) on the form. Floor tile area is now exact math from those
  inputs; wall tile area is still an estimate (bath surround + shower
  walls aren't the whole room) but now scales proportionally to the
  entered room size instead of being a flat constant, and the quote
  discloses this as an estimate in `notes_for_christian`.
- Tile Africa product prices drift (Matrix Grey Matt dropped ~20% within a
  day of sourcing) — the Monday price-refresh scheduled task matters; check
  its snapshots before trusting `last_updated` dates.

## Sizing & storage build pass: done (10 July 2026)

Fast-follow to the Phase 2 completion build, done in the same Cowork
session (not dispatched to Claude Code — small enough to do directly with
Read/Write/Edit). Two changes, both in `api/quote.js` and
`api/redesign.js` (still deliberately duplicated, see Repo structure):

- **Real room dimensions replace the hardcoded 3.0m × 2.35m default.**
  `bathroom-tool.html` now has Length/Width number inputs (metres,
  clamped 1.2–8m). `buildQuote(style, tier, bathType, roomLength,
  roomWidth)` computes exact floor area (× 1.15 waste factor, unchanged)
  from real input, and scales the old hardcoded wall-tile-area assumption
  (14.25m²) proportionally by room perimeter ratio rather than inventing
  a new formula. Missing/invalid input (non-numeric, negative, wildly
  out of range) falls back to the original 3.0×2.35 default silently —
  `room_size_source` in the quote response says `"customer-entered"` vs
  `"default estimate"` so this is inspectable. Validated with a bad-input
  test (`roomLength: "-5", roomWidth: "abc"` → correctly fell back and
  labeled itself `"default estimate"`).
- **New `storage` line item, size-conditional.** Every catalog now has
  `storage_compact` and `storage_full` categories (budget/mid/premium
  each). `buildQuote` picks `storage_full` when the room's raw floor area
  (before waste factor) is ≥ 6m², else `storage_compact` — roughly the
  boundary between a "small" and "comfortable family" bathroom per SA
  sizing guides (Jaquar/Badeloft references checked before picking the
  number). All 6 real products sourced from Tile Africa's general
  catalogue on 10 July 2026 (not tagged to style collections there, same
  pattern as built-in baths) — Croydex corner basket, Nuvo Class/Locke
  wall-hung tall units, VitrA Mia/Frame/Valarte tall units and LED mirror
  cabinets, R799.99–R18,499.99. Finish/colour varies by style where Tile
  Africa stocks it (e.g. Navy for Eclectic Mix, Ceniza for Naturally
  Beautiful) — see each catalog's `known_gaps` for exactly which SKU maps
  to which style/tier/band. "Storage" was added to `groundedCategories`
  so it now also feeds the AI redesign prompt, same as Mirror.
- Verified via a node smoke test covering all 36 style×tier×room-size
  combinations (no missing storage entries, no wrong item counts) plus
  bad-input/no-input fallback checks — see the bash-mount gotcha above for
  why this ran against a copy in `outputs`, not the live repo mount.
- Not done in this pass: an actual photo-based room measurement tool
  (click-the-corners plotter) — customer still has to type in a tape-
  measure reading, not something derived from the photo.

## Plumblink store-selector build: done (10 July 2026)

Christian buys plumbing fixtures from Plumblink and Vincent Hardware (see
"Suppliers Christian actually uses" above). This pass adds a Store
selector to the bathroom tool so a customer's quote can be regenerated
using Plumblink pricing instead of Tile Africa's, for the categories
that are actually plumbing fixtures.

- **Why Plumblink but not Vincent Hardware got a real backend integration:**
  researched both directly. Plumblink (plumblink.co.za) has a genuine live
  e-commerce catalog with real, confirmed incl.-VAT prices — confirmed by
  browsing category and search-result pages directly. Vincent Hardware
  (vincenthardware.co.za) is a brochure/lead-gen site only — no product
  catalog, no prices, just a "Request a quotation" contact form (checked
  twice: WebSearch snippets and direct browsing). So Vincent Hardware is
  a **frontend-only placeholder**: selecting it hides the quote form
  entirely and shows a notice with a pre-filled WhatsApp link asking
  Christian directly for Vincent Hardware pricing — no fabricated data.
- **New catalog:** `catalog/plumbing-catalog-plumblink.json` — supplier-wide
  (Plumblink has no style collections, unlike Tile Africa), budget/mid/premium
  tiers for the 6 categories Plumblink actually sells: toilet, bath
  (freestanding only — see gap below), basin mixer, bath mixer, shower
  mixer, shower head. All prices real and live-sourced 10 July 2026.
- **Backend mechanism** (`api/quote.js`, `api/redesign.js` — still
  deliberately duplicated): `buildQuote(...)` gained a `supplier`
  parameter (`"tile-africa"` default or `"plumblink"`, validated,
  400s on anything else). `PLUMBLINK_CATEGORIES` is a fixed whitelist of
  the 6 swappable categories. `pickWithSupplier()` tries Plumblink first
  for whitelisted categories when requested, falling back to the style's
  Tile Africa catalog if Plumblink doesn't have that tier/category. Every
  line item now carries its own `supplier` field ("Tile Africa" or
  "Plumblink") so the frontend can group the quote into two labeled
  sections. Non-plumbing categories (tiles, vanity, mirror, towel rail,
  storage) always stay Tile Africa — Plumblink doesn't sell them.
- **Known gap, handled gracefully, not fabricated:** Plumblink has no
  built-in bath in its catalog (site search was inconsistent for that
  phrase — see Tile Africa/Plumblink sourcing gotchas). If a customer
  picks "built-in" bath under the Plumblink store, the quote still pulls
  the built-in bath from Tile Africa and adds a note explaining why. This
  was caught by a bug during dev: `PLUMBLINK_CATEGORIES` initially omitted
  `bath_freestanding`, so the Bath line silently never swapped to
  Plumblink even when selected — fixed and re-verified across all 36
  style×tier×supplier combinations.
- **Frontend** (`bathroom-tool.html`): new Store pill row (Tile Africa /
  Plumblink / Vincent Hardware) above the room-size inputs. Picking
  Plumblink sends `supplier: currentSupplier` in the quote request and,
  per Luke's direction, splits the results display into two
  section-headed groups — "From Tile Africa" and "From Plumblink" — so
  it's clear at a glance which supplier each line item came from, rather
  than one flat list. Picking Vincent Hardware hides the room-size/
  upload/go-button form entirely and shows the WhatsApp-handoff notice
  described above. The WhatsApp message text sent to Christian at the end
  of a quote now includes a `Store: ...` line.
- Verified via node smoke tests (not the live repo bash mount, see
  gotcha below) across all 36 style×tier×supplier combinations: correct
  6-item Plumblink swap where expected, correct built-in-bath fallback
  with note, correct subtotal math either way.

## Scheduled task

`pgs-bathroom-price-refresh` — runs Mondays 8:07am, re-searches Tile
Africa prices and saves dated snapshots to Google Drive folder "PGS Website
Assets" (ID `1DW6wqMp72CFS2uyxxMCDBEmU-Z1ZP_eR`). Currently enabled; check
`mcp__scheduled-tasks__list_scheduled_tasks` for last-run status before
assuming catalog data is fresh.

## Open product decision: pricing visibility (not yet implemented)

The bathroom tool's result page currently shows the **customer** the full
itemized breakdown (every product name + individual price) — risks the
customer shopping that exact list elsewhere instead of hiring Christian.
Discussed and deliberately **left as-is for now** ("it proves the point"
for demoing to Christian). If revisited: strip product names/per-item
prices from the public page, show only a rounded total + "chat to
Christian for the full breakdown"; full detail still goes to Christian via
the WhatsApp message text (no database/persistence layer exists in this
project, so a private per-quote page isn't a lightweight option).

## Resolved — hero image landed

The old "Unverified" note below (kept for history) turned out to be
resolved: reading `index.html` directly on 10 July 2026 confirmed the
`.hero` background is a real Google Drive-hosted photo (same file ID as
the "Stone fire pit at sunset" gallery image), not a placeholder — the
earlier fix did land at some point. No action needed.

## Content scope from Christian's intake answers (10 July 2026)

Reviewed what Christian has actually confirmed so far (see intake section
above) against what's safe to put on the live site right now:

- **Ready to add, not yet added:** "26 years qualified plumber" / "~7
  years running PGS" as a trust line; business hours (08:30–16:30,
  weekdays, no after-hours emergency call-outs); willingness to respond
  to emergencies like burst pipes where possible. None of these are on
  the site yet — flagging as available, Luke to decide placement (hero
  subtext vs a small trust strip vs footer).
- **Not ready — don't publish yet:**
  - Exact service area town list — Christian's spelling ("Kyhsers beach"/
    "Kai Mouth") needs confirming against the map he shared before any
    place name goes live.
  - Payment method — "EMT? Or EFT?" is still ambiguous in Christian's own
    answer.
  - No formal guarantee/warranty — this is information *for* Christian's
    FAQ answers, not something to market as a feature.
  - Which of the 8 services matter most — not answered, so the services
    grid order/emphasis hasn't changed.
  - FAQs — Christian hasn't answered yet.
- **Testimonials and before/after photos:** not provided yet. Rather than
  wait, placeholder sections were built on 10 July 2026 so the layout
  exists and Christian's real content is a drop-in swap — see next
  section.

## Testimonials & before/after sections: placeholders built (10 July 2026)

Added to `index.html`, between the "Recent work" gallery and the
bathroom-tool CTA:

- **Before &amp; after** (`.before-after` section): 3 cards (Bathroom
  renovation, Deck &amp; outdoor living, Paving &amp; storm water), each a
  side-by-side Before/After image pair. No real photos exist yet, so both
  slots are dashed-border grey placeholders reading "Photo coming soon" —
  deliberately *not* styled to look like real photos, so nobody mistakes
  a placeholder for a finished section. To swap in a real pair, replace
  the two `.ba-placeholder` divs in a card with `<img>` tags (same pattern
  as `.photo-real` in the gallery section above it).
- **What customers say** (`.testimonials` section): 3 cards with grey
  star icons, a "Placeholder" tag, and *"Testimonial coming soon."* in
  place of a real quote — deliberately generic, not an invented quote
  attributed to a fake name, so nothing here could be mistaken for a real
  (fabricated) review. To swap in a real testimonial, remove the
  `.placeholder-tag` div, replace the quote text, and fill in `.who` with
  the customer's real name/suburb.
- Both sections are static HTML/CSS only, no JS — consistent with the
  rest of `index.html`.

## Homepage hero CTAs + service card badges fixed (10 July 2026)

Luke caught two live-site bugs during review:

- **Top-bar "Call 072 762 7657" and hero "Call Christian" / "WhatsApp us"
  were dead.** All three were `<button>` elements with no `href` at
  all — visually looked like links but did nothing on click. Fixed by
  converting them to `<a>` tags: `tel:+27727627657` for both Call
  buttons, `https://wa.me/27727627657?text=...` (pre-filled generic
  greeting) for WhatsApp, `target="_blank"` on the WhatsApp one. No CSS
  changes needed — `.top-cta`/`.btn-primary`/`.btn-outline` were already
  `display:inline-block`, so they render identically as anchors.
- **Decking & fire pits and Paving & storm water cards reverted to plain
  lead-capture**, matching the other four non-bathroom service cards.
  Removed the `featured` class and the `Design tool · soon` badge from
  both — Phase 3 is paused (see above) and Luke didn't want the site
  implying a tool is coming imminently. Only the Bathroom renovations
  card keeps the green "Design tool" badge now, since it's the only one
  with a real, live tool.

## FAQ section built (10 July 2026)

Added a `<section class="faq">` to `index.html`, between the "Design
your dream bathroom" quote-tool CTA and the footer, at Luke's request
("FAQs at the bottom"). Native `<details>/<summary>` accordion — no JS,
consistent with the rest of the page. Six questions, mixing real
confirmed answers with honest placeholders (same `.placeholder-tag`
pattern as testimonials) for anything Christian hasn't answered yet:

- **Answered for real, from the client intake (see above):** "How
  experienced are you?" (26 years qualified plumber, ~7 years running
  PGS), "What areas do you cover?" (deliberately generic — "East London
  and the surrounding coastal area," no specific town names, since the
  exact spelling of outlying towns like Kidd's Beach/Kei Mouth still
  isn't confirmed — see intake section), "What are your hours, and do
  you handle emergencies?" (08:30–16:30 weekdays, no after-hours
  call-outs, but responds quickly to things like burst pipes where
  possible), "How do I get a quote?" (points to the bathroom design tool
  for instant estimates, WhatsApp for everything else).
- **Placeholders, marked "Answer coming soon":** "Do you offer a
  guarantee on your work?" and "What payment methods do you accept?" —
  both genuinely unresolved (no formal guarantee exists yet and
  Christian's own payment-method answer was ambiguous — "EMT? Or EFT?"),
  so rather than publish something that might be wrong, these route the
  visitor to WhatsApp and get swapped for real copy once Christian
  confirms.
- To answer a placeholder for real: remove `class="placeholder"` from
  the `<details>`, delete the `.placeholder-tag` span from the
  `<summary>`, and replace the `<p>` text.

## Unverified — check before assuming

A prior session gave Luke a full `index.html` replacement (hero background
image + reordered services grid) but **live inspection showed it never
took effect** — likely the GitHub web editor's second commit-confirm click
was missed. Status as of 10 July 2026: **unknown whether this landed.**
Fetch the live site and compare before doing further homepage work — don't
assume any pending code block from chat history made it to GitHub.

## Environment gotchas

- Luke's Desktop is OneDrive-redirected to
  `C:\Users\Luke\OneDrive\Desktop`, not plain `%USERPROFILE%\Desktop`.
- OpenAI's image edit endpoint requires JPEG/PNG input — `.avif` photos
  fail and need re-saving as `.jpg` first.
- OpenAI API key lives in Vercel's env var `OPENAI_API_KEY` (set by Luke
  in Vercel project settings, not in this repo).
- Homepage gallery images are hosted on Google Drive — use
  `https://drive.google.com/thumbnail?id=FILE_ID&sz=w800` for hotlinking
  (`uc?export=view` does not reliably render, even on public files).

## Tile Africa sourcing gotchas (for price refreshes / new catalogs)

- tileafrica.co.za returns 403 to generic fetchers — send a browser
  User-Agent header (curl -A "Mozilla/5.0 ...") and it works fine.
- Style listing pages embed all products server-side as schema.org JSON-LD
  (`WebPage → mainEntity offerCatalog → itemListElement` Products) and are
  paginated with `?p=2` etc. — walk pages until no new SKUs appear.
- **Tile price trap:** the JSON-LD `offers.price` on listing pages is the
  PER-BOX price, but the catalogs (and the quote math) use PER-M². The
  per-m² price is the headline `.ecomplete-price` on the product detail
  page. Never divide box price by guessed coverage — coverage varies per
  product (0.9–2.52 m²/box observed). Always confirm on the detail page.
- Product detail URLs are `slug-plus-base-sku` (e.g.
  `/arena-beige-ceramic-floor-330x330mm-t0031145`) but some omit the SKU —
  resolve via `/catalogsearch/result?q=...` and grep hrefs.
- Style bathroom sub-listing URLs are inconsistent: most are
  `/our-styles/<slug>/bathroom`, but Mediterranean Hues and Naturally
  Beautiful use `/our-styles/<slug>/our-styles-<slug>-bathroom`.
