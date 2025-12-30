# 🔧 Fix Vercel Build Error - No Output Directory

## ❌ Error
```
Build Failed
No Output Directory named "public" found after the Build completed. 
Configure the Output Directory in your Project Settings. 
Alternatively, configure vercel.json#outputDirectory.
```

## 🔍 Root Cause
Vercel is looking for a `public` directory, but this is a static HTML project where HTML files are in the root directory, not in a `public` folder.

## ✅ Solution

### Option 1: Update vercel.json (Recommended - Already Done)

The `vercel.json` has been updated with:
```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null,
  ...
}
```

**Key settings:**
- `outputDirectory: "."` - Serve files from root directory
- `buildCommand: null` - No build step needed
- `framework: null` - Static site, no framework

### Option 2: Configure in Vercel Dashboard

If the `vercel.json` approach doesn't work, you can configure it in the dashboard:

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Go to **General** section
3. Find **Build & Development Settings**
4. Configure:
   - **Framework Preset:** Other
   - **Build Command:** (leave empty)
   - **Output Directory:** `.` (dot)
   - **Install Command:** (leave empty)
5. Click **Save**

### Option 3: Create public Directory (Alternative)

If you prefer to use a `public` directory structure:

1. Create a `public` directory in your project
2. Move all HTML files to `public/`:
   ```bash
   mkdir public
   mv *.html public/
   ```
3. Update `vercel.json`:
   ```json
   {
     "outputDirectory": "public"
   }
   ```

**Note:** This option requires updating all file references if they use relative paths.

## ✅ Recommended Approach

**Use Option 1** (already configured in `vercel.json`):
- ✅ No need to move files
- ✅ No need to change paths
- ✅ Works with current project structure
- ✅ Serverless functions in `api/` still work

## 🔍 Verification

After updating `vercel.json`:

1. **Commit and push** the changes:
   ```bash
   git add vercel.json
   git commit -m "Fix Vercel build: configure static site output directory"
   git push
   ```

2. **Vercel will auto-deploy** (or trigger manual redeploy)

3. **Check deployment logs:**
   - Should show: "No build command found, skipping build"
   - Should show: "Uploading static files"
   - Should NOT show: "No Output Directory found" error

## 📋 Current vercel.json Configuration

```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null,
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/voucher/[action].js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type"
        }
      ]
    }
  ]
}
```

## 🚨 If Still Not Working

### Check 1: Verify vercel.json is committed
```bash
git status
# Should show vercel.json is committed
```

### Check 2: Check Vercel Project Settings
1. Vercel Dashboard → Settings → General
2. Ensure Framework Preset is set to "Other"
3. Build & Output Settings should match vercel.json

### Check 3: Check Build Logs
1. Vercel Dashboard → Deployments → Latest deployment
2. Check Build logs for errors
3. Should see files being uploaded, not a build error

## ✅ Expected Behavior

After fix:
- ✅ Build succeeds (no build step needed)
- ✅ Static files (HTML, CSS, JS) are served from root
- ✅ API routes (`/api/voucher/*`) work correctly
- ✅ All pages accessible (index.html, phieu_thu_chi.html, etc.)

