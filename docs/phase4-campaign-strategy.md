# Phase 4 — multi-service campaign strategy

Resolves the open design question flagged in `phase4-ads-agent-plan.md`:
PGS sells more than plumbing, so the agent needs to manage several service
lines, not one keyword set. Drafted 10 July 2026, no live account/API yet —
this is the content/strategy layer, independent of the technical build.

## Why 5 campaigns, not 8

PGS's homepage lists 8 services, but a new, small-budget advertiser
splitting spend 8 ways from day one gets thin, noisy data in every
campaign and the optimizer has nothing reliable to learn from. Grouped
into 5 campaigns by shared search intent instead — still covers all 8
services, but each campaign accumulates enough clicks/conversions to
optimize against:

| Campaign | Services covered | Why grouped |
|---|---|---|
| Plumbing | Plumbing installs & maintenance | Highest search volume, highest urgency (burst pipes = immediate intent), Christian's core 26-year trade. Kept solo — different buyer urgency than renovation work. |
| Bathroom Renovations | Bathroom renovations | Only service with a live design tool (instant AI redesign + quote) — strongest conversion path on the site, deserves its own budget and ad copy pointing straight at the tool. |
| Home Improvements & Renovations | General home improvements, Renovations & additions | Same buyer intent (planning a project, comparing quotes), naturally overlapping search terms. |
| Outdoor & Water | Decking & fire pits, Paving & storm water, Rainwater harvesting | Outdoor/property-improvement intent, seasonal together, lower individual volume so pooling avoids starving any one of data. |
| Waterproofing & Painting | Waterproofing & painting | Distinct intent (maintenance/protection, not renovation) and distinct keyword set (leaks, damp, exterior paint) — kept separate so it doesn't dilute renovation-intent keywords. |

## Starting budget split (before any real performance data)

No campaign has run yet, so this is a starting allocation, not a
data-backed one — exactly what the agent's job is to correct once real
clicks/leads come in. Weighted toward highest urgency (plumbing) and
highest average job value + unique conversion path (bathroom, via the
tool).

| Campaign | Share of ad budget | Rationale |
|---|---|---|
| Plumbing | 35% | Highest lead urgency/volume; Local Service Ads (pay-per-lead) suits this best per the original plan — lower risk while the account has no track record. |
| Bathroom Renovations | 30% | Highest average job value; the design tool is a genuine differentiator worth protecting budget for. |
| Home Improvements & Renovations | 15% | Broad, steady-intent category. |
| Outdoor & Water | 12% | Seasonal, lower volume individually. |
| Waterproofing & Painting | 8% | Smallest, most maintenance-driven category. |

Recommend starting on the low end of the plan's ad-spend range (Local
Service Ads $200–400/mo for Plumbing to begin) rather than jumping to
Standard Search across all 5 campaigns at once — proves the funnel works
before committing the $1,000–3,000/mo Standard Search range.

## Geo targeting

Per CLAUDE.md, exact service-area town names (Kidd's Beach, Kei Mouth
spelling) aren't confirmed yet, so keyword/location targeting should stay
at **East London, South Africa** (city + surrounding radius) for now, not
specific outlying towns — same caution already applied to the FAQ/homepage
copy. Tighten radius targeting once Christian confirms the map.

## Keyword themes per campaign

Illustrative, not exhaustive — the agent's job once live is to expand
these based on real Search Terms reports (queries that actually
triggered clicks), not to treat this list as final.

**Plumbing**
`plumber east london`, `emergency plumber east london`, `burst pipe repair east london`,
`blocked drain east london`, `geyser repair east london`, `plumbing maintenance east london`,
`qualified plumber east london`

**Bathroom Renovations**
`bathroom renovation east london`, `bathroom remodel quote`, `bathroom renovation cost south africa`,
`bathroom design tool`, `bathroom renovation contractor east london`, `tile bathroom renovation`

**Home Improvements & Renovations**
`home renovations east london`, `home improvement contractor east london`,
`house extension east london`, `renovation contractor east london`, `general contractor east london`

**Outdoor & Water**
`decking installation east london`, `fire pit installation`, `paving contractor east london`,
`storm water drainage east london`, `rainwater harvesting east london`, `rainwater tank installation`

**Waterproofing & Painting**
`waterproofing east london`, `roof waterproofing contractor`, `damp proofing east london`,
`exterior painting east london`, `house painting contractor east london`

## Negative keywords (all campaigns)

`jobs`, `hiring`, `salary`, `course`, `training`, `diy`, `how to`, `free`,
`wholesale`, `supplier` — filters out job-seekers, DIYers, and people
looking for suppliers rather than a contractor.

## Landing pages

- Bathroom Renovations → `bathroom-tool.html` (the design tool — already
  live, already ends in a WhatsApp handoff).
- All other 4 campaigns → `index.html`, deep-linked to the matching
  service card via anchor IDs added 10 July 2026 specifically for this
  (`#plumbing`, `#decking`, `#paving`, `#home-improvements`,
  `#renovations`, `#rainwater`, `#waterproofing`) — each card is already a
  `wa.me` lead-capture link, so the ad just scrolls the visitor straight to
  the relevant card instead of the top of the page. No new pages needed.

## What the agent should NOT decide on its own

Matches the plan's "recommends, Christian approves" design (see
`phase4-ads-agent-plan.md` and the guardrails in `api/_lib/ads-agent-config.js`):
pausing an entire campaign, shifting more than 20% of a campaign's budget
in one move, or changing which campaign a keyword theme belongs to, all
require Christian's approval. Smaller in-campaign bid/keyword-pause
adjustments within an already-approved budget can apply automatically.
