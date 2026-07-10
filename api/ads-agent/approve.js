// GET /api/ads-agent/approve?id=...&token=...&decision=approved|rejected
// The "you approve any major changes" step from the Phase 4 diagram.
// Designed to be a single link Christian can click from a report (email or
// WhatsApp text) with no login required — security comes from a random,
// single-use token minted per recommendation in optimize.js, not a shared
// password. Each recommendation's token only resolves that recommendation.
//
// Returns a small plain-English HTML page (not JSON) since a person, not
// code, is expected to land here.

const { listPendingApprovals, resolvePendingApproval, appendChangeLog } = require('../_lib/state-store');
const { setCampaignBudget, pauseKeyword } = require('../_lib/google-ads-client');

function htmlPage(title, message, ok) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: -apple-system, sans-serif; background:#111312; color:#fff;
         display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
  .card { background:#1c1f1d; border-radius:12px; padding:32px 40px; max-width:420px; text-align:center; }
  h1 { color: ${ok ? '#8bc53f' : '#e0e0e0'}; font-size:20px; }
  p { color:#cfcfcf; line-height:1.5; }
</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body></html>`;
}

async function applyAction(action) {
  if (action.type === 'pause_keyword') {
    await pauseKeyword(action.campaignId, action.keyword);
  } else if (action.type === 'shift_budget') {
    await setCampaignBudget(action.toCampaignId, null);
  }
  // 'flag_campaign_underperformance' has nothing to apply — approval just
  // acknowledges Christian has seen it.
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Use GET');
    return;
  }

  const { id, token, decision } = req.query;
  if (!id || !token || !['approved', 'rejected'].includes(decision)) {
    res.status(400).send(htmlPage('Missing info', 'This approval link looks incomplete.', false));
    return;
  }

  const pending = await listPendingApprovals();
  const record = pending.find((p) => p.id === id);

  if (!record) {
    res.status(404).send(htmlPage('Not found', 'This recommendation no longer exists — it may have already been resolved.', false));
    return;
  }
  if (record.approveToken !== token) {
    res.status(403).send(htmlPage('Invalid link', 'This approval link is not valid.', false));
    return;
  }
  if (record.status !== 'pending') {
    res.status(200).send(htmlPage('Already handled', `This was already marked "${record.status}".`, true));
    return;
  }

  const resolved = await resolvePendingApproval(id, decision);

  if (decision === 'approved') {
    try {
      await applyAction(resolved);
      await appendChangeLog({ ...resolved, appliedBy: 'christian-approved' });
      res.status(200).send(htmlPage('Approved', resolved.description, true));
    } catch (err) {
      res.status(500).send(htmlPage('Approved, but failed to apply', err.message, false));
    }
  } else {
    res.status(200).send(htmlPage('Rejected', 'No changes were made.', true));
  }
};
