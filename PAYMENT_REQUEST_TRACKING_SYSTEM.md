# 📊 Payment Request Tracking System - Complete Guide

## 🎯 Overview

This guide explains how to **store**, **track**, and **display** payment requests so users can see real-time status updates.

---

## 📋 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  User Creates Request                                            │
│  - Fills form (6 steps)                                         │
│  - Clicks "Gửi phê duyệt"                                       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ POST: action=submitPaymentRequest
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  Vercel Proxy                                                    │
│  - Routes to Payment Request Backend                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  Google Apps Script Backend                                      │
│  1. Generate unique Request ID                                  │
│  2. Save to "DNTT" sheet (Đề nghị thanh toán)                  │
│  3. Send approval emails                                        │
│  4. Return success + Request ID                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  Google Sheets Storage                                          │
│  Sheet: "DNTT" (Đề nghị thanh toán)                            │
│  - All request data                                             │
│  - Status tracking                                              │
│  - Approval history                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Google Sheets Structure

### **Sheet Name:** `DNTT` (Đề nghị thanh toán)

**Location:** Same spreadsheet as "Nhà cung cấp"
- **Spreadsheet ID:** `1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g`

### **Column Structure:**

| Col | Header | Description | Example |
|-----|--------|-------------|---------|
| **A** | Request_ID | Unique ID | DNTT-2025-001 |
| **B** | Request_Number | User-facing number | PR-2025-001 |
| **C** | Company | Purchasing company | CÔNG TY TNHH EGG VENTURES |
| **D** | Request_Date | Date created | 2025-01-08 |
| **E** | Requester_Name | Who created | Nguyễn Văn Chinh |
| **F** | Requester_Email | Email for notifications | chinh@tlcgroup.vn |
| **G** | Department | Department | IT |
| **H** | Purchase_Type | Type of purchase | Đề nghị mua hàng - Hàng hóa |
| **I** | PR_Request_No | PR number | PR-2025-001 |
| **J** | Purpose | Purpose & reason | Mua laptop cho nhân viên mới |
| **K** | Recipient | Who receives | Nguyễn Văn A |
| **L** | Supplier | Vendor name | CÔNG TY ABC |
| **M** | Total_Amount | Total amount | 50000000 |
| **N** | Currency | Currency type | VND |
| **O** | Payment_Type | Payment method | Chuyển khoản |
| **P** | PO_Number | Purchase order # | PO-2025-001 |
| **Q** | **Overall_Status** | **Main status** | **Pending/Approved/Rejected** |
| **R** | Budget_Approver | Budget approver name | Lê Minh Cường |
| **S** | Budget_Approval_Status | Budget status | Pending/Approved/Rejected |
| **T** | Budget_Approval_Date | When approved | 2025-01-08 10:30 |
| **U** | Supplier_Approver | Supplier approver | Phạm Thị Dung |
| **V** | Supplier_Approval_Status | Supplier status | Pending/Approved/Rejected |
| **W** | Supplier_Approval_Date | When approved | 2025-01-08 11:00 |
| **X** | Final_Approver | Final approver | Hoàng Văn Em |
| **Y** | Final_Approval_Status | Final status | Pending/Approved/Rejected |
| **Z** | Final_Approval_Date | When approved | 2025-01-08 14:00 |
| **AA** | Product_Items_JSON | Product list | JSON string |
| **AB** | Payment_Phases_JSON | Payment phases | JSON string |
| **AC** | Attachments_JSON | File attachments | JSON string |
| **AD** | Signatures_JSON | All signatures | JSON string |
| **AE** | Created_Date | Timestamp created | 2025-01-08 09:00:00 |
| **AF** | Last_Modified_Date | Last update | 2025-01-08 14:00:00 |
| **AG** | Modified_By | Who modified | system/email |
| **AH** | Notes | Additional notes | Comments, reasons |
| **AI** | Rejection_Reason | Why rejected | Budget exceeded |

---

## 🔧 Backend Implementation

### **File:** `PAYMENT_REQUEST_BACKEND.gs`

