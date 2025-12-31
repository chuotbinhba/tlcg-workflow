# 🔧 Setup Vercel Environment Variables (Optional)

## ℹ️ Current Status

**Good News:** The application works **WITHOUT** setting environment variables! The code has **fallback URLs** hardcoded, so everything will function normally.

**Why Set Environment Variables?**
- ✅ Easier to update URLs without code changes
- ✅ Better security practice
- ✅ Cleaner logs (no warnings)

## 📋 Environment Variables to Set (Optional)

### 1. `GOOGLE_APPS_SCRIPT_URL`
**Purpose:** Phieu Thu Chi Backend (voucher operations)

**Value:**
```
https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec
```

**Handles:**
- `sendApprovalEmail` - Send voucher for approval
- `approveVoucher` - Approve a voucher
- `rejectVoucher` - Reject a voucher
- `getVoucherSummary` - Get voucher summary
- `getVoucherHistory` - Get voucher history

---

### 2. `TLCGROUP_BACKEND_URL`
**Purpose:** TLCGroup Backend (intranet operations)

**Value:**
```
https://script.google.com/macros/s/AKfycbwQ9lisLCr2iATBF2NGOqdNlG_f8ygDKrIEYkiZYsaVbm_7gFI4P_EC0FC5Wq-TJdMYKw/exec
```

**Handles:**
- `login` - User authentication
- `getMasterData` - Master data (employees, customers, suppliers)

---

## 🚀 How to Set Environment Variables in Vercel

### Step 1: Access Vercel Dashboard
1. Go to **https://vercel.com/dashboard**
2. Select your project: **TLCG Workflow** (or your project name)

### Step 2: Navigate to Environment Variables
1. Click **Settings** in the top navigation
2. Click **Environment Variables** in the left sidebar

### Step 3: Add Environment Variables

#### Add `GOOGLE_APPS_SCRIPT_URL`:
1. Click **Add New**
2. **Key:** `GOOGLE_APPS_SCRIPT_URL`
3. **Value:** `https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec`
4. **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

#### Add `TLCGROUP_BACKEND_URL`:
1. Click **Add New**
2. **Key:** `TLCGROUP_BACKEND_URL`
3. **Value:** `https://script.google.com/macros/s/AKfycbwQ9lisLCr2iATBF2NGOqdNlG_f8ygDKrIEYkiZYsaVbm_7gFI4P_EC0FC5Wq-TJdMYKw/exec`
4. **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

### Step 4: Redeploy (Important!)
After adding environment variables, you **MUST redeploy** for changes to take effect:

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

---

## ✅ Verification

### Method 1: Check Vercel Function Logs (Recommended)

After redeploying, check Vercel function logs:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Functions** tab
4. Click on `/api/voucher`
5. Check **Logs** - you should **NOT** see warnings about environment variables anymore

---

### Method 2: Check Using Browser Developer Tools

Environment variables are server-side, but you can verify they're working by checking the **Network requests**:

#### Step 1: Open Developer Tools
1. Open your website: `https://workflow.egg-ventures.com`
2. Press `F12` (Windows/Linux) or `Cmd + Option + I` (Mac) to open Developer Tools
3. Go to **Network** tab
4. **Clear** existing requests (click 🚫 icon)

#### Step 2: Trigger a Request
1. Perform an action that calls the API:
   - **Login** from homepage (tests `TLCGROUP_BACKEND_URL`)
   - **Load master data** (tests `TLCGROUP_BACKEND_URL`)
   - **Submit a voucher** (tests `GOOGLE_APPS_SCRIPT_URL`)
   - **Approve/Reject voucher** (tests `GOOGLE_APPS_SCRIPT_URL`)

#### Step 3: Check Network Requests
1. Find the request to `/api/voucher` in the Network tab
2. Click on the request
3. Go to **Response** tab
4. Look for the response - it should work normally

#### Step 4: Check Console Logs
1. Go to **Console** tab in Developer Tools
2. Look for any error messages
3. If environment variables are **NOT set**, you might see (harmless) info messages
4. If environment variables **ARE set**, you won't see any warnings

#### Step 5: Verify Request Success
- ✅ **Success:** Request returns JSON with `success: true`
- ❌ **Failure:** Request returns error (check if backend URL is correct)

---

### Method 3: Check Vercel Logs (Most Accurate)

The most accurate way is to check Vercel's server-side logs:

1. Go to **Vercel Dashboard** → Your Project
2. Go to **Deployments** → Latest deployment
3. Click **Functions** → `/api/voucher`
4. Click **Logs** tab
5. Look for these messages:

**If environment variables are NOT set:**
```
[Proxy Info] GOOGLE_APPS_SCRIPT_URL environment variable not set. Using fallback URL.
[Proxy Info] TLCGROUP_BACKEND_URL environment variable not set. Using fallback URL.
```

**If environment variables ARE set:**
- ❌ **No warnings/info messages** about environment variables
- ✅ Only normal operation logs

---

### Method 4: Test Endpoint (Advanced)

You can create a test endpoint to check environment variables. Add this to `api/test-env.js`:

```javascript
export default async function handler(req, res) {
  const envStatus = {
    GOOGLE_APPS_SCRIPT_URL: process.env.GOOGLE_APPS_SCRIPT_URL ? '✅ Set' : '❌ Not set',
    TLCGROUP_BACKEND_URL: process.env.TLCGROUP_BACKEND_URL ? '✅ Set' : '❌ Not set',
    // Don't expose actual URLs for security
    hasGoogleAppsScriptUrl: !!process.env.GOOGLE_APPS_SCRIPT_URL,
    hasTlcGroupBackendUrl: !!process.env.TLCGROUP_BACKEND_URL
  };
  
  return res.status(200).json({
    success: true,
    environment: envStatus,
    message: 'Environment variables status'
  });
}
```

Then visit: `https://workflow.egg-ventures.com/api/test-env` to check status.

---

## 🔄 Updating URLs

If you need to update a Google Apps Script URL:

### Option 1: Update Environment Variable (Recommended)
1. Go to **Settings** → **Environment Variables**
2. Edit the variable
3. **Redeploy** the application

### Option 2: Update Code Fallback URL
1. Edit `api/voucher.js`
2. Update the fallback URL in the code
3. Commit and push

---

## 📝 Notes

- **Warnings are harmless:** The application works fine with or without environment variables
- **Fallback URLs:** Always updated to latest URLs from your Google Apps Script deployments
- **No downtime:** Adding environment variables does not require downtime

