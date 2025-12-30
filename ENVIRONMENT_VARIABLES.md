# 🔐 Environment Variables Configuration

## 📋 Overview

This project uses **Vercel Serverless Functions** as a proxy to avoid CORS issues. Environment variables are configured differently based on where they're used.

## 🔑 Key Principle

- **Server-side** (Vercel Serverless Functions): No prefix needed → `GOOGLE_APPS_SCRIPT_URL`
- **Client-side** (Next.js): Requires prefix → `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL`
- **Client-side** (Vite/React): Requires prefix → `VITE_GOOGLE_APPS_SCRIPT_URL`

## ✅ Current Setup (Vercel Serverless Functions)

### Server-side Variable (No Prefix Needed)

**File:** `api/voucher/[action].js`

```javascript
const GAS_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 'fallback-url';
```

**Why no prefix?**  
Because this code runs **server-side** on Vercel. The `process.env` object has access to all environment variables without prefix.

### Client-side Variable (Using Relative URL)

**File:** `phieu_thu_chi.html`

```javascript
const GOOGLE_APPS_SCRIPT_WEB_APP_URL = '/api/voucher';
```

**Why relative URL?**  
The frontend uses a **relative URL** (`/api/voucher`), which means it calls your own domain. This avoids CORS and doesn't require any environment variable.

## 📝 Vercel Configuration

### Step 1: Add Environment Variable in Vercel Dashboard

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Add:
   - **Name:** `GOOGLE_APPS_SCRIPT_URL`
   - **Value:** `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
   - **Environment:** Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your project

### Step 2: Verify Configuration

Check Vercel deployment logs to ensure the variable is loaded:

```bash
# In Vercel Dashboard → Deployments → Click on latest deployment → Functions tab
# Look for: [Proxy GET] https://script.google.com/...
```

## 🔄 If You Switch to Next.js or Vite

### Next.js (Client-side)

If you move to Next.js and need the URL in client-side code:

1. **Change variable name in Vercel:**
   - Add: `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL`
   - Keep: `GOOGLE_APPS_SCRIPT_URL` (for server-side)

2. **Update client code:**
   ```javascript
   const GAS_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
   ```

3. **Update server code:**
   ```javascript
   const GAS_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
   ```

### Vite/React (Client-side)

1. **Change variable name in Vercel:**
   - Add: `VITE_GOOGLE_APPS_SCRIPT_URL`

2. **Update code:**
   ```javascript
   const GAS_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
   ```

## 🚨 Common Issues

### ❌ Variable is `undefined`

**Cause:** Variable not set in Vercel or wrong environment selected.

**Fix:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. Ensure variable is set for the correct environment (Production/Preview/Development)
3. Redeploy after adding/updating variables

### ❌ Client-side: Variable is `undefined`

**Cause:** Using server-side variable name in client-side code.

**Fix:**
- Use `NEXT_PUBLIC_*` prefix for Next.js
- Use `VITE_*` prefix for Vite
- Or use relative URL `/api/voucher` (recommended)

### ❌ CORS Error

**Cause:** Frontend still calling Google Apps Script directly instead of proxy.

**Fix:**
- Ensure `GOOGLE_APPS_SCRIPT_WEB_APP_URL = '/api/voucher'` in frontend
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

## 📚 References

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

