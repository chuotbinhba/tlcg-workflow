# Setup Authentication System - Step by Step

## 📋 Checklist

### Phase 1: Google Sheets Setup
- [ ] Tạo Google Sheet mới
- [ ] Setup headers
- [ ] Thêm users mẫu
- [ ] Copy Spreadsheet ID

### Phase 2: Google Apps Script
- [ ] Thêm authentication code
- [ ] Cập nhật doPost
- [ ] Deploy Web App
- [ ] Test authentication

### Phase 3: Frontend
- [ ] Cập nhật login function
- [ ] Test login flow
- [ ] Verify user data display

---

## 🚀 Step-by-Step Guide

### Step 1: Tạo Google Sheet cho Users

1. **Tạo Google Sheet mới:**
   - Vào: https://sheets.google.com
   - Tạo sheet mới: `TLCG Users Database`
   - Hoặc dùng sheet hiện có

2. **Setup Headers (Row 1):**
   ```
   A1: email
   B1: password
   C1: name
   D1: role
   E1: isAdmin
   F1: employeeId
   G1: department
   H1: status
   ```

3. **Thêm Users mẫu (Row 2+):**
   ```
   A2: admin@tlcgroup.com
   B2: (sẽ được hash tự động)
   C2: Super Admin
   D2: System Administrator
   E2: TRUE
   F2: ADM-001
   G2: IT
   H2: Active
   ```

4. **Tạo Password Hash:**
   - Mở Google Apps Script
   - Chạy function `hashPassword('yourpassword')` trong script editor
   - Copy kết quả vào column B

5. **Copy Spreadsheet ID:**
   - Từ URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy `SPREADSHEET_ID`

---

### Step 2: Setup Google Apps Script

1. **Mở Google Apps Script:**
   - Vào: https://script.google.com
   - Mở project hiện có (hoặc tạo mới)

2. **Thêm Authentication Code:**
   - Copy nội dung từ `google-apps-script-auth.gs`
   - Paste vào file mới hoặc file hiện có

3. **Cập nhật Constants:**
   ```javascript
   const USERS_SHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Paste ID từ Step 1
   const USERS_SHEET_NAME = 'Users'; // Hoặc tên sheet tab của bạn
   ```

4. **Cập nhật doPost:**
   Thêm vào function `doPost`:
   ```javascript
   function doPost(e) {
     try {
       let requestBody;
       
       if (e.postData && e.postData.contents) {
         requestBody = JSON.parse(e.postData.contents);
       } else if (e.parameter) {
         requestBody = e.parameter;
       } else {
         return createResponse(false, 'Invalid request');
       }
       
       const action = requestBody.action;
       
       // Add login handler
       if (action === 'login') {
         return handleLogin(requestBody);
       }
       
       // ... existing code for other actions (sendEmail, syncToSheets, etc.)
       
       return createResponse(false, 'Unknown action');
     } catch (error) {
       Logger.log('doPost error: ' + error.toString());
       return createResponse(false, 'Server error: ' + error.message);
     }
   }
   ```

5. **Test Hash Password:**
   - Trong script editor, chạy: `hashPassword('test123')`
   - Copy kết quả
   - Paste vào Google Sheet column B cho user test

6. **Deploy Web App:**
   - Click "Deploy" → "New deployment"
   - Type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy Web App URL

---

### Step 3: Cập nhật Frontend

1. **Thêm Web App URL:**
   ```javascript
   const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE';
   ```

2. **Cập nhật handleLogin function:**
   ```javascript
   async function handleLogin(event) {
       event.preventDefault();
       const email = document.getElementById('login-email').value;
       const password = document.getElementById('login-pass').value;
       
       // Show loading
       const submitBtn = event.target.querySelector('button[type="submit"]');
       const originalText = submitBtn.textContent;
       submitBtn.disabled = true;
       submitBtn.textContent = 'Signing in...';
       
       try {
           const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                   action: 'login',
                   email: email,
                   password: password
               })
           });
           
           const result = await response.json();
           
           if (result.success) {
               currentUser = result.data; // User data from server
               updateUI();
               document.getElementById('login-page').classList.add('hidden');
               document.getElementById('main-content').classList.remove('hidden');
               showPage(requestedPage || 'home');
           } else {
               alert('Login failed: ' + result.message);
           }
       } catch (error) {
           console.error('Login error:', error);
           alert('Login error. Please try again.');
       } finally {
           submitBtn.disabled = false;
           submitBtn.textContent = originalText;
       }
   }
   ```

---

## 🧪 Testing

### Test 1: Hash Password
1. Mở Apps Script
2. Chạy: `hashPassword('password123')`
3. Copy kết quả
4. Paste vào Google Sheet

### Test 2: Login API
1. Mở Apps Script
2. Chạy: `handleLogin({email: 'admin@tlcgroup.com', password: 'password123'})`
3. Kiểm tra kết quả

### Test 3: Frontend Login
1. Mở `tlcgroup-intranet.html`
2. Nhập email và password
3. Click "Sign In"
4. Kiểm tra console logs

---

## 🔧 Troubleshooting

### Error: "Spreadsheet not found"
- Kiểm tra `USERS_SHEET_ID` đúng chưa
- Kiểm tra quyền truy cập Google Sheet

### Error: "Invalid email or password"
- Kiểm tra email đúng format chưa
- Kiểm tra password đã được hash chưa
- Kiểm tra status = "Active"

### Error: "CORS error"
- Kiểm tra Web App URL đúng chưa
- Kiểm tra deployment settings

### Error: "No users configured"
- Kiểm tra sheet có data chưa
- Kiểm tra headers đúng chưa

---

## 📝 Sample Google Sheet Data

| email | password | name | role | isAdmin | employeeId | department | status |
|-------|----------|------|------|---------|-------------|-------------|--------|
| admin@tlcgroup.com | a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3 | Super Admin | System Administrator | TRUE | ADM-001 | IT | Active |
| chinh@tlcgroup.com | 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8 | Nguyễn Văn Chinh | Finance Manager | FALSE | EMP-001 | Finance | Active |

**Note:** Passwords above are hashed versions of:
- `admin@tlcgroup.com` → password: `hello` (hash: a665a459...)
- `chinh@tlcgroup.com` → password: `password` (hash: 5e884898...)

---

## ✅ Next Steps

Sau khi setup xong:
1. Test login với user trong Google Sheet
2. Thêm thêm users vào Google Sheet
3. (Optional) Thêm tính năng "Forgot Password"
4. (Optional) Thêm tính năng "Change Password"
5. (Optional) Thêm session management với JWT

Bạn muốn tôi implement code cụ thể không?

