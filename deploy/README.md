# Self-hosting TLCG Workflow on Ubuntu

Runs the app as one Node process alongside n8n. The `api/` handlers are plain
`(req, res)` functions with no Vercel-specific imports, so `server.js` mounts
them on Express unchanged.

## What runs where

```
Internet
   │
   ▼
nginx / Caddy  ← already fronting n8n
   ├── n8n.<domain>                → n8n        :5678
   └── workflow.egg-ventures.com   → this app   :3000
                                          │
                                          ▼
                            Google Apps Script ×3  →  Sheets / Drive
```

There is **no database**. Google Sheets is the datastore, so the server is
stateless — if it dies, redeploy and nothing is lost.

## Install

```bash
sudo mkdir -p /opt/tlcg-workflow && sudo chown $USER:$USER /opt/tlcg-workflow
git clone https://github.com/theoneplusco/tlcg-workflow.git /opt/tlcg-workflow
cd /opt/tlcg-workflow
bash deploy/setup.sh
```

`setup.sh` checks Node ≥ 18, installs production deps, creates `.env` from the
template (mode 600), warns on a port clash, and installs + enables the systemd
unit with the correct user and paths.

## Configure

```bash
nano /opt/tlcg-workflow/.env      # values from Vercel → Settings → Environment Variables
sudo systemctl restart tlcg-workflow
```

Required for Drive uploads: `GOOGLE_SERVICE_ACCOUNT_KEY` (full service-account
JSON on one line) and `MASTER_SPREADSHEET_ID`. The `TLCG_*_BACKEND_URL` vars
each have a hardcoded fallback, so the app runs without them — set them anyway
so Apps Script URLs can be rotated without editing source.

**`.env` holds a live Google credential.** It is gitignored and `chmod 600`;
keep it that way.

## Reverse proxy

Pick one and add it next to the existing n8n config:

- **Caddy** — append `deploy/Caddyfile`, `sudo systemctl reload caddy`.
  TLS is automatic.
- **nginx** — copy `deploy/nginx-tlcg-workflow.conf` to `sites-available`,
  symlink into `sites-enabled`, `nginx -t && systemctl reload nginx`, then
  `sudo certbot --nginx -d workflow.egg-ventures.com`.

Both set a 12 MB body limit (the app declares 10 MB) and a 120 s read timeout,
because Apps Script can be slow to respond.

## Verify

```bash
curl -sS localhost:3000/api/config                 # JSON of non-secret config
curl -sS -o /dev/null -w '%{http_code}\n' localhost:3000/     # 200
journalctl -u tlcg-workflow -f
```

Then in a browser: load the site, switch EN/VI, reload and confirm the language
persisted, and submit a voucher with an attachment to exercise the upload path.

## Update

```bash
cd /opt/tlcg-workflow && bash deploy/update.sh
```

Pulls `main`, syncs prod deps, restarts the service.

## Cutover from Vercel

1. Deploy here and test via the server IP or a temporary hostname.
2. Copy every env var out of Vercel **before** touching DNS.
3. Point `workflow.egg-ventures.com` at the server (consider Cloudflare's free
   proxy in front for DDoS protection and to hide the origin IP).
4. Keep the Vercel project up for a day or two as a rollback path.

Apps Script deployment is unchanged and independent — `.gs` files are still
pasted into `script.google.com` and deployed there.

## Notes and gotchas

- **Route order in `server.js` matters.** `/api/drive-upload` is mounted before
  `express.json()` because it parses multipart itself with busboy. Moving it
  below the body parser makes uploads hang. Do not reorder.
- **`trust proxy` is on**, so the per-IP rate limit in `api/voucher.js`
  (30 req/min) sees the real client IP rather than the proxy's.
- **Port 3000** may clash with other apps (Grafana likes it too). n8n's 5678 is
  clear. Change `PORT` in `.env` if needed.
- **`/api/voucher/<action>`** is mounted for compatibility but no frontend code
  calls it; the live path is `POST /api/voucher`.
- **systemd unit is hardened** (`ProtectSystem=strict`, read-only app dir). The
  app writes nothing to disk, so this is safe.
