# TLCG Workflow Tools — MCP Server Guide

A local MCP server registered in Cursor that lets you diagnose, test, and fix issues with the Google Apps Script backend, Vercel proxy, and voucher system — without touching any code manually.

---

## Quick Reference

| I want to… | Say to Cursor AI… |
|---|---|
| Test if the backend is working | "test the voucher backend" |
| Check if a new GAS URL is valid | "probe this URL: https://script.google.com/macros/s/…/exec" |
| Find all GAS URLs in the project | "find all GAS URLs in the project" |
| Update the backend URL everywhere | "update the GAS URL to https://script.google.com/macros/s/NEW_ID/exec" |
| See what URLs the proxy is using | "show me the proxy config" |
| Check Vercel env vars | "check what env vars are set in Vercel production" |
| Read recent Vercel logs | "show me the last 50 Vercel logs" |
| Read a GAS function | "show me the handleGetVoucherSummary function" |

---

## Setup

The server is located at `mcp-server/index.js` and registered in `~/.cursor/mcp.json` as **"TLCG Workflow Tools"**.

To verify it is active in Cursor: open the chat panel and click the hammer icon — **TLCG Workflow Tools** should appear with 8 tools listed.

If it does not appear, restart Cursor.

---

## Tools Reference

### 1. `probe_gas_url`

Sends a test HTTP request to any GAS URL and tells you whether it returns JSON (healthy) or HTML (broken).

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `url` | string | Yes | The full GAS exec URL |
| `action` | string | No | GAS action to include (e.g. `getVoucherSummary`) |
| `method` | `GET` or `POST` | No | Default: `GET` |

**Example prompts:**
- "probe https://script.google.com/macros/s/AKfycby8…/exec with action getVoucherSummary"
- "probe the new GAS URL using POST"

**What it tells you:**
- HTTP status code
- Whether response is JSON or HTML
- Response preview (first 400 chars)
- If HTML: explains the likely cause and fix

---

### 2. `test_voucher_backend`

Tests a specific action on the voucher backend, either through the Vercel proxy or directly against GAS.

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `action` | enum | Yes | `getVoucherSummary`, `getVoucherHistory`, `getEmployees`, `getCompanyApprovers`, `getApprovalStatus` |
| `useProxy` | boolean | No | Default: `true`. Set to `false` to bypass the proxy and hit GAS directly |
| `directUrl` | string | No | GAS URL to use when `useProxy=false`. Reads from `api/voucher.js` fallback if omitted |
| `voucherNumber` | string | No | Required only for `getVoucherHistory` |

**Example prompts:**
- "test the getVoucherSummary action"
- "test getVoucherHistory for voucher number VH-2024-001"
- "test getVoucherSummary directly against GAS, not through the proxy"

**What it tells you:**
- Whether the response is JSON or HTML
- `success` flag, `message`, total voucher counts
- Number of recent records returned

---

### 3. `find_gas_urls`

Scans all project files and lists every GAS URL with the file path and line number.

**Parameters:** None

**Files scanned:**
- `api/voucher.js`
- `api/voucher/[action].js`
- `approve_voucher.html`
- `reject_voucher.html`
- `approve_voucher.html.bak`
- `script.js`
- `index.html`
- `voucher.html`

**Example prompts:**
- "find all GAS URLs in the project"
- "which files still have the old GAS URL?"

---

### 4. `update_gas_url`

Replaces a GAS URL across all relevant project files in one operation. Automatically skips the TLCGROUP backend and PAYMENT_REQUEST backend URLs.

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `newUrl` | string | Yes | The new GAS exec URL |
| `oldUrl` | string | No | Specific old URL to replace. If omitted, replaces ALL voucher backend URLs (not TLCGROUP, not PAYMENT) |

**Example prompts:**
- "update the GAS URL to https://script.google.com/macros/s/AKfycby8…/exec"
- "replace the old URL AKfycbxha… with the new one AKfycby8…"

**Files updated:**
`api/voucher.js`, `api/voucher/[action].js`, `approve_voucher.html`, `reject_voucher.html`, `approve_voucher.html.bak`

> Note: After updating, redeploy to Vercel for changes to take effect on production.

---

### 5. `read_proxy_config`

Shows the current backend URLs configured in `api/voucher.js` and the Vercel environment variable names that override them.

**Parameters:** None

**Example prompts:**
- "show me the proxy config"
- "what backend URLs is the proxy using?"

