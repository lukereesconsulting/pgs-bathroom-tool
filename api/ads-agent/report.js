// GET /api/ads-agent/report
// Builds the "you get a simple report" step from the Phase 4 diagram.
// Pulls current performance + recent changelog + open pending approvals,
// and returns both structured JSON (for the dashboard page) and a
// plain-English summary string.
//
// If ANTHROPIC_API_KEY is set, the summary is drafted by Claude (matches
// the "$5-20/mo AI agent usage" line in phase4-ads-agent-plan.md — light,
// periodic usage, not a live chat agent). If not set, falls back to a
// template-built summary so this endpoint works with zero extra setup
// this weekend.

const { getAllCampaignPerformance } = require('../_lib/google-ads-client');
const { listPendingApprovals, getChangeLog } = require('../_lib/state-store');

function buildTemplateSummary(performance, pending, changelog) {
  const totalCost = performance.reduce((sum, c) => sum + c.cost, 0);
  const totalLeads = performance.reduce((sum, c) => sum + c.leads, 0);
  const lines = [
    `PGS Ads — last ${performance[0]?.lookbackDays ?? 7} days`,
    `Total spend: R${totalCost.toFixed(2)} across ${performance.length} campaigns, ${totalLeads} leads.`,
    '',
    'By campaign:',
    ...performance.map(
      (c) => `- ${c.name}: R${c.cost.toFixed(2)} spent, ${c.clicks} clicks, ${c.leads} leads`
    ),
  ];
  if (changelog.length) {
    lines.push('', 'Changes the agent made automatically since last report:');
    lines.push(...changelog.slice(-5).map((c) => `- ${c.description}`));
  }
  if (pending.filter((p) => p.status === 'pending').length) {
    lines.push('', 'Waiting on your approval:');
    lines.push(
      ...pending
        .filter((p) => p.status === 'pending')
        .map((p) => `- ${p.description} (approve at /api/ads-agent/approve?id=${p.id}&token=${p.approveToken}&decision=approved)`)
    );
  }
  return lines.join('\n');
}

async function buildAiSummary(performance, pending, changelog) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are writing a short, plain-English weekly ad performance summary for a small-business owner (a plumber/home-improvement contractor in South Africa) who is not a marketing expert. Use the data below. Keep it under 150 words, no jargon, lead with the most important thing.\n\nPerformance: ${JSON.stringify(performance)}\nRecent automatic changes: ${JSON.stringify(changelog.slice(-5))}\nPending approvals needed: ${JSON.stringify(pending.filter((p) => p.status === 'pending'))}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) return null; // fall back to template rather than fail the request
  const data = await res.json();
  return data.content?.[0]?.text ?? null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Use GET' });
    return;
  }

  try {
    const performance = await getAllCampaignPerformance(Number(req.query.days) || 7);
    const pending = await listPendingApprovals();
    const changelog = await getChangeLog();

    let summary = await buildAiSummary(performance, pending, changelog);
    let summarySource = 'claude';
    if (!summary) {
      summary = buildTemplateSummary(performance, pending, changelog);
      summarySource = 'template';
    }

    res.status(200).json({
      summary,
      summarySource,
      performance,
      pendingApprovals: pending.filter((p) => p.status === 'pending'),
      recentChanges: changelog.slice(-10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
