/**
 * local-0g-node.js — Persistent local 0G Storage KV + Log node
 *
 * All data is persisted to .0g-data/ directory (JSON files) so deployed
 * agents and gigs survive process restarts.
 *
 * API exactly matches what zerog.ts expects:
 *   KV  (port 6789): GET/PUT/DELETE /kv/:key,  GET /kv?prefix=
 *   Log (port 6790): POST /log/:streamId,       GET /log/:streamId, GET /log/:streamId/last
 */

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const fs         = require('fs');
const path       = require('path');

// ── Persistence ───────────────────────────────────────────────────────────────
const DATA_DIR  = path.join(__dirname, '.0g-data');
const KV_FILE   = path.join(DATA_DIR, 'kv.json');
const LOG_FILE  = path.join(DATA_DIR, 'log.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadJSON(file, def) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return def; }
}
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Load persisted state
const kvRaw  = loadJSON(KV_FILE, {});
const logRaw = loadJSON(LOG_FILE, {});

// Use Maps in memory
const kvStore  = new Map(Object.entries(kvRaw));  // key → JSON string
const logStore = new Map(Object.entries(logRaw).map(([k, v]) => [k, v])); // streamId → []

function persistKV() { saveJSON(KV_FILE, Object.fromEntries(kvStore)); }
function persistLog() { saveJSON(LOG_FILE, Object.fromEntries(logStore)); }

const kvCount  = kvStore.size;
const logCount = [...logStore.values()].reduce((a, v) => a + v.length, 0);

// ── KV Node (port 6789) ───────────────────────────────────────────────────────
const appKV = express();
appKV.use(cors());
appKV.use(bodyParser.json({ limit: '10mb' }));

// GET /kv?prefix=... → Array<{ key, value }>
appKV.get('/kv', (req, res) => {
  const { prefix } = req.query;
  const results = [];
  for (const [k, v] of kvStore.entries()) {
    if (!prefix || k.startsWith(prefix)) results.push({ key: k, value: v });
  }
  res.json(results);
});

// GET /kv/:key → { value: string }
appKV.get('/kv/:key', (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const value = kvStore.get(key);
  if (value === undefined) return res.status(404).json({ error: 'Key not found' });
  res.json({ value });
});

// PUT /kv/:key  body: { value: string }
appKV.put('/kv/:key', (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ error: 'Missing value' });
  kvStore.set(key, value);
  persistKV();
  res.json({ success: true });
});

// DELETE /kv/:key
appKV.delete('/kv/:key', (req, res) => {
  const key = decodeURIComponent(req.params.key);
  kvStore.delete(key);
  persistKV();
  res.json({ success: true });
});

appKV.listen(6789, () => {
  console.log(`✅  0G KV node  → http://localhost:6789  (${kvCount} persisted records)`);
});

// ── Log Node (port 6790) ──────────────────────────────────────────────────────
const appLog = express();
appLog.use(cors());
appLog.use(bodyParser.json({ limit: '10mb' }));

// POST /log/:streamId  body: { data: string, timestamp: number }
appLog.post('/log/:streamId', (req, res) => {
  const streamId = decodeURIComponent(req.params.streamId);
  const { data, timestamp } = req.body;
  if (!data) return res.status(400).json({ error: 'Missing data' });
  if (!logStore.has(streamId)) logStore.set(streamId, []);
  const entries = logStore.get(streamId);
  entries.push({ offset: entries.length, data, timestamp: timestamp || Date.now() });
  persistLog();
  res.json({ success: true });
});

// GET /log/:streamId?from=N&to=N
appLog.get('/log/:streamId', (req, res) => {
  const streamId = decodeURIComponent(req.params.streamId);
  const from = parseInt(req.query.from || '0', 10);
  const to   = req.query.to !== undefined ? parseInt(req.query.to, 10) : undefined;
  const entries = logStore.get(streamId) || [];
  res.json(entries.filter(e => e.offset >= from && (to === undefined || e.offset <= to)));
});

// GET /log/:streamId/last?n=N
appLog.get('/log/:streamId/last', (req, res) => {
  const streamId = decodeURIComponent(req.params.streamId);
  const n = parseInt(req.query.n || '10', 10);
  res.json((logStore.get(streamId) || []).slice(-n));
});

appLog.listen(6790, () => {
  console.log(`✅  0G Log node → http://localhost:6790  (${logCount} persisted events)`);
  console.log('\n  Data persisted in: .0g-data/');
  console.log('  For real 0G: https://github.com/0gfoundation/0g-storage-kv\n');
});
