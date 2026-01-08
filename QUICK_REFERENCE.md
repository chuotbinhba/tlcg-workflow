# 🚀 Quick Reference - Payment Request Setup

## ✅ What's Done

- ✅ Backend updated to use `Payment_Request_History`
- ✅ Supplier integration with "Nhà cung cấp" sheet
- ✅ All code committed to GitHub
- ✅ Documentation created

---

## 📋 Your Next Steps (5 Minutes)

### **Step 1: Create the Sheet** (2 min)

1. Open: https://docs.google.com/spreadsheets/d/1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g
2. Click **+** at bottom to add new sheet
3. Name it: **`Payment_Request_History`**
4. Copy/paste this header row:

```
Request_ID	Request_Number	Company	Request_Date	Requester_Name	Requester_Email	Department	Purchase_Type	PR_Request_No	Purpose	Recipient	Supplier	Total_Amount	Currency	Payment_Type	PO_Number	Overall_Status	Budget_Approver	Budget_Approval_Status	Budget_Approval_Date	Supplier_Approver	Supplier_Approval_Status	Supplier_Approval_Date	Final_Approver	Final_Approval_Status	Final_Approval_Date	Product_Items_JSON	Payment_Phases_JSON	Attachments_JSON	Signatures_JSON	Created_Date	Last_Modified_Date	Modified_By	Notes	Rejection_Reason
```

5. **Bold** the header row
6. **Freeze** row 1 (View → Freeze → 1 row)

---

### **Step 2: Deploy Backend** (2 min)

1. Open Google Apps Script: https://script.google.com
2. Create new project: "Payment Request Backend"
3. Copy entire `PAYMENT_REQUEST_BACKEND.gs` file
4. Paste into Code.gs
5. Click **Deploy** → **New deployment**
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
6. Click **Deploy**
7. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/AKfycb.../exec`)

---

### **Step 3: Update Vercel** (1 min)

```bash
cd "/Volumes/MacEx01/TLCG Workflow"
vercel env add PAYMENT_REQUEST_BACKEND_URL
# Paste the Web App URL from Step 2
vercel --prod
```

---

## 🧪 Quick Test

### **Test 1: Sheet Access**

In Google Apps Script, run:

```javascript
function testSheetAccess() {
  const ss = SpreadsheetApp.openById('1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g');
  const sheet = ss.getSheetByName('Payment_Request_History');
  Logger.log(sheet ? '✅ Sheet found!' : '❌ Sheet not found!');
}
```

### **Test 2: Suppliers**

In Google Apps Script, run:

```javascript
function testGetSuppliers() {
  const result = handleGetSuppliers({});
  Logger.log(result);
}
```

Expected: List of suppliers from "Nhà cung cấp" Column C

---

## 📊 What Changed in Backend

| Item | Value |
|------|-------|
| **Spreadsheet ID** | `1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g` |
| **Main Sheet** | `Payment_Request_History` |
| **Suppliers Sheet** | `Nhà cung cấp` (existing) |
| **New Actions** | `getSuppliers`, `addSupplier`, `submitPaymentRequest`, `getRecentPaymentRequests` |
| **New Functions** | `handleGetSuppliers()`, `handleAddSupplier()` |

---

## 🔗 Important Links

| Resource | Link |
|----------|------|
| **Spreadsheet** | https://docs.google.com/spreadsheets/d/1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g |
| **Google Apps Script** | https://script.google.com |
| **Workflow Website** | https://workflow.egg-ventures.com |
| **GitHub Repo** | https://github.com/chuotbinhba/tlcg-workflow |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `PAYMENT_REQUEST_SHEET_SETUP_GUIDE.md` | **Detailed setup instructions** (35 columns, formatting, validation) |
| `BACKEND_CHANGES_SUMMARY.md` | **Complete code changes** (before/after, all functions) |
| `PAYMENT_REQUEST_TRACKING_SYSTEM.md` | **System architecture** (data flow, features) |
| `PAYMENT_REQUEST_SUPPLIER_INTEGRATION.md` | **Supplier integration** (how it works) |
| `QUICK_REFERENCE.md` | **This file** (quick start) |

---

## ⚡ TL;DR

1. Create `Payment_Request_History` sheet with 35 columns
2. Deploy `PAYMENT_REQUEST_BACKEND.gs` to Google Apps Script
3. Update Vercel with new backend URL
4. Test and go live!

**Total time: ~5 minutes** ⏱️

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Sheet not found | Check exact name: `Payment_Request_History` |
| Suppliers not loading | Check "Nhà cung cấp" sheet exists, Column C has data |
| Permission error | Re-deploy Apps Script with "Execute as: Me" |
| Vercel 500 error | Check backend URL is correct, ends with `/exec` |

---

**Need more details?** See `PAYMENT_REQUEST_SHEET_SETUP_GUIDE.md` 📖

**All set!** 🎉
