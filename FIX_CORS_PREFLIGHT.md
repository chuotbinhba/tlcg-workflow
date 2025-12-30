# 🔧 Fix CORS Preflight Error - URGENT

## ❌ Error:
```
Access to fetch at 'https://script.google.com/macros/s/.../exec' from origin 
'https://workflow.egg-ventures.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Root Cause:
When sending `POST` with `Content-Type: application/json`, the browser sends an **OPTIONS preflight request** first. Google Apps Script Web Apps need to:
1. ✅ Handle OPTIONS requests
2. ✅ Be deployed with **"Anyone"** access (NOT "Anyone with Google account")
3. ✅ Return proper CORS headers

## ✅ Solution 1: Deploy with "Anyone" Access (Try This First)

### Step 1: Check Current Deployment
1. **Open Google Apps Script:** https://script.google.com
2. **Click "Deploy"** → **"Manage deployments"**
3. **Check current deployment:**
   - What is "Who has access" setting?
   - If it's "Anyone with Google account" → **CHANGE IT!**

### Step 2: Create New Deployment
1. **Click "Deploy"** → **"New deployment"**
2. **Click ⚙️ (Settings/Edit)**
3. **Settings:**
   - **Type:** Web app
   - **Description:** `TLCG Voucher v1.5 (CORS - Anyone)`
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** `Anyone` ⚠️⚠️⚠️ **CRITICAL!**
4. **Click "Deploy"**
5. **Authorize** if prompted
6. **Copy the NEW Web App URL**

### Step 3: Update Frontend URL
1. **Open `phieu_thu_chi.html`**
2. **Find line 2253:**
   ```javascript
   const GOOGLE_APPS_SCRIPT_WEB_APP_URL = '...';
   ```
3. **Replace with NEW URL** from Step 2
4. **Save**

### Step 4: Clear Cache & Test
1. **Hard refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Or clear cache:** `Ctrl+Shift+Delete`
3. **Test form submission**

---

## ✅ Solution 2: Add OPTIONS Handling to Backend

If Solution 1 doesn't work, we need to handle OPTIONS explicitly.

### Code to Add:

**In `VOUCHER_WORKFLOW_BACKEND.gs`, I've added preflight detection:**

The code now checks for preflight requests at the start of `doPost()`. However, Google Apps Script doesn't have a native `doOptions()` function.

---

## ✅ Solution 3: Change Request to FormData (Workaround)

Instead of sending JSON, send FormData (doesn't trigger preflight).

### Frontend Change:

**In `phieu_thu_chi.html`, around line 5712:**

**BEFORE (triggers preflight):**
```javascript
const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: payloadString,
});
```

**AFTER (no preflight):**
```javascript
// Convert JSON to FormData
const formData = new FormData();
formData.append('data', payloadString); // Send JSON as FormData field

const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
    method: 'POST',
    body: formData
    // Don't set Content-Type - browser will set it with boundary
});
```

### Backend Change:

**In `VOUCHER_WORKFLOW_BACKEND.gs`, in `doPost()`:**

Add parsing for FormData:
```javascript
// Try to get data from FormData first
let requestBody;
if (e.parameter && e.parameter.data) {
    try {
        requestBody = JSON.parse(e.parameter.data);
        Logger.log('Parsed from FormData parameter');
    } catch (e) {
        Logger.log('Error parsing FormData: ' + e.toString());
    }
}

// Fall back to postData.contents if FormData not found
if (!requestBody && e.postData && e.postData.contents) {
    try {
        requestBody = JSON.parse(e.postData.contents);
        Logger.log('Parsed from postData.contents');
    } catch (e) {
        Logger.log('Error parsing postData: ' + e.toString());
    }
}
```

---

## 🎯 RECOMMENDED: Try Solutions in Order

### 1. **First:** Deploy with "Anyone" access (Solution 1)
   - ✅ Easiest
   - ✅ No code changes
   - ✅ Should work for most cases

### 2. **If that fails:** Use FormData (Solution 3)
   - ✅ Reliable workaround
   - ✅ No preflight needed
   - ⚠️ Requires code changes

### 3. **Last resort:** Contact Google support
   - If neither works, might be a Google Apps Script limitation

---

## 🔍 How to Verify Deployment Settings:

1. **Open:** https://script.google.com
2. **Open your project**
3. **Click "Deploy"** → **"Manage deployments"**
4. **Click ✏️ (Edit)** on active deployment
5. **Check:**
   ```
   ✅ Execute as: Me (your-email@gmail.com)
   ✅ Who has access: Anyone  ← MUST BE THIS!
   ```

6. **If it's NOT "Anyone":**
   - Click dropdown
   - Select **"Anyone"**
   - Click **"Save"**
   - Create **new deployment** (required)

---

## 📝 Important Notes:

### ⚠️ "Anyone" vs "Anyone with Google account"
- **"Anyone"** = Public, works with CORS automatically
- **"Anyone with Google account"** = Requires Google login, CORS issues

### ⚠️ Deployment Version
- Each code change requires a **new deployment**
- Old deployments don't automatically update

### ⚠️ Browser Cache
- Clear cache after deployment
- Or use Incognito/Private mode for testing

---

## 🧪 Test After Fix:

1. **Open form:** https://workflow.egg-ventures.com/phieu_thu_chi.html
2. **Open Console:** F12
3. **Fill form and submit**
4. **Check console:**
   - ✅ No CORS errors
   - ✅ Request succeeds
   - ✅ Response received

---

**Status:** Try Solution 1 first (deploy with "Anyone" access)

