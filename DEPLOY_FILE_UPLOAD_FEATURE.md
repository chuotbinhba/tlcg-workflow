# Deploy File Upload Feature - Quick Guide

## Step 1: Update Google Apps Script Backend

1. Open Google Apps Script editor:
   ```
   https://script.google.com/home/projects/YOUR_PROJECT_ID/edit
   ```

2. Replace the entire content of `VOUCHER_WORKFLOW_BACKEND.gs` with the updated version from your local file

3. **Important Changes**:
   - Added `uploadFilesToDrive_()` function (lines ~1590-1660)
   - Updated `handleSyncToSheets()` to call file upload (lines ~803-845)
   - Updated `writeVoucherData()` to save Drive links (lines ~890-930)

4. Click **Save** (💾 icon or Ctrl+S)

## Step 2: Deploy New Version

1. Click **Deploy** → **New deployment**
2. Type: **Web app**
3. Configuration:
   - Description: "Added Google Drive file upload"
   - Execute as: **Me** (your account)
   - Who has access: **Anyone**
4. Click **Deploy**
5. **Copy the new Web App URL**

## Step 3: Update Frontend Files

If the Web App URL changed, update these files:
- [x] `phieu_thu_chi.html` - Already updated with file upload code
- [ ] `index.html` (if URL changed)
- [ ] `approve_voucher.html` (if URL changed)
- [ ] `reject_voucher.html` (if URL changed)

Search for the old URL and replace with new one:
```javascript
// Old URL format
const WEB_APP_URL = 'https://script.google.com/macros/s/OLD_ID/exec';

// New URL (copy from deployment)
const WEB_APP_URL = 'https://script.google.com/macros/s/NEW_ID/exec';
```

## Step 4: Verify Permissions

The script needs access to Google Drive. On first run:

1. The script will request Drive permissions
2. Click **Review permissions**
3. Choose your Google account
4. Click **Advanced** → **Go to [Project Name] (unsafe)**
5. Click **Allow**

## Step 5: Test the Feature

### Quick Test:
1. Open [phieu_thu_chi.html](phieu_thu_chi.html) in browser
2. Fill in required fields
3. Add an expense item with a small file attachment (e.g., 1MB image)
4. Click "Đồng bộ với Google Sheets"
5. Wait for success message
6. Check results:

### Verify Success:
✅ **Google Drive**: https://drive.google.com/drive/u/9/folders/1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG
   - New subfolder created with voucher number (e.g., `TL-2025-12-0001`)
   - File uploaded inside subfolder
   
✅ **Google Sheet**: Open "Phiếu Thu Chi" sheet
   - Column R "Files đính kèm" should show:
     ```
     filename.pdf (1.23 MB)
     https://drive.google.com/file/d/FILE_ID/view
     ```
   
✅ **Click the Drive link** - Should open file in Google Drive viewer

## Step 6: Check Logs (If Issues)

1. In Apps Script editor, click **Executions** (⏱️ icon)
2. Click on the latest execution
3. View logs for errors:
   - `=== UPLOAD FILES TO DRIVE ===` - Upload start
   - `✅ Uploaded: filename` - Success per file
   - `❌ Error uploading file` - If failed

## Common Issues

### Issue: "Cannot read property 'length' of undefined"
**Fix**: Make sure `data.files` exists before calling `uploadFilesToDrive_()`

### Issue: "Exception: You do not have permission to call DriveApp.getFolderById"
**Fix**: Re-authorize the script (Step 4)

### Issue: Files not uploading but no error
**Fix**: 
1. Check file size (max 50MB total per request)
2. Check console logs in browser Dev Tools (F12)
3. Check Apps Script execution logs

### Issue: Drive links not showing in sheet
**Fix**: Check `data.driveFiles` is populated in `writeVoucherData()`

## Rollback (If Needed)

If something goes wrong:

1. In Apps Script editor, click **Deploy** → **Manage deployments**
2. Click on previous version
3. Click **Restore**
4. Update frontend URLs back to previous deployment

## What Changed

### Files Modified:
1. ✅ `VOUCHER_WORKFLOW_BACKEND.gs` - Added Drive upload logic
2. ✅ `phieu_thu_chi.html` - Added base64 conversion and file sending

### No Changes Required:
- `approve_voucher.html` - Works as-is
- `reject_voucher.html` - Works as-is
- `index.html` - Works as-is (unless URL changed)

## Next Steps

After successful deployment:

1. Test with various file types (PDF, images, documents)
2. Test with multiple files per voucher
3. Test with larger files (5-10 MB)
4. Verify file sharing permissions
5. Update user documentation

---

**Need Help?**
- Check [FILE_UPLOAD_TO_DRIVE_IMPLEMENTATION.md](FILE_UPLOAD_TO_DRIVE_IMPLEMENTATION.md) for detailed implementation
- Review Apps Script execution logs
- Test with small files first
