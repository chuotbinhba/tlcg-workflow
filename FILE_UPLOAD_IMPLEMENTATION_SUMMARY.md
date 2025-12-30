# ✅ File Upload to Google Drive - Implementation Summary

## 🎯 What Was Implemented

When users submit a request with uploaded documents:
1. ✅ Files are uploaded to Google Drive
2. ✅ Individual clickable Google Drive links are generated for each file
3. ✅ Links are saved to Voucher_History sheet in **Column J (Attachments / Tài liệu đính kèm)**
4. ✅ Links appear in vouchers preview and history

---

## 📊 Voucher_History Sheet Structure

| Column | Field Name | Description | Example |
|--------|-----------|-------------|---------|
| A | VoucherNumber | Số phiếu | TL-202512-0489 |
| B | VoucherType | Loại phiếu | Chi / Thu |
| C | Company | Công ty | CÔNG TY TNHH EGG VENTURES |
| D | Employee | Người đề nghị | Nguyễn Văn A |
| E | Amount | Số tiền | 1000000 |
| F | Status | Trạng thái | Pending / Approved / Rejected |
| G | Action | Hành động | Submit / Approved / Rejected |
| H | By | Người thực hiện | Nguyễn Văn A |
| I | Note | Ghi chú | Lý do chi |
| **J** | **Attachments** | **Tài liệu đính kèm** | **Clickable Google Drive links** ⭐ |
| K | RequestorEmail | Email người đề nghị | user@example.com |
| L | ApproverEmail | Email người phê duyệt | manager@example.com |
| M | Timestamp | Thời gian | 2025-12-26 10:30:00 |

---

## 🔗 Format of Attachments in Column J

When files are uploaded, Column J contains:

```
invoice.pdf (2.45 MB)
https://drive.google.com/file/d/1abc123xyz/view

receipt.jpg (1.23 MB)
https://drive.google.com/file/d/1xyz789abc/view

contract.pdf (5.67 MB)
https://drive.google.com/file/d/1def456ghi/view
```

**Features:**
- ✅ Each file on a separate line with file name and size
- ✅ Clickable Google Drive link below each file name
- ✅ Google Sheets automatically detects URLs and makes them clickable
- ✅ Text wrapping enabled for better readability

---

## 🔄 Data Flow

```
1. User fills form and uploads files
   ↓
2. User clicks "Gửi phê duyệt" (Send for Approval)
   ↓
3. Frontend sends files as base64 in payload
   {
     action: 'sendApprovalEmail',
     voucher: {
       files: [
         {
           fileName: 'invoice.pdf',
           fileData: 'base64encodeddata...',
           mimeType: 'application/pdf',
           fileSize: 2560000
         },
         ...
       ],
       ...
     }
   }
   ↓
4. Backend: handleSendEmail() receives request
   ↓
5. Backend: uploadFilesToDrive_() uploads files to Google Drive
   - Creates folder named after voucher number
   - Uploads each file
   - Sets sharing to "Anyone with link can view"
   - Gets clickable URL for each file
   ↓
6. Backend: Formats file links as:
   "filename.pdf (2.45 MB)\nhttps://drive.google.com/file/d/.../view\n\n..."
   ↓
7. Backend: appendHistory_() saves to Voucher_History
   - Column J gets the formatted file links
   ↓
8. Google Sheets automatically makes URLs clickable
   ↓
9. Links appear in voucher previews and history
```

---

## 📁 Google Drive Folder Structure

Files are organized in Google Drive:

```
Parent Folder (ID: 1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG)
  └── TL-202512-0489/  (folder named after voucher number)
      ├── invoice.pdf
      ├── receipt.jpg
      └── contract.pdf
```

Each voucher gets its own folder, making it easy to find all related documents.

---

## 🔐 File Sharing Settings

All uploaded files are set to:
- **Access:** Anyone with the link can view
- **Permission:** View only (no edit/delete)
- This ensures approvers can view files without needing Drive access

---

## ✅ Key Features

1. **Individual Clickable Links**
   - Each file gets its own Google Drive link
   - Links are automatically clickable in Google Sheets
   - Clicking opens the file in Google Drive viewer

2. **File Information**
   - File name and size shown before each link
   - Format: "filename.pdf (2.45 MB)"

3. **Error Handling**
   - If upload fails, shows "filename.pdf (Lỗi upload)"
   - Request continues even if some files fail

4. **Logging**
   - Detailed logs for debugging
   - Tracks upload progress and errors

---

## 🧪 Testing Checklist

- [ ] Upload single file → Check Column J has link
- [ ] Upload multiple files → Check all links appear
- [ ] Click link in Google Sheets → Should open file in Drive
- [ ] View voucher in preview → Should show attachments
- [ ] Check Drive folder → Files should be organized by voucher number
- [ ] Test with large files → Should handle appropriately
- [ ] Test with different file types (PDF, JPG, DOCX, etc.)

---

## 📝 Backend Code Changes

### Updated Functions:

1. **`doPost()`**
   - Added FormData parsing support
   - Handles JSON in 'data' field from FormData

2. **`handleSendEmail()`**
   - Uploads files to Drive before sending email
   - Formats file links correctly
   - Saves attachments to Column J

3. **`uploadFilesToDrive_()`**
   - Creates/uses folder per voucher
   - Uploads files and sets sharing
   - Returns clickable URLs
   - Better error handling

4. **`appendHistory_()`**
   - Correct column order
   - Column J = Attachments
   - Sets text wrapping for readability
   - Ensures URLs are formatted correctly

---

## 🚀 Next Steps

1. **Deploy the updated backend code** to Google Apps Script
2. **Test file upload** with a sample voucher
3. **Verify Column J** in Voucher_History sheet shows clickable links
4. **Check file access** by clicking links in the sheet

---

**Status:** ✅ Complete and ready for testing

**Last Updated:** 2025-12-26

