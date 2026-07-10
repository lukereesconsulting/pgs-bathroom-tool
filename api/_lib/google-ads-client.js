// Phase 4 ads agent — Google Ads API wrapper.
//
// Real implementation uses the community-maintained `google-ads-api` (Opteo)
// npm package: https://github.com/Opteo/google-ads-api — install it Monday
// with `npm install google-ads-api` once real credentials exist (it's not
// installed yet since there's nothing to call against this weekend).
//
// Until docs/phase4-monday-checklist.md's env vars are all set, every
// function here runs in MOCK_MODE and returns deterministic synthetic data
// so the rest of the pipeline (review -> optimize -> report -> approve) can
// be built and smoke-tested now, then swapped to live data Monday with zero
// changes to the calling code.

const { CAMPAIGNS, isLiveModeConfigured } = require('./ads-agent-config');

const MOCK_MODE = !isLiveModeConfigured();

// ---- Mock data generator ---------------------------------------------------
// Deterministic (seeded by campaignId), not random, so smoke tests produce
// stable, reviewable numbers instead of a new answer every run.
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function stringSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 233280;
}

function mockCampaignPerformance(campaign, lookbackDays) {
  const rand = seededRandom(stringSeed(campaign.campaignId) + lookbackDays);
  const dailyBudgetZar = Math.round(300 * campaign.budgetShare * 10) / 10; // illustrative
  const clicks = Math.round((5 + rand() * 20) * (lookbackDays / 7));
  const avgCpc = Math.round((15 + rand() * 20) * 100) / 100;
  const cost = Math.round(clicks * avgCpc * 100) / 100;
  const leads = Math.round(clicks * (0.05 + rand() * 0.12));
  const impressions = Math.round(clicks * (15 + rand() * 25));

  const keywordStats = campaign.keywords.map((kw) => {
    const kwRand = seededRandom(stringSeed(campaign.campaignId + kw));
    const kwClicks = Math.round(clicks * (0.05 + kwRand() * 0.25));
    const kwCost = Math.round(kwClicks * avgCpc * 100) / 100;
    const kwLeads = Math.round(kwClicks * (0.0 + kwRand() * 0.15));
    return { keyword: kw, clicks: kwClicks, cost: kwCost, leads: kwLeads };
  });

  return {
    campaignId: campaign.campaignId,
    name: campaign.name,
    lookbackDays,
    impressions,
    clicks,
    cost,
    leads,
    avgCpc,
    dailyBudgetZar,
    keywordStats,
    source: 'mock',
  };
}

/**
 * Fetch performance stats for every configured campaign over the given
 * lookback window. Live mode: Google Ads Query Language (GAQL) report via
 * the google-ads-api client. Mock mode: synthetic data.
 */
async function getAllCampaignPerformance(lookbackDays = 7) {
  if (MOCK_MODE) {
    return CAMPAIGNS.map((c) => mockCampaignPerformance(c, lookbackDays));
  }

  // ---- Live implementation (Monday) ----------------------------------
  // const { GoogleAdsApi } = require('google-ads-api');
  // const client = new GoogleAdsApi({
  //   client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  //   client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  //   developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  // });
  // const customer = client.Customer({
  //   customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  //   login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  //   refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  // });
  // const rows = await customer.query(`
  //   SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks,
  //          metrics.cost_micros, metrics.conversions
  //   FROM campaign
  //   WHERE segments.date DURING LAST_${lookbackDays}_DAYS
  // `);
  // ...map rows to the same shape mockCampaignPerformance returns...
  throw new Error(
    'Live Google Ads mode is configured (env vars present) but the live ' +
    'query implementation is still a stub — see the commented block above ' +
    'this line in api/_lib/google-ads-client.js. Fill it in Monday once ' +
    'google-ads-api is installed and a real customer ID is available.'
  );
}

/**
 * Apply a budget change to a campaign. Live mode calls the Ads API mutate
 * endpoint; mock mode just logs and returns success so the pipeline can be
 * exercised end-to-end.
 */
async function setCampaignBudget(campaignId, newDailyBudgetZar) {
  if (MOCK_MODE) {
    return { campaignId, newDailyBudgetZar, applied: true, source: 'mock' };
  }
  throw new Error('Live setCampaignBudget not yet implemented — see Monday checklist.');
}

/**
 * Pause a single keyword within a campaign.
 */
async function pauseKeyword(campaignId, keyword) {
  if (MOCK_MODE) {
    return { campaignId, keyword, paused: true, source: 'mock' };
  }
  throw new Error('Live pauseKeyword not yet implemented — see Monday checklist.');
}

module.exports = {
  MOCK_MODE,
  getAllCampaignPerformance,
  setCampaignBudget,
  pauseKeyword,
};
