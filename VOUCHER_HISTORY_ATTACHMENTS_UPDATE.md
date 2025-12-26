# Voucher_History Attachments Column Update

## Overview
Added "Attachments" column to the Voucher_History sheet to track Google Drive file links for each voucher action.

## Changes Made

### 1. Backend (VOUCHER_WORKFLOW_BACKEND.gs)

#### Updated: `setupVoucherHistorySheet_()`
Added "Attachments" column to Voucher_History headers:

```javascript
const headers = [
  'VoucherNumber',
  'VoucherType',
  'Company',
  'Employee',
  'Amount',
  'Status',
  'Action',
  'By',
  'Note',
  'RequestorEmail',
  'ApproverEmail',
  'Timestamp',
  'Attachments',  // NEW: Google Drive links
  'MetaJSON'
];
```

**Column widths adjusted:**
- Column 13 (Attachments): 400px
- Column 14 (MetaJSON): 300px

#### Updated: `appendHistory_()`
Added attachments data to row when logging voucher actions:

```javascript
const rowData = [
  // ... other fields
  now,
  entry.attachments || '', // Google Drive links
  JSON.stringify(enhancedMeta)
];
```

#### Updated: `handleSendEmail()`
Modified to pass attachments info when creating Voucher_History record:

```javascript
// Format attachments data if available
let attachmentsText = '';
if (voucher.attachments && voucher.attachments.length > 0) {
  attachmentsText = voucher.attachments;
} else if (voucher.driveFiles && voucher.driveFiles.length > 0) {
  attachmentsText = voucher.driveFiles.map(f => {
    if (f.error) return `${f.fileName} (Upload failed)`;
    const sizeMB = f.fileSize ? (f.fileSize / (1024 * 1024)).toFixed(2) : '?';
    return `${f.fileName} (${sizeMB} MB)\n${f.fileUrl}`;
  }).join('\n\n');
}

appendHistory_({
  // ... other fields
  attachments: attachmentsText,
  // ... meta
});
```

### 2. Frontend (phieu_thu_chi.html)

#### Updated: `syncWithGoogleSheets()`
Store file information after successful sync:

```javascript
// Store files info for later use in approval email
window.lastSyncedVoucherFiles = {
  voucherNumber: voucherData.voucherNumber,
  files: filesToUpload
};
```

#### Updated: `sendForApproval()`
Pass attachments info in voucher object:

```javascript
voucher: {
  // ... other fields
  attachments: window.lastSyncedVoucherFiles && 
               window.lastSyncedVoucherFiles.voucherNumber === voucherNumber 
    ? window.lastSyncedVoucherFiles.files.map(f => 
        `${f.fileName} (${(f.fileSize / (1024 * 1024)).toFixed(2)} MB)`
      ).join(', ')
    : ''
}
```

## Data Flow

```
1. User uploads files → syncWithGoogleSheets()
                        ↓
2. Files converted to base64 → Upload to Google Drive
                        ↓
3. Get Drive links → Store in window.lastSyncedVoucherFiles
                        ↓
4. User sends for approval → sendForApproval()
                        ↓
5. Pass attachments info → handleSendEmail()
                        ↓
6. Create Voucher_History record → appendHistory_()
                        ↓
7. Save to Attachments column → "filename.pdf (2.5 MB), image.jpg (1.2 MB)"
```

## Voucher_History Sheet Structure

| Column | Field Name | Data Type | Example |
|--------|-----------|-----------|---------|
| A | VoucherNumber | String | TL-2025-12-0001 |
| B | VoucherType | String | Phiếu Chi |
| C | Company | String | CÔNG TY TNHH TLC |
| D | Employee | String | Nguyễn Văn A |
| E | Amount | Number | 5000000 |
| F | Status | String | Pending / Approved / Rejected |
| G | Action | String | Submit / Approved / Rejected |
| H | By | String | Nguyễn Văn A |
| I | Note | String | Lý do chi |
| J | RequestorEmail | String | user@example.com |
| K | ApproverEmail | String | manager@example.com |
| L | Timestamp | DateTime | 26/12/2025 14:30 |
| M | **Attachments** | String | invoice.pdf (2.45 MB), receipt.jpg (1.23 MB) |
| N | MetaJSON | JSON | {voucherDate: "2025-12-26", ...} |

## Attachments Column Format

### When Files Are Uploaded (with Drive links):
```
invoice.pdf (2.45 MB)
https://drive.google.com/file/d/1abc123/view

receipt.jpg (1.23 MB)
https://drive.google.com/file/d/1xyz789/view
```

### When Only Metadata (no Drive upload):
```
invoice.pdf (2.45 MB), receipt.jpg (1.23 MB)
```

### When No Files:
```
(empty)
```

## Testing

### Test Scenario 1: Sync with Files
1. Open phieu_thu_chi.html
2. Fill form and add files
3. Click "Đồng bộ với Google Sheets"
4. **Verify**: Files uploaded to Drive, `window.lastSyncedVoucherFiles` populated

### Test Scenario 2: Send for Approval
1. After successful sync (with files)
2. Click "Gửi phê duyệt"
3. **Verify**: Email sent with approval links
4. **Check Voucher_History**: 
   - New row created
   - Action = "Submit"
   - Status = "Pending"
   - **Attachments column** contains file list

### Test Scenario 3: View History
1. Open Voucher_History sheet
2. Find the voucher row
3. **Verify**: Column M shows file names and sizes

## Migration for Existing Data

If you have existing Voucher_History data without the Attachments column:

1. **Option A - Automatic**: Run `setupVoucherHistorySheet()` in Apps Script
   - This will recreate the sheet with new structure
   - **WARNING**: Existing data will be lost

2. **Option B - Manual**: 
   - Insert new column M titled "Attachments" between "Timestamp" and "MetaJSON"
   - Set column width to 400px
   - Existing data preserved

## Notes

- Attachments are stored as plain text (filenames + sizes) in Voucher_History
- Full Drive links are stored in "Phiếu Thu Chi" sheet
- Voucher_History tracks the submission/approval workflow only
- File metadata is captured at sync time, used at approval time

## Related Files

- `VOUCHER_WORKFLOW_BACKEND.gs` - Backend logic
- `phieu_thu_chi.html` - Frontend form
- `FILE_UPLOAD_TO_DRIVE_IMPLEMENTATION.md` - Drive upload details
- `DEPLOY_FILE_UPLOAD_FEATURE.md` - Deployment guide
