#!/usr/bin/env node
// Minimal local dev server for TLCG Workflow
// Serves static files and loads Vercel serverless functions from api/
// Usage: node dev-server.js [port]

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Load .env.local
config({ path: join(__dirname, '.env.local') });
config({ path: join(__dirname, '.env') });

const PORT = parseInt(process.argv[2] || '3000', 10);

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.webp': 'image/webp',
};

async function handleApi(req, res, pathname) {
  let handlerModule;
  try {
    if (pathname === '/api/config') {
      handlerModule = await import('./api/config.js');
    } else if (pathname === '/api/voucher') {
      handlerModule = await import('./api/voucher.js');
    } else if (pathname.startsWith('/api/voucher/')) {
      handlerModule = await import('./api/voucher/[action].js');
      const action = pathname.replace('/api/voucher/', '');
      req.query = req.query || {};
      req.query.action = action;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }
  } catch (e) {
    console.error(`Failed to load API handler for ${pathname}:`, e.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to load handler' }));
    return;
  }

  const handler = handlerModule.default;

  // Parse query string
  const url = new URL(req.url, `http://localhost:${PORT}`);
  req.query = req.query || {};
  for (const [k, v] of url.searchParams) req.query[k] = v;

  // Parse body for POST
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString();
    const ct = req.headers['content-type'] || '';
    if (ct.includes('application/json')) {
      try { req.body = JSON.parse(body); } catch { req.body = body; }
    } else if (ct.includes('application/x-www-form-urlencoded')) {
      req.body = Object.fromEntries(new URLSearchParams(body));
    } else {
      req.body = body;
    }
  }

  // Build a minimal Vercel-like res adapter
  const fakeRes = {
    _statusCode: 200,
    _headers: {},
    status(code) { this._statusCode = code; return this; },
    setHeader(k, v) { this._headers[k] = v; },
    json(data) {
      this._headers['Content-Type'] = 'application/json';
      res.writeHead(this._statusCode, this._headers);
      res.end(JSON.stringify(data));
    },
    end(data) {
      res.writeHead(this._statusCode, this._headers);
      res.end(data || '');
    },
    send(data) {
      res.writeHead(this._statusCode, this._headers);
      res.end(typeof data === 'string' ? data : JSON.stringify(data));
    },
  };

  try {
    await handler(req, fakeRes);
  } catch (err) {
    console.error(`API error ${pathname}:`, err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: err.message }));
    }
  }
}

async function serveStatic(res, pathname) {
  // Default to index.html
  if (pathname === '/') pathname = '/index.html';

  // Clean URLs: try .html extension
  let filePath = join(__dirname, pathname);
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    if (!extname(filePath)) {
      filePath += '.html';
    }
  }

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    await handleApi(req, res, pathname);
  } else {
    await serveStatic(res, pathname);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TLCG Workflow dev server running at http://localhost:${PORT}`);
  console.log('Serving static files + API routes from /workspace');
});
