# 🔧 Vercel Environment Variables Setup - COMPLETE GUIDE

## 📋 Backend URLs (Personal Account)

### 1. TLCGroup Backend (Intranet Operations)
**ID:** `AKfycbwQ9lisLCr2iATBF2NGOqdNlG_f8ygDKrIEYkiZYsaVbm_7gFI4P_EC0FC5Wq-TJdMYKw`

**Web App URL:**
```
https://script.google.com/macros/s/AKfycbwQ9lisLCr2iATBF2NGOqdNlG_f8ygDKrIEYkiZYsaVbm_7gFI4P_EC0FC5Wq-TJdMYKw/exec
```

**Handles:**
- ✅ `login` - User authentication
- ✅ `getMasterData` - Master data (employees, customers, suppliers)
- ✅ `approveVoucher` - Approve voucher
- ✅ `rejectVoucher` - Reject voucher
- ✅ `sendApprovalEmail` - Send approval email

### 2. Phieu Thu Chi Backend (Voucher Operations)
**ID:** `AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd`

**Web App URL:**
```
https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec
```

**Handles:**
- ✅ `getVoucherSummary` - Get voucher summary list
- ✅ `getVoucherHistory` - Get voucher history/details
- ✅ `sendApprovalEmail` - Send voucher for approval
- ✅ `approveVoucher` - Approve a voucher
- ✅ `rejectVoucher` - Reject a voucher
- ✅ `login` - User authentication

## ✅ Vercel Environment Variable Setup

### Step 1: Access Vercel Dashboard

1. Go to **https://vercel.com/dashboard**
2. Select your project: **TLCG Workflow** (or your project name)
3. Click **Settings** in the top navigation
4. Click **Environment Variables** in the left sidebar

### Step 2: Add/Update Environment Variable

**Variable Name:** `GOOGLE_APPS_SCRIPT_URL`

**Variable Value:**
```
https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec
```

**Important Settings:**
- ✅ **Production** - Check this box
- ✅ **Preview** - Check this box  
- ✅ **Development** - Check this box

### Step 3: Save and Redeploy

1. Click **Save** button
2. Go to **Deployments** tab
3. Click **⋯ (three dots)** on the latest deployment
4. Click **Redeploy**
5. Or wait for automatic redeploy (if auto-deploy is enabled)

## 📝 Configuration Summary

### Current Setup

**Proxy (`api/voucher/[action].js`):**
- Uses `GOOGLE_APPS_SCRIPT_URL` environment variable
- Falls back to Phieu Thu Chi Backend if env var not set
- Routes all voucher operations to Phieu Thu Chi Backend

**Frontend Files:**
- All use `/api/voucher` (proxy)
- No direct URLs needed
- Proxy handles routing to correct backend

### Which Backend is Used?

**For Voucher Operations (via Proxy):**
- ✅ Phieu Thu Chi Backend
- Used by: `phieu_thu_chi.html`, `index.html` (voucher summary), `approve_voucher.html`, `reject_voucher.html`

**For Intranet Operations (if needed directly):**
- ✅ TLCGroup Backend
- Can be used for: `getMasterData`, `login` (if not using proxy)

## 🔍 Verification Steps

### Step 1: Verify Environment Variable

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Confirm `GOOGLE_APPS_SCRIPT_URL` exists
3. Confirm value matches Phieu Thu Chi Backend URL
4. Confirm all environments (Production, Preview, Development) are checked

### Step 2: Check Deployment Logs

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Go to **Functions** tab
4. Look for logs showing:
   - `[Proxy GET]` or `[Proxy POST]` messages
   - Should NOT see `[Proxy Warning]` about missing env var

### Step 3: Test API Endpoint

1. Open browser → DevTools → Network tab
2. Visit: `https://workflow.egg-ventures.com/api/voucher?action=getVoucherSummary`
3. Should return JSON response (not error)
4. Check Network tab - request should succeed

### Step 4: Test Frontend

1. Visit `https://workflow.egg-ventures.com/`
2. Try to login
3. Check console for errors
4. All requests should go to `/api/voucher` (not direct Google Apps Script URL)

## 🚨 Troubleshooting

### Issue: Environment Variable Not Working

**Symptoms:**
- Proxy logs show `[Proxy Warning]` about missing env var
- Requests fail with 500 errors

**Solution:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. Ensure variable name is exactly: `GOOGLE_APPS_SCRIPT_URL`
3. Ensure all environments are checked
4. Redeploy after adding/updating variable

### Issue: Wrong Backend URL

**Symptoms:**
- Requests work but return wrong data
- Functions not found errors

**Solution:**
1. Verify the URL in environment variable matches Phieu Thu Chi Backend
2. Test the URL directly in browser (should show "Google Apps Script is running!")
3. Update environment variable if needed
4. Redeploy

### Issue: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- Requests blocked by browser

**Solution:**
1. Ensure Google Apps Script deployment has "Anyone" access (not "Anyone with Google account")
2. Check proxy CORS headers are set correctly
3. Verify requests go through proxy (`/api/voucher`), not direct to Google Apps Script

## 📋 Quick Reference

### Environment Variable
```
Name: GOOGLE_APPS_SCRIPT_URL
Value: https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec
Environments: Production, Preview, Development (all checked)
```

### Backend URLs

**Phieu Thu Chi (Voucher Operations):**
```
https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec
```

**TLCGroup (Intranet Operations):**
```
https://script.google.com/macros/s/AKfycbwQ9lisLCr2iATBF2NGOqdNlG_f8ygDKrIEYkiZYsaVbm_7gFI4P_EC0FC5Wq-TJdMYKw/exec
```

## ✅ Checklist

- [ ] Added `GOOGLE_APPS_SCRIPT_URL` to Vercel environment variables
- [ ] Set value to Phieu Thu Chi Backend URL
- [ ] Checked all environments (Production, Preview, Development)
- [ ] Saved environment variable
- [ ] Redeployed Vercel project
- [ ] Verified deployment logs show no warnings
- [ ] Tested API endpoint directly
- [ ] Tested frontend login/voucher operations
- [ ] Confirmed no CORS errors
- [ ] Confirmed requests go through proxy