```javascript
/**
 * Submit new payment request
 */
function handleSubmitPaymentRequest(requestBody) {
  try {
    const SPREADSHEET_ID = '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g';
    const SHEET_NAME = 'DNTT';
    
    // Extract data from request
    const {
      company,
      voucherNumber,
      voucherDate,
      employee,
      department,
      purchaseType,
      prRequestNo,
      purpose,
      recipient,
      supplier,
      totalAmount,
      currency,
      paymentType,
      poNumber,
      productItems,
      paymentPhases,
      attachments,
      signatures,
      budgetApprover,
      supplierApprover,
      finalApprover
    } = requestBody;
    
    // Validate required fields
    if (!company || !employee || !supplier || !budgetApprover) {
      return createResponse(false, 'Missing required fields');
    }
    
    // Get requester email from logged-in user
    const requesterEmail = requestBody.requesterEmail || Session.getActiveUser().getEmail();
    
    // Open sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let dnttSheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!dnttSheet) {
      dnttSheet = ss.insertSheet(SHEET_NAME);
      
      // Add headers
      const headers = [
        'Request_ID', 'Request_Number', 'Company', 'Request_Date', 'Requester_Name',
        'Requester_Email', 'Department', 'Purchase_Type', 'PR_Request_No', 'Purpose',
        'Recipient', 'Supplier', 'Total_Amount', 'Currency', 'Payment_Type',
        'PO_Number', 'Overall_Status', 'Budget_Approver', 'Budget_Approval_Status',
        'Budget_Approval_Date', 'Supplier_Approver', 'Supplier_Approval_Status',
        'Supplier_Approval_Date', 'Final_Approver', 'Final_Approval_Status',
        'Final_Approval_Date', 'Product_Items_JSON', 'Payment_Phases_JSON',
        'Attachments_JSON', 'Signatures_JSON', 'Created_Date', 'Last_Modified_Date',
        'Modified_By', 'Notes', 'Rejection_Reason'
      ];
      dnttSheet.appendRow(headers);
      
      // Format header row
      const headerRange = dnttSheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285F4');
      headerRange.setFontColor('#FFFFFF');
    }
    
    // Generate unique Request ID
    const lastRow = dnttSheet.getLastRow();
    const requestId = 'DNTT-' + new Date().getFullYear() + '-' + String(lastRow).padStart(4, '0');
    
    // Prepare row data
    const now = new Date();
    const rowData = [
      requestId,                              // A: Request_ID
      voucherNumber,                          // B: Request_Number
      company,                                // C: Company
      voucherDate,                            // D: Request_Date
      employee,                               // E: Requester_Name
      requesterEmail,                         // F: Requester_Email
      department || '',                       // G: Department
      purchaseType || '',                     // H: Purchase_Type
      prRequestNo || '',                      // I: PR_Request_No
      purpose || '',                          // J: Purpose
      recipient || '',                        // K: Recipient
      supplier,                               // L: Supplier
      totalAmount || 0,                       // M: Total_Amount
      currency || 'VND',                      // N: Currency
      paymentType || '',                      // O: Payment_Type
      poNumber || '',                         // P: PO_Number
      'Pending',                              // Q: Overall_Status
      budgetApprover || '',                   // R: Budget_Approver
      'Pending',                              // S: Budget_Approval_Status
      '',                                     // T: Budget_Approval_Date
      supplierApprover || '',                 // U: Supplier_Approver
      'Pending',                              // V: Supplier_Approval_Status
      '',                                     // W: Supplier_Approval_Date
      finalApprover || '',                    // X: Final_Approver
      'Pending',                              // Y: Final_Approval_Status
      '',                                     // Z: Final_Approval_Date
      JSON.stringify(productItems || []),     // AA: Product_Items_JSON
      JSON.stringify(paymentPhases || []),    // AB: Payment_Phases_JSON
      JSON.stringify(attachments || []),      // AC: Attachments_JSON
      JSON.stringify(signatures || {}),       // AD: Signatures_JSON
      now,                                    // AE: Created_Date
      now,                                    // AF: Last_Modified_Date
      'system',                               // AG: Modified_By
      '',                                     // AH: Notes
      ''                                      // AI: Rejection_Reason
    ];
    
    // Append to sheet
    dnttSheet.appendRow(rowData);
    
    Logger.log('✅ Payment request saved: ' + requestId);
    
    // Send approval emails
    sendApprovalEmails(requestId, requestBody);
    
    return createResponse(true, 'Payment request submitted successfully', {
      requestId: requestId,
      requestNumber: voucherNumber,
      status: 'Pending'
    });
    
  } catch (error) {
    Logger.log('❌ Error submitting payment request: ' + error);
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Get recent payment requests for a user
 */
function handleGetRecentPaymentRequests(requestBody) {
  try {
    const SPREADSHEET_ID = '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g';
    const SHEET_NAME = 'DNTT';
    
    const userEmail = requestBody.userEmail || Session.getActiveUser().getEmail();
    const limit = requestBody.limit || 20; // Default to 20 most recent
    
    // Open sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const dnttSheet = ss.getSheetByName(SHEET_NAME);
    
    if (!dnttSheet || dnttSheet.getLastRow() < 2) {
      return createResponse(true, 'No requests found', {
        requests: [],
        stats: { pending: 0, approved: 0, rejected: 0 }
      });
    }
    
    // Get all data (skip header row)
    const lastRow = dnttSheet.getLastRow();
    const data = dnttSheet.getRange(2, 1, lastRow - 1, 35).getValues();
    
    // Filter requests for this user (either created by them or assigned to approve)
    const userRequests = data
      .filter(row => {
        const requesterEmail = row[5]; // Column F
        const budgetApprover = row[17]; // Column R
        const supplierApprover = row[20]; // Column U
        const finalApprover = row[23]; // Column X
        
        return requesterEmail === userEmail ||
               budgetApprover === userEmail ||
               supplierApprover === userEmail ||
               finalApprover === userEmail;
      })
      .map(row => ({
        requestId: row[0],              // A: Request_ID
        requestNumber: row[1],          // B: Request_Number
        company: row[2],                // C: Company
        requestDate: row[3],            // D: Request_Date
        requesterName: row[4],          // E: Requester_Name
        requesterEmail: row[5],         // F: Requester_Email
        department: row[6],             // G: Department
        supplier: row[11],              // L: Supplier
        totalAmount: row[12],           // M: Total_Amount
        currency: row[13],              // N: Currency
        overallStatus: row[16],         // Q: Overall_Status
        budgetApprovalStatus: row[18],  // S: Budget_Approval_Status
        supplierApprovalStatus: row[21],// V: Supplier_Approval_Status
        finalApprovalStatus: row[24],   // Y: Final_Approval_Status
        createdDate: row[30],           // AE: Created_Date
        lastModifiedDate: row[31]       // AF: Last_Modified_Date
      }))
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)) // Sort by newest first
      .slice(0, limit); // Limit results
    
    // Calculate stats
    const stats = {
      pending: userRequests.filter(r => r.overallStatus === 'Pending').length,
      approved: userRequests.filter(r => r.overallStatus === 'Approved').length,
      rejected: userRequests.filter(r => r.overallStatus === 'Rejected').length
    };
    
    Logger.log('✅ Found ' + userRequests.length + ' requests for user: ' + userEmail);
    
    return createResponse(true, 'Requests retrieved successfully', {
      requests: userRequests,
      stats: stats,
      count: userRequests.length
    });
    
  } catch (error) {
    Logger.log('❌ Error getting recent requests: ' + error);
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Get detailed information for a specific request
 */
function handleGetPaymentRequestDetails(requestBody) {
  try {
    const SPREADSHEET_ID = '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g';
    const SHEET_NAME = 'DNTT';
    
    const requestId = requestBody.requestId;
    
    if (!requestId) {
      return createResponse(false, 'Request ID is required');
    }
    
    // Open sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const dnttSheet = ss.getSheetByName(SHEET_NAME);
    
    if (!dnttSheet || dnttSheet.getLastRow() < 2) {
      return createResponse(false, 'Request not found');
    }
    
    // Find the request
    const lastRow = dnttSheet.getLastRow();
    const data = dnttSheet.getRange(2, 1, lastRow - 1, 35).getValues();
    
    const requestRow = data.find(row => row[0] === requestId);
    
    if (!requestRow) {
      return createResponse(false, 'Request not found: ' + requestId);
    }
    
    // Parse JSON fields
    let productItems = [];
    let paymentPhases = [];
    let attachments = [];
    let signatures = {};
    
    try {
      productItems = JSON.parse(requestRow[26] || '[]');
      paymentPhases = JSON.parse(requestRow[27] || '[]');
      attachments = JSON.parse(requestRow[28] || '[]');
      signatures = JSON.parse(requestRow[29] || '{}');
    } catch (e) {
      Logger.log('⚠️ Error parsing JSON fields: ' + e);
    }
    
    // Build detailed response
    const requestDetails = {
      requestId: requestRow[0],
      requestNumber: requestRow[1],
      company: requestRow[2],
      requestDate: requestRow[3],
      requesterName: requestRow[4],
      requesterEmail: requestRow[5],
      department: requestRow[6],
      purchaseType: requestRow[7],
      prRequestNo: requestRow[8],
      purpose: requestRow[9],
      recipient: requestRow[10],
      supplier: requestRow[11],
      totalAmount: requestRow[12],
      currency: requestRow[13],
      paymentType: requestRow[14],
      poNumber: requestRow[15],
      overallStatus: requestRow[16],
      
      // Approval details
      budgetApprover: requestRow[17],
      budgetApprovalStatus: requestRow[18],
      budgetApprovalDate: requestRow[19],
      supplierApprover: requestRow[20],
      supplierApprovalStatus: requestRow[21],
      supplierApprovalDate: requestRow[22],
      finalApprover: requestRow[23],
      finalApprovalStatus: requestRow[24],
      finalApprovalDate: requestRow[25],
      
      // JSON data
      productItems: productItems,
      paymentPhases: paymentPhases,
      attachments: attachments,
      signatures: signatures,
      
      // Metadata
      createdDate: requestRow[30],
      lastModifiedDate: requestRow[31],
      modifiedBy: requestRow[32],
      notes: requestRow[33],
      rejectionReason: requestRow[34]
    };
    
    Logger.log('✅ Retrieved details for request: ' + requestId);
    
    return createResponse(true, 'Request details retrieved', {
      request: requestDetails
    });
    
  } catch (error) {
    Logger.log('❌ Error getting request details: ' + error);
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Send approval emails to approvers
 */
function sendApprovalEmails(requestId, requestData) {
  try {
    const approvers = [
      requestData.budgetApprover,
      requestData.supplierApprover,
      requestData.finalApprover
    ].filter(email => email && email.trim() !== '');
    
    const subject = '🔔 Đề nghị thanh toán cần phê duyệt - ' + requestData.voucherNumber;
    
    const body = `
