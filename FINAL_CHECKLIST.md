# ✅ Final Checklist - Fix CORS & Verify Setup

## 📊 Sheet Configuration: ✅ CONFIRMED
- ✅ Sheet ID: `1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g`
- ✅ Sheet Name: `Voucher_History`
- ✅ Headers: Đầy đủ các field

---

## 🔧 CORS Error Fix - Step by Step

### ⚠️ Vấn đề hiện tại:
```
Access to fetch at 'https://script.google.com/macros/s/.../exec' from origin 
'https://workflow.egg-ventures.com' has been blocked by CORS policy
```

### ✅ Solution:

#### Bước 1: Verify Google Apps Script Code

1. **Mở Google Apps Script:** https://script.google.com
2. **Mở project đang deploy**
3. **Kiểm tra code có CORS headers:**
   - Mở file `Code.gs`
   - Tìm function `createResponse()` (dòng ~710)
   - Đảm bảo có `.setHeaders()` với CORS:
   ```javascript
   .setHeaders({
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type'
   })
   ```

4. **Nếu chưa có:**
   - Copy code từ file `VOUCHER_WORKFLOW_BACKEND.gs`
   - Paste vào Google Apps Script
   - **Save** (Ctrl+S)

#### Bước 2: Check Deployment Settings (QUAN TRỌNG NHẤT)

1. **Click "Deploy"** → **"Manage deployments"**
2. **Click icon ✏️ (Edit)** ở deployment hiện tại
3. **PHẢI đảm bảo:**
   - ✅ **Execute as:** `Me (your-email@gmail.com)`
   - ✅ **Who has access:** `Anyone` ⚠️⚠️⚠️ **BẮT BUỘC!**
4. **Click "Save"**

#### Bước 3: Deploy lại (Bắt buộc sau khi update code)

1. **Click "Deploy"** → **"New deployment"**
2. **Click icon ⚙️ (Settings)**
3. **Chọn "Web app"**
4. **Settings:**
   - Description: `TLCG Voucher v1.3 (CORS fix)`
   - Execute as: `Me`
   - **Who has access: `Anyone`** ⚠️⚠️⚠️
5. **Click "Deploy"**
6. **Authorize** nếu được hỏi
7. **Copy Web App URL mới** (nếu thay đổi)

#### Bước 4: Update URL in Frontend (nếu có URL mới)

1. **Mở file `phieu_thu_chi.html`**
2. **Tìm dòng 2253:**
   ```javascript
   const GOOGLE_APPS_SCRIPT_WEB_APP_URL = '...';
   ```
3. **Update URL mới** (nếu có)
4. **Lưu file**

#### Bước 5: Verify Sheet Permissions

1. **Mở spreadsheet:** https://docs.google.com/spreadsheets/d/1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g/edit
2. **Click "Share"** (góc trên bên phải)
3. **Kiểm tra Apps Script account:**
   - Tìm email bạn dùng để deploy Apps Script
   - Đảm bảo có quyền **Editor** (không phải Viewer)
4. **Nếu chưa có:** Thêm email và set quyền **Editor**

#### Bước 6: Test

1. **Clear browser cache:**
   - Ctrl+Shift+Delete (Windows) hoặc Cmd+Shift+Delete (Mac)
   - Chọn "Cached images and files"
   - Click "Clear data"
2. **Hard refresh:** Ctrl+F5 (hoặc Cmd+Shift+R)
3. **Test form:**
   - Mở `phieu_thu_chi.html`
   - Submit form
   - Mở **Developer Console** (F12)
   - Kiểm tra:
     - ✅ Không còn CORS error
     - ✅ Response được nhận thành công

---

## 🧪 Test Functions in Google Apps Script

### Test 1: Sheet Access
```javascript
function testSheetAccess() {
  try {
    const sheet = getVoucherHistorySheet_();
    Logger.log('✅ Sheet accessed: ' + sheet.getName());
    Logger.log('✅ Sheet has ' + sheet.getLastRow() + ' rows');
    return 'Success';
  } catch (e) {
    Logger.log('❌ Error: ' + e.toString());
    return 'Error: ' + e.toString();
  }
}
```

### Test 2: Test GET Request
```javascript
function testGetRequest() {
  const url = 'https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec?action=getVoucherSummary';
  const response = UrlFetchApp.fetch(url);
  Logger.log('Response: ' + response.getContentText());
  return response.getContentText();
}
```

### Test 3: Check CORS Headers
Trong Google Apps Script:
1. Chọn function `doGet`
2. Click **Run**
3. Xem Execution logs
4. Kiểm tra response có CORS headers không

---

## ✅ Final Checklist

### Google Apps Script:
- [ ] Code có CORS headers trong `createResponse()`
- [ ] Code có CORS headers trong `doGet()`
- [ ] Đã Save code
- [ ] Deployment settings: "Anyone" access
- [ ] Đã deploy lại với version mới

### Google Sheets:
- [ ] Sheet "Voucher_History" tồn tại ✅
- [ ] Sheet có headers đầy đủ ✅
- [ ] Apps Script account có quyền Editor

### Frontend:
- [ ] URL đã được update (nếu có URL mới)
- [ ] File đã được save
- [ ] Browser cache đã được clear

### Testing:
- [ ] Đã test submit form
- [ ] Không còn CORS error trong console
- [ ] Response được nhận thành công
- [ ] Data được lưu vào sheet

---

## 🔍 Debug nếu vẫn lỗi:

### 1. Check Execution Logs

1. **Vào Google Apps Script**
2. **Click "Executions"** (menu trái)
3. **Click vào execution mới nhất**
4. **Xem logs:**
   - ✅ Success logs
   - ❌ Error messages

### 2. Test Direct URL

Mở URL này trong browser (thay YOUR_WEB_APP_ID):
```
https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec?action=getVoucherSummary
```

**Expected:** JSON response hoặc "Google Apps Script is running!"

### 3. Check Network Tab

1. **Mở Developer Console** (F12)
2. **Click tab "Network"**
3. **Submit form**
4. **Click vào request đến Google Apps Script**
5. **Check:**
   - Request Headers
   - Response Headers (xem có CORS headers không)
   - Response Body

---

## 📞 Nếu vẫn không được:

1. **Copy error message đầy đủ từ console**
2. **Copy Execution logs từ Google Apps Script**
3. **Kiểm tra:**
   - Deployment có "Anyone" access không
   - Code đã được save chưa
   - Đã deploy lại chưa

---

**Status:** Sheet configuration ✅ | CORS fix in progress

