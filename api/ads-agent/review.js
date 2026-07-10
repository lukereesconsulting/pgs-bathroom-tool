// GET /api/ads-agent/review
// Read-only: pulls current campaign performance (live Google Ads data once
// configured, mock data until then) and returns it as JSON. No side
// effects — safe to hit any time, including from the dashboard page.

const { getAllCampaignPerformance, MOCK_MODE } = require('../_lib/google-ads-client');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Use GET' });
    return;
  }

  const lookbackDays = Number(req.query.days) || 7;

  try {
    const performance = await getAllCampaignPerformance(lookbackDays);
    res.status(200).json({ mockMode: MOCK_MODE, lookbackDays, performance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