Kính gửi,

Bạn có một đề nghị thanh toán mới cần phê duyệt:

📋 Thông tin đề nghị:
- Số đề nghị: ${requestData.voucherNumber}
- Mã yêu cầu: ${requestId}
- Công ty: ${requestData.company}
- Người đề nghị: ${requestData.employee}
- Nhà cung cấp: ${requestData.supplier}
- Tổng số tiền: ${formatCurrency(requestData.totalAmount)} ${requestData.currency}
- Mục đích: ${requestData.purpose}

🔗 Xem chi tiết và phê duyệt tại:
https://workflow.egg-ventures.com/de_nghi_thanh_toan?requestId=${requestId}

---
TLCGroup Workflow System
    `;
    
    approvers.forEach(approver => {
      try {
        GmailApp.sendEmail(approver, subject, body);
        Logger.log('✅ Sent email to: ' + approver);
      } catch (e) {
        Logger.log('❌ Failed to send email to ' + approver + ': ' + e);
      }
    });
    
  } catch (error) {
    Logger.log('❌ Error sending approval emails: ' + error);
  }
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  if (!amount) return '0';
  return Number(amount).toLocaleString('vi-VN');
}

/**
 * Helper function to create standardized response
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return response;
}
```

---

## 💻 Frontend Implementation

