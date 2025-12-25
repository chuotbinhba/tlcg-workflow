/**
 * AUTHENTICATION FUNCTIONS FOR TLCGROUP INTRANET
 * Add these functions to your existing google-apps-script-code.gs file
 */

// ⚠️ IMPORTANT: Google Sheet ID for TLCG Master Data
const USERS_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c'; // TLCG Master Data
const USERS_SHEET_NAME = 'Nhân viên'; // Sheet name: Nhân viên
// Alternative: Use gid=2018642708 if sheet name doesn't work

/**
 * Authenticate user with email and password
 */
function authenticateUser(email, password) {
  try {
    Logger.log('=== AUTHENTICATE USER ===');
    Logger.log('Email: ' + email);
    
    // Open the users spreadsheet
    const spreadsheet = SpreadsheetApp.openById(USERS_SHEET_ID);
    
    // Try to get sheet by name first, then by gid if needed
    let sheet = spreadsheet.getSheetByName(USERS_SHEET_NAME);
    if (!sheet) {
      // Try using gid (sheet index)
      const sheets = spreadsheet.getSheets();
      // gid=2018642708 - you may need to find the correct sheet index
      sheet = sheets[0]; // Default to first sheet if name not found
      Logger.log('Sheet name not found, using first sheet');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      Logger.log('No users found in sheet');
      return { success: false, message: 'No users configured' };
    }
    
    // Map columns based on actual sheet structure from Google Sheet:
    // A: Họ và tên (Name)
    // B: Chức vụ (Position)
    // C: Phòng ban (Department)
    // D: Công ty (Company)
    // E: Email
    // F: Điện thoại (Phone)
    // G: Status
    // H: EmployeeId
    // I: Role
    // J: isAdmin
    // K: Password
    
    const headers = data[0];
    
    // Debug: Log all headers
    Logger.log('Sheet headers: ' + JSON.stringify(headers));
    Logger.log('Total columns: ' + headers.length);
    
    // Find columns by header name first, then by position
    let emailCol = headers.indexOf('Email');
    if (emailCol === -1) emailCol = headers.indexOf('email');
    if (emailCol === -1) emailCol = 4; // Column E (0-indexed = 4)
    
    // Find password column - try multiple methods
    let passwordCol = headers.indexOf('Password');
    if (passwordCol === -1) passwordCol = headers.indexOf('password');
    if (passwordCol === -1) passwordCol = headers.indexOf('Password'); // Case sensitive check
    // If still not found, try Column K (index 10) or Column J (index 9)
    if (passwordCol === -1) {
      // Check if Column K (index 10) exists and has data in row 2
      if (headers.length > 10 && data.length > 1 && data[1][10]) {
        passwordCol = 10; // Column K
        Logger.log('Using Column K (index 10) for password');
      } else if (headers.length > 9 && data.length > 1 && data[1][9]) {
        passwordCol = 9; // Column J
        Logger.log('Using Column J (index 9) for password');
      } else {
        passwordCol = 10; // Default to Column K
        Logger.log('Defaulting to Column K (index 10) for password');
      }
    }
    
    let nameCol = headers.indexOf('Họ và tên');
    if (nameCol === -1) nameCol = headers.indexOf('name');
    if (nameCol === -1) nameCol = 0; // Column A
    
    let roleCol = headers.indexOf('Role');
    if (roleCol === -1) roleCol = headers.indexOf('role');
    if (roleCol === -1) roleCol = 8; // Column I
    
    let isAdminCol = headers.indexOf('isAdmin');
    if (isAdminCol === -1) isAdminCol = headers.indexOf('IsAdmin');
    if (isAdminCol === -1) isAdminCol = 9; // Column J
    
    let employeeIdCol = headers.indexOf('EmployeeId');
    if (employeeIdCol === -1) employeeIdCol = headers.indexOf('employeeId');
    if (employeeIdCol === -1) employeeIdCol = 7; // Column H
    
    let departmentCol = headers.indexOf('Phòng ban');
    if (departmentCol === -1) departmentCol = headers.indexOf('department');
    if (departmentCol === -1) departmentCol = 2; // Column C
    
    let statusCol = headers.indexOf('Status');
    if (statusCol === -1) statusCol = headers.indexOf('status');
    if (statusCol === -1) statusCol = 6; // Column G
    
    Logger.log('Column mapping:');
    Logger.log('Email: ' + emailCol + ' (header: ' + (headers[emailCol] || 'N/A') + ')');
    Logger.log('Password: ' + passwordCol + ' (header: ' + (headers[passwordCol] || 'N/A') + ')');
    Logger.log('Name: ' + nameCol + ', Role: ' + roleCol + ', isAdmin: ' + isAdminCol + ', Status: ' + statusCol);
    
    // Validate required columns exist
    if (emailCol === -1) {
      Logger.log('ERROR: Email column not found');
      return { success: false, message: 'Database configuration error: Email column not found' };
    }
    
    // Check if password column has data
    if (passwordCol >= 0 && data.length > 1) {
      const samplePassword = data[1][passwordCol];
      Logger.log('Sample password from row 2, column ' + passwordCol + ': ' + (samplePassword ? samplePassword.toString().substring(0, 20) + '...' : 'EMPTY'));
    }
    
    // Validate password input
    if (!password || password === null || password === undefined || password.toString().trim() === '') {
      Logger.log('ERROR: Password is null, undefined, or empty');
      return { success: false, message: 'Password is required' };
    }
    
    // Hash the provided password
    let hashedPassword;
    try {
      hashedPassword = hashPassword(password);
      Logger.log('Hashed password: ' + hashedPassword.substring(0, 10) + '...');
    } catch (hashError) {
      Logger.log('ERROR hashing password: ' + hashError.toString());
      return { success: false, message: 'Error processing password: ' + hashError.message };
    }
    
    // Search for user
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowEmail = row[emailCol];
      
      // Skip empty rows
      if (!rowEmail || rowEmail.toString().trim() === '') {
        continue;
      }
      
      const rowPassword = passwordCol >= 0 ? row[passwordCol] : '';
      const rowStatus = statusCol >= 0 ? row[statusCol] : 'Active';
      
      // Check email match (case insensitive)
      if (rowEmail.toString().toLowerCase().trim() === email.toLowerCase().trim()) {
        Logger.log('Found user: ' + rowEmail);
        Logger.log('Row password (raw): ' + (rowPassword ? rowPassword.toString().substring(0, 20) + '...' : 'EMPTY'));
        Logger.log('Hashed password (input): ' + hashedPassword.substring(0, 20) + '...');
        
        // Check status
        if (rowStatus && rowStatus.toString().toLowerCase() !== 'active') {
          Logger.log('User account is inactive. Status: ' + rowStatus);
          return { success: false, message: 'Account is inactive' };
        }
        
        // Check if password column exists and has value
        if (passwordCol < 0 || !rowPassword || rowPassword.toString().trim() === '') {
          Logger.log('WARNING: Password not set for user. Column: ' + passwordCol + ', Value: ' + rowPassword);
          return { success: false, message: 'Password not configured for this user. Please contact administrator.' };
        }
        
        // Trim and compare password (compare hashed)
        const storedPassword = rowPassword.toString().trim();
        Logger.log('Comparing passwords - Stored: ' + storedPassword.substring(0, 20) + '... vs Hashed: ' + hashedPassword.substring(0, 20) + '...');
        
        if (storedPassword === hashedPassword) {
          Logger.log('Password match! Authentication successful');
          
          // Get company from column D
          const company = row[3] || ''; // Column D (0-indexed = 3)
          
          // Return user data
          return {
            success: true,
            user: {
              email: rowEmail.toString().trim(),
              name: nameCol >= 0 && row[nameCol] ? row[nameCol].toString().trim() : 'User',
              role: roleCol >= 0 && row[roleCol] ? row[roleCol].toString().trim() : 'User',
              isAdmin: isAdminCol >= 0 ? (row[isAdminCol] === true || row[isAdminCol] === 'TRUE' || row[isAdminCol] === 'true' || row[isAdminCol] === 'True') : false,
              employeeId: employeeIdCol >= 0 && row[employeeIdCol] ? row[employeeIdCol].toString().trim() : '',
              department: departmentCol >= 0 && row[departmentCol] ? row[departmentCol].toString().trim() : '',
              company: company.toString().trim() || ''
            }
          };
        } else {
          Logger.log('Password mismatch');
          return { success: false, message: 'Invalid password' };
        }
      }
    }
    
    Logger.log('User not found: ' + email);
    return { success: false, message: 'Invalid email or password' };
    
  } catch (error) {
    Logger.log('Authentication error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return { success: false, message: 'Authentication error: ' + error.message };
  }
}

