# AGENTS.md

## Cursor Cloud specific instructions

### Architecture Overview

TLCG Workflow is a BPM system with:
- **Frontend**: Static HTML/CSS/JS (vanilla, Tailwind CSS, no framework)
- **API Proxy**: Vercel serverless functions under `api/` that forward requests to Google Apps Script backends
- **Backend**: Google Apps Script web apps (deployed externally, `.gs` files are reference copies)
- **Database**: Google Sheets (external, no local DB needed)

### Running the Dev Server

Use the local dev server (faster startup, no auth required):
```bash
node dev-server.js 3000
```
This serves static files and loads `api/*.js` serverless functions locally on port 3000. It loads `.env.local` for environment variables.

Alternative: `npm start` runs `vercel dev` but requires `VERCEL_TOKEN` env var or interactive login.

### Environment Variables

Copy `.env` to `.env.local` and fill in real values. The `api/voucher.js` has hardcoded fallback backend URLs, so the proxy works even without configured env vars.

### Key Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Dev server | `node dev-server.js 3000` |
| Build (no-op for static site) | `npm run build` |
| Tailwind CSS rebuild | `npx @tailwindcss/cli -i src/input.css -o dist/output.css` |
| MCP server | `cd mcp-server && npm start` |

### No Lint/Test Commands

This project has **no ESLint, Prettier, or test framework** configured. There are no `lint` or `test` npm scripts. Code quality is maintained by convention (see `.github/copilot-instructions.md`).

### Important Gotchas

1. **Module type**: The repo does not declare `"type": "module"` in `package.json`, but `api/*.js` files use ESM (`import`/`export`). Node.js will warn about this; it still works.
2. **Google Apps Script files** (`.gs`): These are reference copies. They run on Google's servers, not locally. Do not try to execute them with Node.js.
3. **API proxy routing**: `api/voucher.js` routes to 3 different backends based on the `action` field. See the `intranetActions` and `paymentRequestActions` arrays in that file.
4. **Large HTML files**: `voucher.html` is ~547KB with embedded logic. Edits there need care.
5. **Pre-built CSS**: `dist/output.css` is committed. Only rebuild if modifying `src/input.css` or Tailwind classes.
