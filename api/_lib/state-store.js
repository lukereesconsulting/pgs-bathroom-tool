// Phase 4 ads agent — persistence for pending recommendations + change log.
//
// This project has no database (see CLAUDE.md). Rather than add a new paid
// service, this uses Vercel's KV integration (Upstash Redis under the hood,
// free tier) via its plain REST API — no extra npm package required, just
// two env vars (KV_REST_API_URL, KV_REST_API_TOKEN) that appear
// automatically once Luke connects a KV store to this Vercel project.
//
// Until that's connected, falls back to an in-memory store. That fallback
// is ONLY useful for local smoke-testing in this session — it does NOT
// persist across serverless invocations in production, since each
// invocation may run in a fresh instance. Production must have KV
// connected before this agent runs for real. See docs/phase4-monday-checklist.md.

const { isStateStoreConfigured } = require('./ads-agent-config');

const KV_CONFIGURED = isStateStoreConfigured();

// In-memory fallback (smoke-testing only — see warning above).
const memoryStore = new Map();

async function kvGet(key) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`KV get failed: ${res.status}`);
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function kvSet(key, value) {
  const res = await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(JSON.stringify(value)),
  });
  if (!res.ok) throw new Error(`KV set failed: ${res.status}`);
}

async function getState(key, fallback) {
  if (KV_CONFIGURED) {
    const value = await kvGet(key);
    return value === null ? fallback : value;
  }
  return memoryStore.has(key) ? memoryStore.get(key) : fallback;
}

async function setState(key, value) {
  if (KV_CONFIGURED) {
    await kvSet(key, value);
  } else {
    memoryStore.set(key, value);
  }
}

// ---- Domain-specific helpers ----------------------------------------------

const PENDING_KEY = 'ads-agent:pending';
const CHANGELOG_KEY = 'ads-agent:changelog';

async function listPendingApprovals() {
  return getState(PENDING_KEY, []);
}

async function addPendingApproval(rec) {
  const pending = await listPendingApprovals();
  const entry = {
    id: `${rec.campaignId}-${rec.type}-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...rec,
  };
  pending.push(entry);
  await setState(PENDING_KEY, pending);
  return entry;
}

async function resolvePendingApproval(id, decision) {
  const pending = await listPendingApprovals();
  const idx = pending.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  pending[idx].status = decision; // 'approved' | 'rejected'
  pending[idx].resolvedAt = new Date().toISOString();
  await setState(PENDING_KEY, pending);
  return pending[idx];
}

async function getChangeLog() {
  return getState(CHANGELOG_KEY, []);
}

async function appendChangeLog(entry) {
  const log = await getChangeLog();
  log.push({ ...entry, appliedAt: new Date().toISOString() });
  await setState(CHANGELOG_KEY, log);
}

module.exports = {
  KV_CONFIGURED,
  getState,
  setState,
  listPendingApprovals,
  addPendingApproval,
  resolvePendingApproval,
  getChangeLog,
  appendChangeLog,
};