/**
 * Hash password using SHA-256
 * Note: For production, consider using bcrypt or Argon2
 */
function hashPassword(password) {
  try {
    // Validate input
    if (!password || password === null || password === undefined) {
      Logger.log('Hash error: Password is null or undefined');
      throw new Error('Password cannot be null or undefined');
    }
    
    // Convert to string if not already
    const passwordString = password.toString().trim();
    
    if (passwordString === '') {
      Logger.log('Hash error: Password is empty');
      throw new Error('Password cannot be empty');
    }
    
    Logger.log('Hashing password (length: ' + passwordString.length + ')');
    
    const rawHash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      passwordString,
      Utilities.Charset.UTF_8
    );
    
    // Convert to hex string
    const hashString = rawHash.map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
    
    Logger.log('Hash generated successfully (length: ' + hashString.length + ')');
    return hashString;
  } catch (error) {
    Logger.log('Hash error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    throw error; // Re-throw to see the actual error
  }
}

/**
 * Handle login request from frontend
 */
function handleLogin(requestBody) {
  try {
    Logger.log('=== HANDLE LOGIN ===');
    Logger.log('Request body: ' + JSON.stringify(requestBody));
    Logger.log('Request body type: ' + typeof requestBody);
    Logger.log('Request body keys: ' + Object.keys(requestBody || {}).join(', '));
    
    const email = requestBody.email;
    const password = requestBody.password;
    
    Logger.log('Email: ' + email + ' (type: ' + typeof email + ')');
    Logger.log('Password: ' + (password ? '***' : 'NULL/UNDEFINED') + ' (type: ' + typeof password + ')');
    
    if (!email || email === null || email === undefined || email.toString().trim() === '') {
      Logger.log('ERROR: Email is missing, null, or empty');
      return createResponse(false, 'Email is required');
    }
    
    if (!password || password === null || password === undefined || password.toString().trim() === '') {
      Logger.log('ERROR: Password is missing, null, or empty');
      return createResponse(false, 'Password is required');
    }
    
    // Authenticate user
    const authResult = authenticateUser(email, password);
    
    if (authResult.success) {
      Logger.log('Login successful for: ' + email);
      return createResponse(true, 'Login successful', authResult.user);
    } else {
      Logger.log('Login failed: ' + authResult.message);
      return createResponse(false, authResult.message || 'Invalid credentials');
    }
  } catch (error) {
    Logger.log('Login handler error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return createResponse(false, 'Login error: ' + error.message);
  }
}

/**
 * Create a new user (Admin only function)
 */
function createUser(email, password, name, role, isAdmin, employeeId, department) {
  try {
    const spreadsheet = SpreadsheetApp.openById(USERS_SHEET_ID);
    const sheet = spreadsheet.getSheetByName(USERS_SHEET_NAME) || spreadsheet.getSheets()[0];
    
    // Check if user exists
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol = headers.indexOf('email');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailCol] === email) {
        return { success: false, message: 'User already exists' };
      }
    }
    
    // Hash password
    const hashedPassword = hashPassword(password);
    
    // Add new user
    const newRow = [
      email,
      hashedPassword,
      name || '',
      role || 'Employee',
      isAdmin || false,
      employeeId || '',
      department || '',
      'Active'
    ];
    
    sheet.appendRow(newRow);
    
    return { success: true, message: 'User created successfully' };
  } catch (error) {
    Logger.log('Create user error: ' + error.toString());
    return { success: false, message: 'Error creating user: ' + error.message };
  }
}

/**
 * Update user password
 */
function updateUserPassword(email, oldPassword, newPassword) {
  try {
    const authResult = authenticateUser(email, oldPassword);
    if (!authResult.success) {
      return { success: false, message: 'Current password is incorrect' };
    }
    
    const spreadsheet = SpreadsheetApp.openById(USERS_SHEET_ID);
    const sheet = spreadsheet.getSheetByName(USERS_SHEET_NAME) || spreadsheet.getSheets()[0];
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol = headers.indexOf('email');
    const passwordCol = headers.indexOf('password');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailCol] === email) {
        const hashedPassword = hashPassword(newPassword);
        sheet.getRange(i + 1, passwordCol + 1).setValue(hashedPassword);
        return { success: true, message: 'Password updated successfully' };
      }
    }
    
    return { success: false, message: 'User not found' };
  } catch (error) {
    Logger.log('Update password error: ' + error.toString());
    return { success: false, message: 'Error updating password: ' + error.message };
  }
}

