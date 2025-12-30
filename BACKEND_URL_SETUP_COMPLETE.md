# ✅ Backend URL Configuration - COMPLETE GUIDE

## 📋 Two Backends Overview

### 1. VOUCHER_WORKFLOW_BACKEND.gs (Primary for Vouchers)
**URL:** `https://script.google.com/macros/s/AKfycbwcz8QPzcb7fCeTc7f7xjBHNamLq44bh-TTTH_1MCCOOwtw2bI9U_8yACfAr6SV_V3K/exec`

**Handles:**
- ✅ `getVoucherSummary` - Get voucher summary list
- ✅ `getVoucherHistory` - Get voucher history/details
- ✅ `sendApprovalEmail` - Send voucher for approval
- ✅ `approveVoucher` - Approve a voucher
- ✅ `rejectVoucher` - Reject a voucher
- ✅ `login` - User authentication

**Used by:**
- Proxy `/api/voucher` ← **PRIMARY**
- `phieu_thu_chi.html` - All voucher operations
- `index.html` - Voucher summary (via proxy)
- `approve_voucher.html` - Voucher approval
- `reject_voucher.html` - Voucher rejection

### 2. TLCG_INTRANET_BACKEND_COMPLETE.gs (Intranet Backend)
**URL:** `https://script.google.com/macros/s/AKfycbxtJKuVxfWePJ0216BDmnmfgdaJhovY1ZlwLJB6kyAe0TpzcLrQbI9toFTV-g5bN_xU/exec`

**Handles:**
- ✅ `login` - User authentication
- ✅ `getMasterData` - Master data (employees, customers, suppliers)
- ✅ `approveVoucher` - Approve a voucher
- ✅ `rejectVoucher` - Reject a voucher
- ✅ `sendApprovalEmail` - Send voucher for approval
- ❌ Missing: `getVoucherSummary` and `getVoucherHistory`

**Used by:**
- Currently not used (can be used for `getMasterData` if needed)
- Backup for login if VOUCHER_WORKFLOW_BACKEND fails

## ✅ Current Configuration

### Proxy Configuration
**File:** `api/voucher/[action].js`
- **Environment Variable:** `GOOGLE_APPS_SCRIPT_URL`
- **Fallback URL:** VOUCHER_WORKFLOW_BACKEND
- **Purpose:** Handle all voucher-related API calls

### Frontend Files
All frontend files use `/api/voucher` (proxy) which routes to:
- ✅ VOUCHER_WORKFLOW_BACKEND (for all voucher operations)

## 🔧 Vercel Environment Variable Setup

### Required Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add/Update:
   ```
   Name: GOOGLE_APPS_SCRIPT_URL
   Value: https://script.google.com/macros/s/AKfycbwcz8QPzcb7fCeTc7f7xjBHNamLq44bh-TTTH_1MCCOOwtw2bI9U_8yACfAr6SV_V3K/exec
   ```
3. Select all environments (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your project

## 📝 File-by-File Breakdown

### ✅ Already Configured

1. **`api/voucher/[action].js`**
   - ✅ Uses VOUCHER_WORKFLOW_BACKEND (fallback)
   - ✅ Will use `GOOGLE_APPS_SCRIPT_URL` env var if set

2. **`phieu_thu_chi.html`**
   - ✅ Uses `/api/voucher` (proxy)
   - ✅ All voucher operations go through proxy

3. **`index.html`**
   - ✅ Uses `/api/voucher` (proxy) for voucher operations
   - ✅ Uses `/api/voucher` for login (VOUCHER_WORKFLOW_BACKEND supports login)
   - ⚠️ If `getMasterData` is needed, may need to add it to VOUCHER_WORKFLOW_BACKEND or use TLCG_INTRANET_BACKEND directly

4. **`approve_voucher.html`** & **`reject_voucher.html`**
   - ✅ Use `/api/voucher` (proxy)

## 🚨 Important Notes

1. **VOUCHER_WORKFLOW_BACKEND is PRIMARY** for all voucher operations
2. **TLCG_INTRANET_BACKEND** can be used for `getMasterData` if needed
3. Both backends support `login`, so either can be used
4. The proxy routes all voucher operations to VOUCHER_WORKFLOW_BACKEND

## ✅ Verification Checklist

- [x] Proxy configured to use VOUCHER_WORKFLOW_BACKEND
- [x] Frontend files use `/api/voucher`
- [ ] Vercel environment variable `GOOGLE_APPS_SCRIPT_URL` set to VOUCHER_WORKFLOW_BACKEND URL
- [ ] Vercel project redeployed
- [ ] Test voucher operations (submit, approve, reject)
- [ ] Test login functionality
- [ ] Test getVoucherSummary (recent vouchers)

## 🔄 If You Need `getMasterData`

If `index.html` needs `getMasterData` and VOUCHER_WORKFLOW_BACKEND doesn't have it, you have two options:

### Option 1: Add `getMasterData` to VOUCHER_WORKFLOW_BACKEND
- Copy the function from TLCG_INTRANET_BACKEND_COMPLETE.gs
- Add it to VOUCHER_WORKFLOW_BACKEND.gs

### Option 2: Use TLCG_INTRANET_BACKEND for `getMasterData`
- Update `index.html` to use TLCG_INTRANET_BACKEND URL directly for `getMasterData` only
- Keep using proxy for voucher operations

