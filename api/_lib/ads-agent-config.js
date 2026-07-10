// Phase 4 ads agent — shared config.
// Lives under api/_lib/ so Vercel does NOT turn it into a route (files/folders
// starting with "_" under api/ are excluded from zero-config function detection).
//
// This file is the single source of truth for campaign structure, budget
// guardrails, and which env vars the live Google Ads connection needs.
// See docs/phase4-campaign-strategy.md for the reasoning behind the
// campaign grouping and starting budget split.

// ---- Campaign definitions -------------------------------------------------
// campaignId is a placeholder key used internally until real Google Ads
// campaign IDs exist (Monday). Once campaigns are created in the live
// account, fill in googleAdsCampaignId for each and the client will use it.
const CAMPAIGNS = [
  {
    campaignId: 'plumbing',
    name: 'Plumbing',
    services: ['Plumbing installs & maintenance'],
    budgetShare: 0.35,
    landingPage: '/index.html#plumbing', // anchor added to the Plumbing service card, 10 July 2026
    googleAdsCampaignId: null, // fill in Monday once created in Google Ads
    keywords: [
      'plumber east london', 'emergency plumber east london',
      'burst pipe repair east london', 'blocked drain east london',
      'geyser repair east london', 'plumbing maintenance east london',
      'qualified plumber east london',
    ],
  },
  {
    campaignId: 'bathroom-renovations',
    name: 'Bathroom Renovations',
    services: ['Bathroom renovations'],
    budgetShare: 0.30,
    landingPage: '/bathroom-tool.html',
    googleAdsCampaignId: null,
    keywords: [
      'bathroom renovation east london', 'bathroom remodel quote',
      'bathroom renovation cost south africa', 'bathroom design tool',
      'bathroom renovation contractor east london', 'tile bathroom renovation',
    ],
  },
  {
    campaignId: 'home-improvements-renovations',
    name: 'Home Improvements & Renovations',
    services: ['General home improvements', 'Renovations & additions'],
    budgetShare: 0.15,
    landingPage: '/index.html#home-improvements',
    googleAdsCampaignId: null,
    keywords: [
      'home renovations east london', 'home improvement contractor east london',
      'house extension east london', 'renovation contractor east london',
      'general contractor east london',
    ],
  },
  {
    campaignId: 'outdoor-water',
    name: 'Outdoor & Water',
    services: ['Decking & fire pits', 'Paving & storm water', 'Rainwater harvesting'],
    budgetShare: 0.12,
    // Points at the Decking card (primary entry for this campaign); the
    // Paving (#paving) and Rainwater (#rainwater) anchors also exist on
    // index.html for per-ad-group landing pages if this gets split further.
    landingPage: '/index.html#decking',
    googleAdsCampaignId: null,
    keywords: [
      'decking installation east london', 'fire pit installation',
      'paving contractor east london', 'storm water drainage east london',
      'rainwater harvesting east london', 'rainwater tank installation',
    ],
  },
  {
    campaignId: 'waterproofing-painting',
    name: 'Waterproofing & Painting',
    services: ['Waterproofing & painting'],
    budgetShare: 0.08,
    landingPage: '/index.html#waterproofing',
    googleAdsCampaignId: null,
    keywords: [
      'waterproofing east london', 'roof waterproofing contractor',
      'damp proofing east london', 'exterior painting east london',
      'house painting contractor east london',
    ],
  },
];

const NEGATIVE_KEYWORDS = [
  'jobs', 'hiring', 'salary', 'course', 'training', 'diy', 'how to',
  'free', 'wholesale', 'supplier',
];

// ---- Guardrails: what the agent may do on its own vs. must escalate -------
// Matches the plan's "recommends, Christian approves" design and the
// "What the agent should NOT decide on its own" section of the strategy doc.
const GUARDRAILS = {
  // Below this, a single budget-shift recommendation auto-applies.
  autoApplyMaxBudgetShiftPct: 0.20,
  // Pausing a whole campaign always needs approval, regardless of size.
  campaignPauseRequiresApproval: true,
  // Moving a keyword between campaigns always needs approval.
  keywordRecategorizationRequiresApproval: true,
  // A single keyword pause (zero conversions, spend above this over the
  // lookback window) can auto-apply — small, reversible, in-campaign.
  autoApplyKeywordPauseMinSpend: 150, // ZAR, in-campaign currency
  // Recommendations older than this and never approved/rejected expire
  // rather than silently applying later.
  pendingApprovalExpiryDays: 14,
};

// ---- Required env vars for live Google Ads API access ---------------------
// See docs/phase4-monday-checklist.md for how to obtain each of these.
// Until all are set, google-ads-client.js runs in MOCK_MODE automatically.
const REQUIRED_ENV_VARS = [
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET',
  'GOOGLE_ADS_REFRESH_TOKEN',
  'GOOGLE_ADS_LOGIN_CUSTOMER_ID', // the MCC/manager account ID
  'GOOGLE_ADS_CUSTOMER_ID',       // PGS's own Ads account ID
];

// State store (see api/_lib/state-store.js) needs a KV connection in
// production — Vercel's Upstash-backed KV integration is the recommended
// $0-tier option referenced in phase4-ads-agent-plan.md's hosting line.
const STATE_STORE_ENV_VARS = ['KV_REST_API_URL', 'KV_REST_API_TOKEN'];

function isLiveModeConfigured() {
  return REQUIRED_ENV_VARS.every((key) => !!process.env[key]);
}

function isStateStoreConfigured() {
  return STATE_STORE_ENV_VARS.every((key) => !!process.env[key]);
}

module.exports = {
  CAMPAIGNS,
  NEGATIVE_KEYWORDS,
  GUARDRAILS,
  REQUIRED_ENV_VARS,
  STATE_STORE_ENV_VARS,
  isLiveModeConfigured,
  isStateStoreConfigured,
};
