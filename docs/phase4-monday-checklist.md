# Phase 4 — Monday go-live checklist

Everything the weekend build (10 July 2026) could do without a live Google
Ads account is done — see `phase4-campaign-strategy.md` and the code under
`api/ads-agent/` + `api/_lib/`. This is what's left, in order.

**Heads up on timing:** applying for the Google Ads API developer token
does not mean same-day *full* access, but it also doesn't block most of
this list. Clearing this up because the numbered order below reads more
sequential than it actually is:

- **You get a developer token string the moment you apply** (step 3) —
  there's no multi-day wait to receive a token at all.
- What varies is its **access level**. Google sometimes auto-approves
  "Explorer Access" instantly, which can already call your real
  production Ads account (with lower rate limits). Otherwise you're
  dropped to "Test Account Access" only, which can't touch the real PGS
  account until Basic/Standard access clears manual review — that's the
  part that takes 5–14+ business days, longer with 2026's backlog. You
  won't know which one you got until you actually apply.
- **Steps 4–6 (OAuth credentials, Vercel KV, most env vars) don't depend
  on the token's access level at all** — do them regardless of what
  happens in step 3.
- **Step 8 (creating the 5 campaigns) happens by hand in the Google Ads
  website, not through the API** — it only needs the Ads account to exist
  (step 2), not any API/token status. Start it Monday regardless.
- **Only step 7 (the agent actually calling the live API for real data/
  changes) is genuinely gated** by whether you landed Explorer access
  (works Monday) or Test-only access (waits for Basic/Standard review).
  Everything else in this list is safe to do in parallel.

## 0. Connect the custom domain

Not part of the Ads work itself, but also queued for Monday: the domain
`pgseastlondon.co.za` was purchased 10 July 2026 and isn't connected yet.

- [ ] In the Vercel project (pgs-bathroom-tool) → Settings → Domains → add
  `pgseastlondon.co.za` (and probably `www.pgseastlondon.co.za`).
- [ ] Vercel will show the DNS records to add (typically an A record for
  the apex domain and/or a CNAME for `www`) — add these at wherever the
  domain was registered.
- [ ] Once DNS propagates, Vercel auto-issues an SSL cert — no separate
  step needed.
- [ ] After it's live, update ad landing-page URLs in
  `phase4-campaign-strategy.md` / `api/_lib/ads-agent-config.js` from the
  `.vercel.app` URL to the new domain if you want ads pointing at the
  branded domain from day one (not required — either URL works, but the
  custom domain looks more credible in the ad itself).
- [ ] Keep the `.vercel.app` URL working too (Vercel does this by
  default) in case anything still links to it.

## 1. Confirm the Google account

- [ ] Confirm `ck@hotmail.co.za` is fully working as a Google Account
  sign-in (accounts.google.com → sign in with it, confirm no errors).

## 2. Create the Google Ads account

- [ ] Sign in to ads.google.com with that account, create a Google Ads
  account for PGS.
- [ ] Note the **Customer ID** (format `123-456-7890`) — this becomes
  `GOOGLE_ADS_CUSTOMER_ID`.

## 3. Create a Manager (MCC) account and apply for API access

- [ ] Create a Google Ads **Manager account** (a separate free account
  type from the regular Ads account) — the developer token can only be
  generated from a Manager account's API Center, not a regular account.
  Link the PGS Ads account under it.
- [ ] Note the Manager account's Customer ID — this becomes
  `GOOGLE_ADS_LOGIN_CUSTOMER_ID`.
- [ ] Go to the Manager account's API Center
  (ads.google.com/aw/apicenter), apply for a developer token. Use a real,
  monitored contact email — Google's compliance team may follow up.
  **Apply Monday even though approval takes days-to-weeks** — the clock
  only starts once you apply.
- [ ] You'll likely get "Test" or "Explorer" access immediately while
  Basic/Standard access is under review — Explorer access can hit
  production accounts with restrictions, which may be enough to verify
  the integration works before full approval lands.

## 4. Set up OAuth2 credentials

- [ ] In Google Cloud Console, create a project (or use an existing one),
  enable the Google Ads API, and create an OAuth 2.0 Client ID (type:
  Desktop app is simplest for generating a one-time refresh token).
  These become `GOOGLE_ADS_CLIENT_ID` / `GOOGLE_ADS_CLIENT_SECRET`.