### **Update:** `de_nghi_thanh_toan.html`

```javascript
/**
 * Load recent payment requests
 */
async function loadRecentRequests() {
    const requestList = document.getElementById('request-list');
    const pendingCount = document.getElementById('pending-count');
    const approvedCount = document.getElementById('approved-count');
    const rejectedCount = document.getElementById('rejected-count');
    const lastRefreshTime = document.getElementById('last-refresh-time');
    
    try {
        // Show loading state
        requestList.innerHTML = '<div class="no-requests">⏳ Đang tải...</div>';
        
        // Get logged-in user email
        const userData = localStorage.getItem('tlc_current_user');
        let userEmail = '';
        if (userData) {
            try {
                const user = JSON.parse(userData);
                userEmail = user.email || '';
            } catch (e) {
                console.warn('Could not parse user data:', e);
            }
        }
        
        // Fetch recent requests from backend
        const response = await fetch(VERCEL_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'getRecentPaymentRequests',
                userEmail: userEmail,
                limit: 20
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const requests = result.data.requests || [];
            const stats = result.data.stats || { pending: 0, approved: 0, rejected: 0 };
            
            // Update stats
            pendingCount.textContent = stats.pending;
            approvedCount.textContent = stats.approved;
            rejectedCount.textContent = stats.rejected;
            
            // Render requests
            if (requests.length === 0) {
                requestList.innerHTML = '<div class="no-requests">📭 Chưa có đề nghị nào. Tạo đề nghị mới để bắt đầu!</div>';
            } else {
                requestList.innerHTML = requests.map(req => renderRequestItem(req)).join('');
            }
            
            // Update last refresh time
            const now = new Date();
            lastRefreshTime.textContent = `Cập nhật lúc ${now.toLocaleTimeString('vi-VN')}`;
            
            console.log('✅ Loaded ' + requests.length + ' requests');
        } else {
            console.error('❌ Failed to load requests:', result.message);
            requestList.innerHTML = '<div class="no-requests">❌ Lỗi khi tải danh sách: ' + result.message + '</div>';
        }
        
    } catch (error) {
        console.error('❌ Error loading recent requests:', error);
        requestList.innerHTML = '<div class="no-requests">❌ Lỗi khi tải danh sách. Vui lòng thử lại.</div>';
    }
}

/**
 * Render a single request item
 */
function renderRequestItem(request) {
    const statusClass = request.overallStatus.toLowerCase();
    const statusIcon = statusClass === 'pending' ? '⏳' : statusClass === 'approved' ? '✅' : '❌';
    const statusText = statusClass === 'pending' ? 'Chờ duyệt' : statusClass === 'approved' ? 'Đã duyệt' : 'Từ chối';
    
    const formattedAmount = Number(request.totalAmount || 0).toLocaleString('vi-VN');
    const formattedDate = new Date(request.requestDate).toLocaleDateString('vi-VN');
    
    return `
        <div class="request-item" onclick="openRequestModal('${request.requestId}')">
            <div class="request-icon ${statusClass}">
                ${statusIcon}
            </div>
            <div class="request-info">
                <div class="request-title">${request.requestNumber} - ${request.supplier}</div>
                <div class="request-meta">
                    ${request.requesterName} • ${formattedDate} • ${request.company}
                </div>
            </div>
            <div class="request-amount">
                ${formattedAmount} ${request.currency}
            </div>
            <div class="request-status ${statusClass}">
                ${statusText}
            </div>
        </div>
    `;
}

/**
 * Open request detail modal
 */
async function openRequestModal(requestId) {
    const overlay = document.getElementById('request-modal-overlay');
    const body = document.getElementById('request-modal-body');
    
    // Show modal
    overlay.classList.add('show');
    
    // Show loading
    body.innerHTML = '<div style="text-align: center; padding: 2rem; color: #94a3b8;">⏳ Đang tải chi tiết...</div>';
    
    try {
        // Fetch request details
        const response = await fetch(VERCEL_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'getPaymentRequestDetails',
                requestId: requestId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const request = result.data.request;
            body.innerHTML = renderRequestDetails(request);
        } else {
            body.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ef4444;">
                    ❌ Lỗi: ${result.message}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('❌ Error loading request details:', error);
        body.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ef4444;">
                ❌ Lỗi khi tải chi tiết: ${error.message}
            </div>
        `;
    }
}