**Output includes:**
- `VOUCHER_BACKEND` fallback URL
- `TLCGROUP_BACKEND` fallback URL
- `PAYMENT_REQUEST_BACKEND` fallback URL
- Env var names to set in Vercel Dashboard

---

### 6. `check_vercel_env`

Runs `vercel env ls` to show environment variables set in the Vercel project. Requires Vercel CLI to be installed and authenticated.

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `environment` | `production`, `preview`, or `development` | No | Default: `production` |

**Example prompts:**
- "check what env vars are set in Vercel production"
- "check Vercel preview environment variables"

**If it fails:** Run `vercel login` in the project directory first.

---

### 7. `get_vercel_logs`

Fetches recent Vercel function logs using `vercel logs`.

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `lines` | number | No | Number of log lines to return. Default: `50` |

**Example prompts:**
- "show me the last 100 Vercel logs"
- "get Vercel logs to see what the proxy is doing"

---

### 8. `read_gas_backend`

Reads a function or line range from `VOUCHER_WORKFLOW_BACKEND.gs` without opening the file manually.

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `functionName` | string | No | Name of the GAS function to find and return |
| `startLine` | number | No | Start line (1-based) — use with `endLine` |
| `endLine` | number | No | End line (1-based) — use with `startLine` |

Provide either `functionName` OR `startLine` + `endLine`.

**Example prompts:**
- "show me the handleGetVoucherSummary function in the GAS backend"
- "show me lines 300 to 400 of the GAS backend"
- "read the doPost function"

---

## Troubleshooting Workflows

### Voucher list fails to load (HTML error)

```
1. "test the voucher backend"
   → If response is HTML, the GAS deployment has an issue

2. "probe https://script.google.com/macros/s/CURRENT_ID/exec with action getVoucherSummary"
   → Confirms whether the GAS URL itself is the problem

3. If GAS returns HTML:
   a. Go to script.google.com → open the project → run any function → grant authorization
   b. Deploy > Manage deployments > edit > New version > Deploy
   c. Copy the URL (if it changed)

4. "update the GAS URL to https://script.google.com/macros/s/NEW_ID/exec"
   → Updates all files at once

5. Commit and push to Vercel
```

---

### After a new GAS deployment — verify before going live

```
1. Copy the new exec URL from GAS Deploy > Manage deployments

2. "probe https://script.google.com/macros/s/NEW_ID/exec with action getVoucherSummary"
   → Must return JSON with success: true before updating code

3. If JSON is returned:
   "update the GAS URL to https://script.google.com/macros/s/NEW_ID/exec"

4. "test the voucher backend" (with useProxy=false, directUrl=NEW_URL)
   → Final confirmation the new deployment works
```

---

### Proxy returns unexpected errors

```
1. "show me the last 100 Vercel logs"
   → Look for [Proxy POST Error] or [Proxy GET Error] lines

2. "show me the proxy config"
   → Verify the correct backend URL is set

3. "check what env vars are set in Vercel production"
   → If VOUCHER_BACKEND_URL is missing, the hardcoded fallback is used
   → Set it in Vercel Dashboard > Settings > Environment Variables
```

---

## Vercel Environment Variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables** to avoid hardcoded URLs in the proxy:

| Variable | Backend | Used for |
|---|---|---|
| `VOUCHER_BACKEND_URL` | `VOUCHER_WORKFLOW_BACKEND.gs` | All voucher operations (`getVoucherSummary`, `approveVoucher`, etc.) |
| `TLCGROUP_BACKEND_URL` | `TLCG_INTRANET_BACKEND_COMPLETE.gs` | Login, `getMasterData` |
| `PAYMENT_REQUEST_BACKEND_URL` | `PAYMENT_REQUEST_BACKEND.gs` | Payment request operations |

If these are not set, `api/voucher.js` falls back to the hardcoded URLs in the file.

---

## File Locations

```
TLCG Workflow/
├── mcp-server/
│   ├── index.js          # MCP server — all 8 tools defined here
│   └── package.json
├── api/
│   ├── voucher.js        # Main Vercel proxy (routes to correct backend)
│   └── voucher/
│       └── [action].js   # Legacy proxy route
├── VOUCHER_WORKFLOW_BACKEND.gs     # Voucher GAS backend
├── PAYMENT_REQUEST_BACKEND.gs      # Payment GAS backend
├── TLCG_INTRANET_BACKEND_COMPLETE.gs  # Login/intranet GAS backend
└── TLCG-MCP-GUIDE.md    # This file
```
