# Google Drive API - Quick Reference

## 🎯 What This Solves

**Problem**: Files > 500KB fail due to Google Apps Script 1MB POST limit

**Solution**: Upload files directly to Google Drive from browser (no backend limit)

---

## 📊 Comparison

| Feature | Before | After Setup |
|---------|--------|-------------|
| Max file size | 500 KB | 5 TB |
| Upload speed | Slow | Fast |
| Reliability | Low | High |
| Setup time | 0 min | 30-45 min |
| Cost | Free | Free |

---

## 🚀 Quick Setup (30-45 min)

### 1. Google Cloud Console (20-30 min)
https://console.cloud.google.com/

- Create project: "TLCG Workflow"
- Enable: Google Drive API
- Create: OAuth 2.0 Client ID
- Create: API Key
- Restrict both to your domain

### 2. Update Code (5 min)

In `phieu_thu_chi.html`, find line ~2258:

```javascript
const DRIVE_CONFIG = {
    CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com', // ← Update
    API_KEY: 'YOUR_API_KEY', // ← Update
    DRIVE_FOLDER_ID: '1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG',
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    SCOPES: 'https://www.googleapis.com/auth/drive.file'
};
```

### 3. Deploy (2 min)

```bash
git add phieu_thu_chi.html
git commit -m "Configure Drive API credentials"
git push origin main
npx vercel --prod
```

### 4. Test (5 min)

1. Open: https://workflow.egg-ventures.com/phieu_thu_chi.html
2. Check console: Should see "Drive API ready"
3. Upload file > 500KB
4. Sign in to Google when prompted
5. File uploads to Drive ✅

---

## 🔍 How to Check Status

### Console Messages

**Not Configured** (current state):
```
ℹ️ Google Drive API not configured - using legacy upload (500KB limit)
```

**Configured & Working**:
```
✅ Google Drive API initialized
✅ Drive API ready - unlimited file uploads enabled!
```

**During Upload**:
```
📤 Uploading test.pdf (1.8 MB) to Drive...
✅ Created new folder: TL-202601-0001
✅ File uploaded: test.pdf
✅ Sharing permissions set for: test.pdf
```

---

## 🐛 Common Issues

### "API key not valid"
- Check API key in DRIVE_CONFIG
- Verify API key restrictions
- Ensure Drive API is enabled

### "Invalid client ID"
- Check Client ID in DRIVE_CONFIG
- Verify authorized origins include your domain
- Wait 5 minutes for propagation

### No sign-in prompt
- Clear browser cache
- Try incognito mode
- Check console for errors

---

## 📚 Full Documentation

- **Setup Guide**: `GOOGLE_DRIVE_API_SETUP.md` (detailed steps)
- **Technical Details**: `DRIVE_UPLOAD_SOLUTION.md` (how it works)
- **This File**: Quick reference only

---

## ✅ Benefits

- ✅ No file size limits (up to 5TB)
- ✅ Faster uploads
- ✅ More reliable
- ✅ Better UX
- ✅ Free
- ✅ Backward compatible

---

## 🎯 Next Step

Open `GOOGLE_DRIVE_API_SETUP.md` for detailed setup instructions.