/**
 * Render request details in modal
 */
function renderRequestDetails(request) {
    const formattedAmount = Number(request.totalAmount || 0).toLocaleString('vi-VN');
    
    return `
        <div style="padding: 1rem;">
            <h3 style="margin-bottom: 1rem; color: #1e293b;">📋 Thông tin chung</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Số đề nghị:</td>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">${request.requestNumber}</td>
                </tr>
                <tr>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Công ty:</td>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">${request.company}</td>
                </tr>
                <tr>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Người đề nghị:</td>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">${request.requesterName}</td>
                </tr>
                <tr>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Nhà cung cấp:</td>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">${request.supplier}</td>
                </tr>
                <tr>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Tổng số tiền:</td>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #3b82f6;">
                        ${formattedAmount} ${request.currency}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Trạng thái:</td>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">
                        <span class="status-indicator status-${request.overallStatus.toLowerCase()}">
                            ${request.overallStatus}
                        </span>
                    </td>
                </tr>
            </table>
            
            <h3 style="margin: 1.5rem 0 1rem; color: #1e293b;">✅ Tình trạng phê duyệt</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="padding: 0.75rem; background: #f8fafc; border-radius: 6px; border-left: 3px solid ${request.budgetApprovalStatus === 'Approved' ? '#10b981' : request.budgetApprovalStatus === 'Rejected' ? '#ef4444' : '#f59e0b'};">
                    <div style="font-weight: 600;">Phê duyệt ngân sách</div>
                    <div style="font-size: 0.875rem; color: #64748b;">
                        ${request.budgetApprover} - ${request.budgetApprovalStatus}
                    </div>
                </div>
                <div style="padding: 0.75rem; background: #f8fafc; border-radius: 6px; border-left: 3px solid ${request.supplierApprovalStatus === 'Approved' ? '#10b981' : request.supplierApprovalStatus === 'Rejected' ? '#ef4444' : '#f59e0b'};">
                    <div style="font-weight: 600;">Phê duyệt nhà cung cấp</div>
                    <div style="font-size: 0.875rem; color: #64748b;">
                        ${request.supplierApprover} - ${request.supplierApprovalStatus}
                    </div>
                </div>
                <div style="padding: 0.75rem; background: #f8fafc; border-radius: 6px; border-left: 3px solid ${request.finalApprovalStatus === 'Approved' ? '#10b981' : request.finalApprovalStatus === 'Rejected' ? '#ef4444' : '#f59e0b'};">
                    <div style="font-weight: 600;">Phê duyệt cuối cùng</div>
                    <div style="font-size: 0.875rem; color: #64748b;">
                        ${request.finalApprover} - ${request.finalApprovalStatus}
                    </div>
                </div>
            </div>
        </div>
    `;
}
```

---

## 🔄 Status Update Flow

### **When Approver Approves/Rejects:**

```javascript
/**
 * Handle approval (in PAYMENT_REQUEST_BACKEND.gs)
 */
function handleApprovePaymentRequest(requestBody) {
  try {
    const { requestId, approverEmail, approverType, signature } = requestBody;
    
    // Find request in sheet
    // Update appropriate approval status column
    // Check if all approvals are done
    // If yes, update Overall_Status to "Approved"
    // Send notification email to requester
    
    return createResponse(true, 'Request approved successfully');
    
  } catch (error) {
    return createResponse(false, 'Error: ' + error.message);
  }
}
```

---

## 📊 Summary

### **Data Flow:**

1. **Create Request** → Save to "DNTT" sheet
2. **Send Emails** → Notify approvers
3. **Approvers Act** → Update status in sheet
4. **Frontend Polls** → Auto-refresh every 30s
5. **User Sees** → Real-time status updates

### **Key Features:**

- ✅ Persistent storage in Google Sheets
- ✅ Real-time status tracking
- ✅ Multi-stage approval workflow
- ✅ Email notifications
- ✅ Auto-refresh (30s intervals)
- ✅ Detailed request view in modal
- ✅ Filter by user (requester or approver)
- ✅ Stats dashboard (Pending/Approved/Rejected)

---

**Ready to implement?** Let me know if you want me to create the complete code files! 🚀
