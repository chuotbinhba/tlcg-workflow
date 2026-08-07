# Login Workflow Confirmation

## Current Implementation (Verified)

### 1. Spreadsheet Configuration
- **Spreadsheet ID**: `1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g`
- **Sheet Name**: `"Nhân viên"`
- **Sheet GID**: `2018642708` (alternative identifier)

### 2. Column Mapping

| Column | Index | Header Name | Purpose | Used in Login? |
|--------|-------|-------------|---------|----------------|
| A | 0 | Họ và tên | User's full name | No (returned in response) |
| B | 1 | Chức vụ | Position/Role | No (returned in response) |
| C | 2 | Phòng ban | Department | No (returned in response) |
| D | 3 | Công ty | Company | No (returned in response) |
| **E** | **4** | **Email** | **User email** | **✅ YES - Used to find user** |
| F | 5 | Điện thoại | Phone | No (returned in response) |
| G | 6 | Status | Account status | ✅ YES - Must be "Active" |
| H | 7 | EmployeeId | Employee ID | No (returned in response) |
| I | 8 | Role | User role | No (returned in response) |
| J | 9 | isAdmin | Admin flag | No (returned in response) |
| **K** | **10** | **Login_password** | **Display name/role identifier** | **❌ NO - NOT used for authentication** |
| **L** | **11** | **Password** | **SHA-256 hashed password** | **✅ YES - Used to verify password** |

### 3. Login Workflow (Step-by-Step)

1. **User submits login form** (from `index.html`)
   - Email: entered by user
   - Password: entered by user (plain text)

2. **Frontend sends request** (`index.html` → `api/voucher.js`)
   - Method: POST
   - Action: `'login'`
   - Body: `{ action: 'login', email: email, password: password }`

3. **API routes to backend** (`api/voucher.js` → `TLCGROUP_BACKEND`)
   - Routes `login` action to `TLCGROUP_BACKEND` URL
   - URL: `https://script.google.com/macros/s/AKfycbwoHjoTtE4rPATdp1LO1Of25mSRPm8HVWwbOEgrDpZ07VEz7o38_8Icb1rl235N9VEXnQ/exec`

4. **Backend receives request** (`TLCG_CORE_BACKEND.gs`)
   - `doPost()` function receives the request
   - Parses request body
   - Routes to `handleLogin()` function

5. **Authentication process** (`authenticateUser()` function)
   - Opens spreadsheet: `SpreadsheetApp.openById('1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g')`
   - Gets sheet: `spreadsheet.getSheetByName('Nhân viên')`
   - Reads all data: `sheet.getDataRange().getValues()`

6. **Email lookup** (Column E, index 4)
   - Searches for matching email in Column E
   - Case-insensitive comparison
   - If not found: returns `{ success: false, message: 'Invalid email or password' }`

7. **Password verification** (Column L, index 11)
   - Hashes the entered password using SHA-256: `hashPassword(password)`
   - Retrieves stored hash from Column L (index 11)
   - Compares: `storedHash === hashedInputPassword`
   - If match: authentication successful
   - If mismatch: returns `{ success: false, message: 'Invalid password' }`

8. **Status check** (Column G, index 6)
   - Checks if user status is "Active"
   - If not active: returns `{ success: false, message: 'Account is inactive' }`

9. **Success response**
   - Returns user data (name, role, email, employeeId, department, company, phone, isAdmin)
   - **Password is NEVER returned** (security)

## Important Notes

### Column K vs Column L
- **Column K (Login_password)**: Contains values like "Manager 1", "Manager 4" - this is NOT used for authentication
- **Column L (Password)**: Contains SHA-256 hashed passwords - this IS used for authentication

### Password Hashing
- User enters plain text password
- System hashes it using SHA-256
- Compares with stored hash in Column L
- Column L should contain pre-hashed passwords (SHA-256 format)

### Security
- Passwords are never returned in API responses
- Passwords are hashed before comparison
- Only active users can log in

## Code Locations

- **Frontend login**: `index.html` (line ~1689)
- **API proxy**: `api/voucher.js` (routes to TLCGROUP_BACKEND)
- **Backend authentication**: `TLCG_CORE_BACKEND.gs`
  - `doPost()`: Receives requests
  - `handleLogin()`: Handles login action
  - `authenticateUser()`: Performs authentication
  - `hashPassword()`: Hashes passwords using SHA-256
  - `safeOpenSpreadsheet()`: Opens spreadsheet with error handling

## Verification Checklist

- ✅ Spreadsheet ID is correct: `1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g`
- ✅ Sheet name is correct: `"Nhân viên"`
- ✅ Email column is Column E (index 4)
- ✅ Password hash column is Column L (index 11) - **NOT Column K**
- ✅ Password hashing uses SHA-256
- ✅ Status check requires "Active"
- ✅ Column K is NOT used for authentication

## Current Issue

The error "Unexpected error while getting the method or property openById on object SpreadsheetApp" suggests:
1. Script may not be authorized to access Google Sheets
2. Deployment configuration may be incorrect
3. Spreadsheet permissions may be insufficient

See `FIX_LOGIN_ERROR_GUIDE.md` for troubleshooting steps.
