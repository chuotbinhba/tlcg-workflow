# 🚨 URGENT: Update Google Apps Script URL

## ⚠️ Problem
Browser is still calling the old Google Apps Script URL directly instead of using the proxy `/api/voucher`.

**Old URL (404):**  
`https://script.google.com/macros/s/AKfycbysXIIwCapkvlVgGg77oLAq4mxCF-LvpzyLEQP0wePlOhkkjDYT3CRKNEXai3fwBECq/exec`

**New URL:**  
`https://script.google.com/macros/s/AKfycbw05Cr7-Mm2TtgQgxVaVoobvdSUHtX2Y8vjTi0Fd-_UmL0ojojyLDOwXwyaMWDwGW06Iw/exec`

## ✅ Solution

### Step 1: Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `GOOGLE_APPS_SCRIPT_URL`
3. Update value to:
   ```
   https://script.google.com/macros/s/AKfycbw05Cr7-Mm2TtgQgxVaVoobvdSUHtX2Y8vjTi0Fd-_UmL0ojojyLDOwXwyaMWDwGW06Iw/exec
   ```
4. Click **Save**
5. **Redeploy** your project (or wait for auto-redeploy)

### Step 2: Clear Browser Cache

The browser may be caching the old code. Clear cache:

1. **Hard Refresh:**
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Or Clear Cache Manually:**
   - Open DevTools (F12)
   - Right-click on Refresh button
   - Select "Empty Cache and Hard Reload"

3. **Or Clear All Site Data:**
   - Open DevTools (F12)
   - Application tab → Clear storage → Clear site data

### Step 3: Verify Deployment

1. Check Vercel Dashboard → Deployments
2. Ensure latest deployment shows the new code
3. Check Function logs to see if environment variable is loaded correctly

### Step 4: Test Again

1. Open browser in Incognito/Private mode (to avoid cache)
2. Go to `https://workflow.egg-ventures.com/phieu_thu_chi.html`
3. Open DevTools → Network tab
4. Fill form and submit
5. Check Network tab:
   - ✅ Should see: `/api/voucher?action=getVoucherSummary`
   - ❌ Should NOT see: `script.google.com/macros/s/...`

## 🔍 How to Check if It's Fixed

1. Open DevTools (F12) → Network tab
2. Submit the form
3. Look for requests:
   - ✅ **Correct:** `https://workflow.egg-ventures.com/api/voucher?...`
   - ❌ **Wrong:** `https://script.google.com/macros/s/...`

## 📝 Notes

- The code in `phieu_thu_chi.html` is already correct (`/api/voucher`)
- The fallback URL in `api/voucher/[action].js` has been updated to the new URL
- The issue is likely browser cache or Vercel environment variable not updated

## 🆘 If Still Not Working

1. Check Vercel deployment logs:
   - Dashboard → Deployments → Latest → Functions tab
   - Look for `[Proxy Warning]` - if you see it, environment variable is not set

2. Check browser console:
   - Should see requests to `/api/voucher`
   - Should NOT see CORS errors

3. Verify environment variable:
   - Vercel Dashboard → Settings → Environment Variables
   - Make sure it's set for **Production** environment
   - Value should be the NEW URL (ending in `...SV_V3K/exec`)

