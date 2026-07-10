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

Historically (before the local clone existed) all edits went through
GitHub.com's web editor — pencil icon → select all → paste → "Commit
changes..." → **a second "Commit changes" button inside the panel that
opens, easy to miss.** GitHub drag-and-drop is unreliable (mangles
filenames, can't handle nested folders) — never use it. This method still
works as a fallback but the local clone is faster and safer now.

## Repo structure

```
package.json
catalog/bathroom-catalog-modern-metro.json   — curated real Tile Africa product/price catalog, budget/mid/premium tiers
api/quote.js                                  — serverless fn: builds a cost estimate from tier+bathType, returns JSON
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
- **Phase 2 — Bathroom design tool: done, live, working end-to-end** —
  this is the current focus (fleshing out more design tabs/styles). Customer
  uploads a bathroom photo, picks style / price tier / bath type, gets an
  AI-redesigned photo (OpenAI `gpt-image-1.5` images/edits) plus a cost
  estimate built from real sourced Tile Africa prices (never fabricated —
  unconfirmed items are marked `needs_confirmation`/`price: null` and
  excluded with a note). Ends in a WhatsApp handoff to Christian.
- **Phase 3 — Extend to paving and decking/fire pits: not started.** The
  homepage shows both with the same green "Design tool" badge as Bathroom
  renovations, labeled "Design tool · soon" — currently just WhatsApp
  lead-capture, no actual tool.
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

## Bathroom tool — current gaps (why filters don't match products)

This is the active work: **"filters the customer would use aren't matched
to products available."** Specifically:

- Only **Modern Metro** style has real product data. The UI shows 5 more
  style options (currently placeholder-labeled Coastal / Classic / Vintage
  / Eclectic / Natural, all disabled "soon") — Tile Africa's actual names
  for these collections are Coastal Hue, Luxe Living (Classic), Vintage
  Romance, Eclectic Mix, and Naturally Beautiful. UI labels should be
  updated to match real supplier taxonomy once each style is curated.
- Within Modern Metro, **wall tile budget and mid-tier prices are still
  unconfirmed** (`needs_confirmation`, `price: null` in
  `catalog/bathroom-catalog-modern-metro.json`) — only premium was sourced.
- Modern Metro has **no built-in/inset bath** in Tile Africa's range —
  freestanding only. The "Built-in" bath-type toggle in the UI is real and
  selectable, but `api/quote.js` silently substitutes freestanding and adds
  a note for Christian. This is handled gracefully, not broken, but worth
  knowing before "fixing" it.
- Room size (3.0m × 2.35m) and wall tile area (14.25m²) are hardcoded
  assumptions in `api/quote.js` / `api/redesign.js`, not measured from the
  photo. A room-measurement feature (click-the-corners style plotter) was
  part of the original project vision but not yet built.

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
