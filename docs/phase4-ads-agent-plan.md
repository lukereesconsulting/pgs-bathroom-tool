# Phase 4: Google Ads automation agent

Prepared by Luke, 10 July 2026. Originally a PDF shared in chat; transcribed
here on 10 July 2026 so it lives in the repo instead of only in chat history.

## How it works

Someone searches "plumber east london" → ad gets clicked (agent manages the
budget) → lead comes in (call, form, or chat) → **agent reviews results**
(clicks vs. real jobs) → **agent optimizes ads** (moves budget to what
works) → you get a simple report and approve any major changes.

(Reviewing results and optimizing ads are the two steps meant to be handled
automatically by the agent; everything else — leads coming in, major-change
approval — stays with Christian.)

## What it costs

Ad spend itself is separate and controlled by Christian — these are build/run costs only.

### One-time build cost

| Item | Est. cost | Notes |
|---|---|---|
| Your build time | $0 (your time) | Learning project, no freelancer fee. |
| Google Ads API access | $0 | Free at Basic/Standard access; only needs a developer token. |
| Domain name | ~$15/year | One-off yearly renewal. |
| Reference: agency-built equivalent | $3,000–$10,000 | What a freelancer/agency would typically charge for a comparable AI ad-automation feature. |

### Ongoing running cost (the system)

| Item | Est. cost | Notes |
|---|---|---|
| Hosting | $0–$25/mo | Small site + database fits free/low tiers (Vercel, Supabase). |
| AI agent usage (Claude API) | $5–$20/mo | Periodic performance checks and adjustments; light usage. |
| Google Ads API | $0 | Free to call; no per-request fee. |
| Comparable off-the-shelf tool | $99–$300+/mo | What commercial AI ad-management tools (Adzooma, Optmyzr) charge — this replaces that fee. |

### Ad spend (separate — goes to Google, not the system)

| Item | Est. cost | Notes |
|---|---|---|
| Local Service Ads (pay-per-lead) | $200–$400/mo | Good starting point for a small residential plumber. |
| Standard Google Ads (pay-per-click) | $1,000–$3,000/mo | Typical range for steady lead flow; clicks run ~$5–$30 each. |

Figures are planning estimates based on July 2026 market pricing, not
quotes. Ad spend is a budget Christian controls, not a system cost.

## Open questions / decisions surfaced 10 July 2026

- **Multi-service complexity, unresolved:** PGS sells more than plumbing
  (bathroom renovations, decking & fire pits, paving & storm water, general
  home improvements, renovations & additions, rainwater harvesting,
  waterproofing & painting). The agent needs to manage several service
  lines/keyword sets, not just one. Not yet designed.
- **Account setup, blocked:** the plan's architecture assumes a Google Ads
  API developer token, which requires a Google Ads account (and therefore a
  Google account) to exist first. Christian hadn't set one up as of 10 July
  2026 — see CLAUDE.md "Client intake answers" and the Gmail/account
  guidance below.
- **How much autonomy the agent actually gets:** the diagram's own design
  keeps "approve any major changes" as a human-in-the-loop step — day-to-day
  bid/budget optimization is automatic, but this hasn't been mapped yet to
  concrete guardrails (e.g. a spend-change threshold that triggers approval
  vs. one the agent can just do).
