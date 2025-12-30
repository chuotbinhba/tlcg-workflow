# ✅ Fix loadMasterData - Smart Routing Implementation

## 🔍 Problem Identified

The `loadMasterData()` function in `index.html` was calling `/api/voucher` (proxy) with action `getMasterData`, but:

- **Phieu Thu Chi Backend** does NOT have `getMasterData` action
- **TLCGroup Backend** DOES have `getMasterData` action

## ✅ Solution: Smart Routing in Proxy

Updated `api/voucher.js` to intelligently route requests based on action:

1. **Default Route**: Phieu Thu Chi Backend (for all voucher operations)
2. **Special Route**: TLCGroup Backend (for `getMasterData`)

## 📝 Changes Made

### 1. Proxy Routing Logic (`api/voucher.js`)

```javascript
// Two backend URLs
const PHIEU_THU_CHI_BACKEND = process.env.GOOGLE_APPS_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec';

const TLCGROUP_BACKEND = process.env.TLCGROUP_BACKEND_URL || 
  'https://script.google.com/macros/s/AKfycbwQ9lisLCr2iATBF2NGOqdNlG_f8ygDKrIEYkiZYsaVbm_7gFI4P_EC0FC5Wq-TJdMYKw/exec';

// Extract action early to determine routing
let action = null;
if (req.method === 'GET') {
  action = req.query.action;
} else if (req.method === 'POST') {
  if (req.body && req.body.action) {
    action = req.body.action;
  }
}

// Route getMasterData to TLCGroup Backend
if (action === 'getMasterData') {
  GAS_URL = TLCGROUP_BACKEND;
  console.log('[Proxy] Routing getMasterData to TLCGroup Backend');
}
```

### 2. Re-routing After Body Parsing

For POST requests, if action wasn't found initially but is found after parsing the body, the proxy will re-route:

```javascript
// Re-check action after parsing (in case we couldn't get it earlier)
if (!action && parsedBody && parsedBody.action) {
  action = parsedBody.action;
  if (action === 'getMasterData' && GAS_URL !== TLCGROUP_BACKEND) {
    GAS_URL = TLCGROUP_BACKEND;
    console.log('[Proxy POST] Re-routing getMasterData to TLCGroup Backend');
  }
}
```

## 🎯 How It Works

1. **Frontend** calls `/api/voucher` with action `getMasterData`
2. **Proxy** extracts the action from the request
3. **Proxy** routes `getMasterData` → TLCGroup Backend
4. **Proxy** routes all other actions → Phieu Thu Chi Backend
5. **Backend** processes the request and returns data
6. **Proxy** returns the response to frontend

## ⚙️ Environment Variables (Optional)

You can set these in Vercel Dashboard → Settings → Environment Variables:

1. **`GOOGLE_APPS_SCRIPT_URL`** (Phieu Thu Chi Backend)
   - Default: `https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec`
   - Used for: All voucher operations

2. **`TLCGROUP_BACKEND_URL`** (TLCGroup Backend) - **NEW**
   - Default: `https://script.google.com/macros/s/AKfycbwQ9lisLCr2iATBF2NGOqdNlG_f8ygDKrIEYkiZYsaVbm_7gFI4P_EC0FC5Wq-TJdMYKw/exec`
   - Used for: `getMasterData` action

**Note**: Fallback URLs are already set, so environment variables are optional but recommended for production.

## ✅ Verification Steps

After deployment:

1. **Open Browser Console** on `https://workflow.egg-ventures.com`
2. **Navigate to Home Page** (should trigger `loadMasterData()`)
3. **Check Console Logs**:
   - Should see: `Loading master data from Google Sheets...`
   - Should see: `✅ Master data loaded:` with counts for employees, customers, suppliers
4. **Check Network Tab**:
   - Request to `/api/voucher` with action `getMasterData`
   - Should route to TLCGroup Backend
   - Should return data with `employees`, `customers`, `suppliers` arrays

## 📊 Expected Behavior

### ✅ Success Case

```javascript
// Console Output
Loading master data from Google Sheets...
✅ Master data loaded: { employees: 50, customers: 30, suppliers: 20 }
```

### ❌ Error Case (Before Fix)

```javascript
// Console Output
Loading master data from Google Sheets...
Failed to load master data: Action không hợp lệ
// Error: Phieu Thu Chi Backend doesn't have getMasterData
```

## 🚀 Deployment

Changes have been committed and pushed. Vercel will automatically redeploy.

To manually trigger redeploy:
1. Go to Vercel Dashboard
2. Click on your project
3. Go to Deployments tab
4. Click "Redeploy" on the latest deployment

## 📝 Backend Actions Routing

| Action | Backend | Purpose |
|--------|---------|---------|
| `getMasterData` | TLCGroup Backend | Load employees, customers, suppliers |
| `login` | Phieu Thu Chi Backend | User authentication |
| `getVoucherSummary` | Phieu Thu Chi Backend | List vouchers |
| `getVoucherHistory` | Phieu Thu Chi Backend | Voucher details |
| `sendApprovalEmail` | Phieu Thu Chi Backend | Send voucher for approval |
| `approveVoucher` | Phieu Thu Chi Backend | Approve voucher |
| `rejectVoucher` | Phieu Thu Chi Backend | Reject voucher |

## 🔧 Troubleshooting

### Issue: Still getting "Action không hợp lệ"

**Possible Causes:**
1. Browser cache - clear cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. Vercel not redeployed - check Vercel Dashboard for latest deployment
3. Action not extracted correctly - check proxy logs in Vercel

**Solution:**
1. Check Vercel Function Logs for routing messages
2. Verify action is being extracted correctly
3. Check if request is reaching the correct backend

### Issue: Master data returns empty arrays

**Possible Causes:**
1. TLCGroup Backend spreadsheet ID is incorrect
2. Sheet names don't match ("Nhân viên", "Khách hàng", "Nhà cung cấp")
3. Permissions issue with Google Sheets

**Solution:**
1. Check TLCG_INTRANET_BACKEND_COMPLETE.gs for correct `USERS_SHEET_ID`
2. Verify sheet names match exactly
3. Check Google Apps Script execution logs

## ✅ Status

- [x] Smart routing implemented
- [x] getMasterData routes to TLCGroup Backend
- [x] Other actions route to Phieu Thu Chi Backend
- [x] Fallback URLs configured
- [x] Code committed and pushed
- [ ] Test after Vercel redeployment
- [ ] Verify master data loads correctly

