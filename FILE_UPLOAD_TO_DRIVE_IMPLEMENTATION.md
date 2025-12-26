# Google Drive File Upload Implementation

## Overview
Files attached to vouchers are now automatically uploaded to Google Drive and shareable links are saved in the Google Sheets.

## Configuration

### Google Drive Folder
- **Folder Name**: `01.Phieu_Thu_Chi`
- **Folder ID**: `1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG`
- **Link**: https://drive.google.com/drive/u/9/folders/1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG

### Folder Structure
Files are organized in subfolders by voucher number:
```
01.Phieu_Thu_Chi/
├── TL-2025-12-0001/
│   ├── invoice.pdf
│   ├── receipt.jpg
│   └── document.docx
├── TL-2025-12-0002/
│   └── contract.pdf
└── ...
```

## Implementation Details

### 1. Backend (VOUCHER_WORKFLOW_BACKEND.gs)

#### New Function: `uploadFilesToDrive_(files, voucherNumber)`
- **Purpose**: Uploads files to Google Drive and returns shareable links
- **Parameters**:
  - `files`: Array of file objects with `{fileName, fileData (base64), mimeType, fileSize}`
  - `voucherNumber`: Voucher number for subfolder organization
- **Returns**: Array of objects with `{fileName, fileUrl, fileId, fileSize}`
- **Features**:
  - Creates voucher-specific subfolder
  - Converts base64 to Blob
  - Uploads to Drive
  - Sets sharing to "Anyone with link can view"
  - Error handling for individual files

#### Updated: `handleSyncToSheets(requestBody)`
- Now calls `uploadFilesToDrive_()` before writing data
- Stores uploaded file info in `data.driveFiles`
- Continues with sync even if upload fails

#### Updated: `writeVoucherData(sheet, data, spreadsheet)`
- Prioritizes Drive links over file metadata
- Saves format: `filename (2.5 MB)\nhttps://drive.google.com/...`
- Falls back to metadata if no Drive upload

### 2. Frontend (phieu_thu_chi.html)

#### New Function: `fileToBase64(file)`
- Converts File objects to base64 strings
- Returns Promise for async handling

#### Updated: `syncWithGoogleSheets()`
- Collects all attached files from expense items
- Converts each file to base64 using `fileToBase64()`
- Creates `filesToUpload` array with:
  - `fileName`: Original file name
  - `fileData`: Base64-encoded file content
  - `mimeType`: File MIME type
  - `fileSize`: File size in bytes
  - `rowIndex`: Expense item index
- Sends files in `voucherData.files` property

## Data Flow

```
1. User attaches files → Stored in expenseItems[].attachments[]
                         ↓
2. Click "Đồng bộ" → Convert files to base64
                         ↓
3. Send to backend → voucherData.files = [{fileName, fileData, mimeType, fileSize}]
                         ↓
4. Backend uploads → uploadFilesToDrive_() creates subfolder & uploads
                         ↓
5. Get Drive links → [{fileName, fileUrl, fileId, fileSize}]
                         ↓
6. Save to Sheet → "Files đính kèm" column contains:
                    filename (2.5 MB)
                    https://drive.google.com/file/d/FILE_ID/view
```

## Google Sheet Format

### "Files đính kèm" Column (Column R)
Files are saved in this format:
```
invoice.pdf (2.45 MB)
https://drive.google.com/file/d/1abc123def456/view

receipt.jpg (1.23 MB)
https://drive.google.com/file/d/1xyz789ghi012/view
```

## Testing

### Test Steps:
1. Open [phieu_thu_chi.html](phieu_thu_chi.html)
2. Fill in required fields
3. Add expense items with file attachments
4. Click "Đồng bộ với Google Sheets"
5. Check Google Drive folder for uploaded files
6. Check Google Sheet "Files đính kèm" column for Drive links

### Verification:
- ✅ Files appear in Drive folder organized by voucher number
- ✅ Files are shareable (Anyone with link can view)
- ✅ Drive links are clickable in Google Sheets
- ✅ File metadata (name, size) is accurate
- ✅ Multiple files per voucher are handled correctly

## Error Handling

- **Individual file upload failures**: Continues with other files, marks failed files in result
- **Drive folder access issues**: Throws error with clear message
- **Base64 conversion errors**: Logged to console, file skipped
- **Network issues**: Graceful failure with error message

## File Size Limits

- **Google Apps Script**: 50 MB per request (total of all files)
- **Google Drive**: Unlimited storage (depends on account)
- **Recommended**: Keep individual files under 10 MB for best performance

## Permissions Required

The Google Apps Script Web App needs:
- **Drive API**: To upload files and set sharing permissions
- **Spreadsheet API**: To write data to sheets
- **Gmail API**: To send approval emails (existing)

## Future Enhancements

- [ ] Add file type validation (block executables)
- [ ] Implement file compression for large files
- [ ] Add progress bar for upload
- [ ] Support for batch file upload optimization
- [ ] File preview in approval emails
