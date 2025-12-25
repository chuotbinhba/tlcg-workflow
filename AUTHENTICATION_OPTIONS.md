# Hướng dẫn Tạo Username & Password System

## 🎯 3 Cách Triển khai (từ đơn giản → nâng cao)

### Cách 1: Google Sheets làm Database (Khuyến nghị) ⭐

**Ưu điểm:**
- ✅ Dễ setup, không cần server riêng
- ✅ Dùng Google Apps Script (đã có sẵn)
- ✅ Quản lý user qua Google Sheets
- ✅ Bảo mật tốt (password được hash)

**Cách hoạt động:**
1. Tạo Google Sheet lưu danh sách users
2. Google Apps Script xử lý authentication
3. Frontend gọi API để login

---

### Cách 2: Local Storage (Demo/Prototype)

**Ưu điểm:**
- ✅ Nhanh, không cần backend
- ✅ Phù hợp demo/test

**Nhược điểm:**
- ❌ Không bảo mật (password lưu plain text)
- ❌ Chỉ hoạt động trên 1 browser
- ❌ Không phù hợp production

---

### Cách 3: Google OAuth (Enterprise)

**Ưu điểm:**
- ✅ Bảo mật cao
- ✅ Single Sign-On (SSO)
- ✅ Quản lý tập trung

**Nhược điểm:**
- ❌ Setup phức tạp hơn
- ❌ Cần Google Workspace

---

## 🚀 Triển khai Cách 1: Google Sheets + Apps Script

### Bước 1: Tạo Google Sheet cho Users

1. **Tạo Google Sheet mới:** `TLCG Users Database`
2. **Tạo headers:**
   - Column A: `email`
   - Column B: `password` (sẽ hash)
   - Column C: `name`
   - Column D: `role`
   - Column E: `isAdmin` (TRUE/FALSE)
   - Column F: `employeeId`
   - Column G: `department`
   - Column H: `status` (Active/Inactive)

3. **Thêm dữ liệu mẫu:**
   ```
   email                    | password | name          | role              | isAdmin | employeeId | department | status
   admin@tlcgroup.com      | hash123 | Super Admin   | Administrator     | TRUE    | ADM-001    | IT         | Active
   chinh@tlcgroup.com      | hash456 | Nguyễn Văn Chinh | Finance Manager | FALSE   | EMP-001    | Finance    | Active
   ```

### Bước 2: Cập nhật Google Apps Script

Thêm functions vào `google-apps-script-code.gs`:

```javascript
/**
 * Authenticate user
 */
function authenticateUser(email, password) {
  try {
    const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID')
      .getSheetByName('Users'); // Hoặc sheet đầu tiên
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find email column
    const emailCol = headers.indexOf('email');
    const passwordCol = headers.indexOf('password');
    const nameCol = headers.indexOf('name');
    const roleCol = headers.indexOf('role');
    const isAdminCol = headers.indexOf('isAdmin');
    const employeeIdCol = headers.indexOf('employeeId');
    const statusCol = headers.indexOf('status');
    
    // Search for user
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[emailCol] === email && row[statusCol] === 'Active') {
        // Verify password (simple hash comparison)
        // In production, use proper password hashing (bcrypt, etc.)
        if (row[passwordCol] === hashPassword(password)) {
          return {
            success: true,
            user: {
              email: row[emailCol],
              name: row[nameCol],
              role: row[roleCol],
              isAdmin: row[isAdminCol] === true || row[isAdminCol] === 'TRUE',
              employeeId: row[employeeIdCol]
            }
          };
        }
      }
    }
    
    return { success: false, message: 'Invalid email or password' };
  } catch (error) {
    Logger.log('Auth error: ' + error.toString());
    return { success: false, message: 'Authentication error' };
  }
}

/**
 * Simple password hashing (for demo)
 * In production, use proper hashing library
 */
function hashPassword(password) {
  // Simple hash - replace with proper bcrypt in production
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Handle login request
 */
function handleLogin(requestBody) {
  try {
    const email = requestBody.email;
    const password = requestBody.password;
    
    if (!email || !password) {
      return createResponse(false, 'Email and password are required');
    }
    
    const authResult = authenticateUser(email, password);
    
    if (authResult.success) {
      return createResponse(true, 'Login successful', authResult.user);
    } else {
      return createResponse(false, authResult.message || 'Invalid credentials');
    }
  } catch (error) {
    Logger.log('Login error: ' + error.toString());
    return createResponse(false, 'Login error: ' + error.message);
  }
}
```

### Bước 3: Cập nhật doPost trong Apps Script

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
    
    if (action === 'login') {
      return handleLogin(requestBody);
    }
    
    // ... existing code for other actions
    
    return createResponse(false, 'Unknown action');
  } catch (error) {
    Logger.log('doPost error: ' + error.toString());
    return createResponse(false, 'Server error: ' + error.message);
  }
}
```

### Bước 4: Cập nhật Frontend (tlcgroup-intranet.html)

```javascript
const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'YOUR_WEB_APP_URL';

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

## 📝 Quick Setup Checklist

### Google Sheets Setup:
- [ ] Tạo Google Sheet "TLCG Users Database"
- [ ] Thêm headers: email, password, name, role, isAdmin, employeeId, department, status
- [ ] Thêm ít nhất 1 user test
- [ ] Copy Spreadsheet ID

### Google Apps Script:
- [ ] Thêm functions: `authenticateUser`, `hashPassword`, `handleLogin`
- [ ] Cập nhật `doPost` để handle action 'login'
- [ ] Deploy as Web App
- [ ] Copy Web App URL

### Frontend:
- [ ] Thêm `GOOGLE_APPS_SCRIPT_WEB_APP_URL` constant
- [ ] Cập nhật `handleLogin` function để gọi API
- [ ] Test login với user trong Google Sheet

---

## 🔒 Bảo mật Nâng cao (Optional)

### 1. Password Hashing:
- Dùng bcrypt hoặc Argon2
- Không lưu plain text password

### 2. Session Management:
- Tạo JWT token sau login
- Lưu token trong localStorage
- Validate token mỗi request

### 3. Rate Limiting:
- Giới hạn số lần login thất bại
- Lock account sau X lần sai

### 4. HTTPS:
- Luôn dùng HTTPS cho production
- Bảo vệ password khi truyền

---

## 🎯 Recommendation

**Cho Production:** Dùng **Cách 1 (Google Sheets + Apps Script)**
- Dễ setup
- Bảo mật tốt
- Tích hợp với hệ thống hiện có
- Có thể mở rộng sau

Bạn muốn tôi implement cách nào?

