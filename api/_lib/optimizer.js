// Phase 4 ads agent — decision logic.
//
// Pure functions: takes performance data (from google-ads-client, live or
// mock) plus the guardrails config, and returns a list of proposed actions.
// Kept side-effect free and dependency-free on purpose so it can be unit /
// smoke tested without touching the Google Ads API, KV store, or network at
// all — exactly the kind of thing the CLAUDE.md "copy to outputs, run node
// against it" testing pattern is for.

const { GUARDRAILS } = require('./ads-agent-config');

/**
 * @param {Array} performanceData - output of getAllCampaignPerformance()
 * @returns {Array} actions, each: { campaignId, type, description, autoApply, ...details }
 */
function analyzePerformance(performanceData, guardrails = GUARDRAILS) {
  const actions = [];

  // ---- Per-keyword: pause zero-conversion keywords burning real spend ----
  for (const campaign of performanceData) {
    for (const kw of campaign.keywordStats) {
      if (kw.leads === 0 && kw.cost >= guardrails.autoApplyKeywordPauseMinSpend) {
        actions.push({
          campaignId: campaign.campaignId,
          type: 'pause_keyword',
          keyword: kw.keyword,
          description: `Pause "${kw.keyword}" in ${campaign.name} — R${kw.cost.toFixed(2)} spent, 0 leads over ${campaign.lookbackDays}d.`,
          autoApply: true,
          details: { costSoFar: kw.cost, clicks: kw.clicks },
        });
      }
    }
  }

  // ---- Cross-campaign: flag under/over performers for budget rebalancing --
  const withEfficiency = performanceData.map((c) => ({
    ...c,
    costPerLead: c.leads > 0 ? c.cost / c.leads : null,
  }));

  const withLeads = withEfficiency.filter((c) => c.costPerLead !== null);
  if (withLeads.length >= 2) {
    const best = withLeads.reduce((a, b) => (a.costPerLead < b.costPerLead ? a : b));
    const worst = withLeads.reduce((a, b) => (a.costPerLead > b.costPerLead ? a : b));

    if (best.campaignId !== worst.campaignId && worst.costPerLead > best.costPerLead * 1.5) {
      // Propose shifting a slice of budget from worst to best. Cap the
      // proposed shift at the auto-apply threshold; anything the caller
      // wants to propose larger than that is marked as needing approval.
      const shiftPct = Math.min(0.15, guardrails.autoApplyMaxBudgetShiftPct);
      actions.push({
        campaignId: worst.campaignId,
        type: 'shift_budget',
        fromCampaignId: worst.campaignId,
        toCampaignId: best.campaignId,
        shiftPct,
        description: `Shift ~${Math.round(shiftPct * 100)}% of ${worst.name}'s budget to ${best.name} — cost/lead is R${worst.costPerLead.toFixed(2)} vs R${best.costPerLead.toFixed(2)}.`,
        autoApply: shiftPct <= guardrails.autoApplyMaxBudgetShiftPct,
        details: { worstCostPerLead: worst.costPerLead, bestCostPerLead: best.costPerLead },
      });
    }
  }

  // ---- Campaigns with real spend and zero leads at all: flag, don't pause -
  // Pausing a whole campaign always needs approval regardless of size.
  for (const c of performanceData) {
    if (c.leads === 0 && c.cost > 0 && c.clicks >= 10) {
      actions.push({
        campaignId: c.campaignId,
        type: 'flag_campaign_underperformance',
        description: `${c.name} has ${c.clicks} clicks and R${c.cost.toFixed(2)} spent with 0 leads over ${c.lookbackDays}d — worth a look before spend continues.`,
        autoApply: false,
        details: { clicks: c.clicks, cost: c.cost },
      });
    }
  }

  return actions;
}

module.exports = { analyzePerformance };