- [ ] Generate a refresh token by authorizing that OAuth client against
  the PGS Ads account once (e.g. via
  https://refresh-token-helper.opteo.com/ — a free helper built for the
  `google-ads-api` npm library this project is scaffolded around — or
  Google's own OAuth playground). Becomes `GOOGLE_ADS_REFRESH_TOKEN`.

## 5. Set up state storage (Vercel KV)

- [ ] In the Vercel project dashboard, add a KV (Upstash Redis) storage
  integration — free tier is plenty for this. Vercel auto-populates
  `KV_REST_API_URL` and `KV_REST_API_TOKEN` as env vars once connected.
  Without this, the agent's pending-approvals/changelog only live in
  memory and won't survive between serverless invocations — fine for this
  weekend's testing, not fine for production.

## 6. Set Vercel environment variables

Add all of these in Vercel project settings (same place `OPENAI_API_KEY`
already lives):

- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
- `GOOGLE_ADS_CUSTOMER_ID`
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` (auto-added by step 5)
- `CRON_SECRET` — any random string; protects `/api/ads-agent/optimize`
  from being triggered by anyone else. Vercel automatically sends this as
  a bearer token when it fires the cron job defined in `vercel.json`, once
  the env var is set.
- `ANTHROPIC_API_KEY` — optional; enables Claude-drafted plain-English
  report summaries. Without it, `/api/ads-agent/report` falls back to a
  template summary (already tested, works fine).

Once these are all set, `api/_lib/ads-agent-config.js`'s
`isLiveModeConfigured()` flips to `true` automatically and
`api/_lib/google-ads-client.js` will attempt live calls instead of mock
data — no code changes needed for that switch.

## 7. Fill in the live query implementation

This is the step actually gated by the token's access level (see timing
note above) — if you only got Test Account Access Monday, this can be
written and even tested against a Google-provided test account, but won't
return real PGS data until Basic/Standard access clears.

`api/_lib/google-ads-client.js` has the mock data path fully working and
a commented-out sketch of the live GAQL query for `getAllCampaignPerformance`.
This still needs:

- [ ] `npm install google-ads-api` (not installed yet — nothing to call
  against this weekend).
- [ ] Uncomment and complete the live query block, mapping real API rows
  to the same shape the mock generator returns (`campaignId, name,
  lookbackDays, impressions, clicks, cost, leads, avgCpc, dailyBudgetZar,
  keywordStats`) so `optimizer.js`, `report.js`, and the dashboard don't
  need any changes.
- [ ] Implement `setCampaignBudget` and `pauseKeyword` for real (currently
  mock-only, throws in live mode) using the Ads API mutate calls.
- [ ] Fill in each campaign's `googleAdsCampaignId` in
  `api/_lib/ads-agent-config.js` once the 5 campaigns are actually created
  in the Ads account (see `phase4-campaign-strategy.md` for the structure
  to create them with).

## 8. Create the actual campaigns in Google Ads

Not blocked by anything above — this happens in the Ads UI directly, not
via the API. Only needs step 2 (the Ads account existing). Do this
regardless of how step 3's token application goes.

- [ ] Create the 5 campaigns from `phase4-campaign-strategy.md` (Plumbing,
  Bathroom Renovations, Home Improvements & Renovations, Outdoor & Water,
  Waterproofing & Painting), using the keyword lists, negative keywords,
  landing pages, and starting budget split already drafted there.
- [ ] Start with Local Service Ads for Plumbing specifically, per the
  plan's recommendation to de-risk the first spend.

## 9. Decide report delivery

The weekend build ships an internal dashboard
(`ads-agent-dashboard.html`, calls `/api/ads-agent/report`) rather than
emailing/WhatsApping Christian automatically — no email-sending service or
WhatsApp Business API integration was added this weekend to avoid new
recurring costs. Options for Monday, not yet decided:

- Keep it dashboard-only — Luke checks it and manually forwards anything
  worth Christian's attention via WhatsApp (same pattern the bathroom tool
  already uses).
- Add a transactional email step (e.g. Resend's free tier) so the report
  emails Christian directly.
- Both — dashboard for Luke, periodic WhatsApp summary for Christian.

## 10. Basic protection for the dashboard

`ads-agent-dashboard.html` and the `/api/ads-agent/*` endpoints have no
authentication yet (approve links are protected by per-recommendation
random tokens, but `review` and `report` are open to anyone with the
URL). Fine for a weekend build nobody else knows the URL of; worth adding
Vercel's built-in deployment protection or a simple shared password before
telling anyone else it exists.
