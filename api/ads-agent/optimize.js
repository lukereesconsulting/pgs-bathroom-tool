// POST /api/ads-agent/optimize
// The core "agent reviews results / agent optimizes ads" step from the
// Phase 4 diagram. Meant to be triggered on a schedule via vercel.json's
// cron config (see repo root), not called directly by users.
//
// Flow: pull performance -> run optimizer.analyzePerformance() -> for each
// proposed action, either apply it immediately (small, reversible, within
// guardrails) or queue it as a pending approval for Christian (major
// changes). Never applies a guardrailed action without approval.
//
// Protected by CRON_SECRET so this can't be triggered by an arbitrary
// request — Vercel Cron automatically sends
// `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set as an env
// var and referenced in vercel.json. See docs/phase4-monday-checklist.md.

const { getAllCampaignPerformance } = require('../_lib/google-ads-client');
const { setCampaignBudget, pauseKeyword } = require('../_lib/google-ads-client');
const { analyzePerformance } = require('../_lib/optimizer');
const { addPendingApproval, appendChangeLog } = require('../_lib/state-store');
const crypto = require('crypto');

function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // not configured yet (weekend build) — allow through
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${secret}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Use POST (or GET for manual trigger)' });
    return;
  }
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const performance = await getAllCampaignPerformance(7);
    const actions = analyzePerformance(performance);

    const applied = [];
    const queued = [];

    for (const action of actions) {
      if (action.autoApply) {
        if (action.type === 'pause_keyword') {
          await pauseKeyword(action.campaignId, action.keyword);
        } else if (action.type === 'shift_budget') {
          // Mock/live client takes an absolute new budget; this scaffold
          // just records the intent — Monday's live implementation should
          // compute real new budget numbers from the account's actual
          // current budgets before calling setCampaignBudget.
          await setCampaignBudget(action.toCampaignId, null);
        }
        await appendChangeLog({ ...action, appliedBy: 'auto' });
        applied.push(action);
      } else {
        const rec = await addPendingApproval({
          ...action,
          approveToken: crypto.randomBytes(16).toString('hex'),
        });
        queued.push(rec);
      }
    }

    res.status(200).json({
      reviewedCampaigns: performance.length,
      appliedCount: applied.length,
      queuedForApprovalCount: queued.length,
      applied,
      queued,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
