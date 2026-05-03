// Mock 0G Storage Service for Local Development
// Provides KV and Log endpoints compatible with 0G Labs API
// Uses only Node.js built-in modules (no external dependencies)

import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 6789;
const DATA_DIR = path.join(__dirname, '.zerog-mock');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const kvDir = path.join(DATA_DIR, 'kv');
const logDir = path.join(DATA_DIR, 'logs');

if (!fs.existsSync(kvDir)) fs.mkdirSync(kvDir, { recursive: true });
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Helper: Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Helper: Count lines in a file
function getLineCount(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').filter(Boolean).length;
}

// Helper: Send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Health check
    if (pathname === '/health') {
      sendJSON(res, 200, {
        status: 'healthy',
        service: '0G Mock Storage',
        kv: 'ready',
        log: 'ready',
        timestamp: Date.now(),
      });
      return;
    }

    // Root endpoint
    if (pathname === '/') {
      sendJSON(res, 200, {
        service: '0G Mock Storage Service',
        version: '1.0.0',
        endpoints: {
          kv: '/kv/{key}',
          log: '/log/{streamId}',
          health: '/health',
        },
      });
      return;
    }

    // KV Store routes
    if (pathname.startsWith('/kv')) {
      const key = pathname.slice(4).split('/').filter(Boolean)[0];

      if (method === 'GET' && pathname === '/kv') {
        // List all keys
        const files = fs.readdirSync(kvDir);
        const keys = files.map(f => f.replace('.json', ''));
        sendJSON(res, 200, { keys, count: keys.length });
        return;
      }

      if (method === 'GET' && key) {
        // Get value
        const filePath = path.join(kvDir, `${key}.json`);
        if (!fs.existsSync(filePath)) {
          sendJSON(res, 404, { error: 'Not found' });
          return;
        }
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        sendJSON(res, 200, { key, value: JSON.stringify(data), updatedAt: data.updatedAt });
        return;
      }

      if (method === 'PUT' && key) {
        // Set value
        const body = await parseBody(req);
        const filePath = path.join(kvDir, `${key}.json`);
        const data = { value: body.value, updatedAt: Date.now() };
        fs.writeFileSync(filePath, JSON.stringify(data));
        sendJSON(res, 200, { key, success: true });
        return;
      }

      if (method === 'DELETE' && key) {
        // Delete value
        const filePath = path.join(kvDir, `${key}.json`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        sendJSON(res, 200, { key, success: true });
        return;
      }
    }

    // Log Store routes
    if (pathname.startsWith('/log')) {
      const streamId = pathname.slice(5).split('/').filter(Boolean)[0];

      if (method === 'POST' && streamId) {
        // Append to log
        const body = await parseBody(req);
        const filePath = path.join(logDir, `${streamId}.jsonl`);
        const entry = JSON.stringify({
          streamId,
          data: body.data,
          timestamp: Date.now(),
          index: getLineCount(filePath),
        });
        fs.appendFileSync(filePath, entry + '\n');
        sendJSON(res, 200, { streamId, success: true });
        return;
      }

      if (method === 'GET' && streamId) {
        // Read log entries
        const filePath = path.join(logDir, `${streamId}.jsonl`);
        if (!fs.existsSync(filePath)) {
          sendJSON(res, 200, { streamId, entries: [] });
          return;
        }
        const content = fs.readFileSync(filePath, 'utf-8').trim();
        const entries = content.split('\n').filter(Boolean).map(line => JSON.parse(line));
        sendJSON(res, 200, { streamId, entries, count: entries.length });
        return;
      }
    }

    // 404
    sendJSON(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error('Error:', err);
    sendJSON(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ 0G Mock Storage Service running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`   GET  /kv/{key}           - Get a value`);
  console.log(`   PUT  /kv/{key}           - Set a value`);
  console.log(`   GET  /kv                 - List all keys`);
  console.log(`   DELETE /kv/{key}         - Delete a key`);
  console.log(`   POST /log/{streamId}     - Append to log`);
  console.log(`   GET  /log/{streamId}     - Read log entries`);
  console.log(`   GET  /health             - Health check\n`);
});
