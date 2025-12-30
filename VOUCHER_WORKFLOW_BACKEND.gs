/**
 * GOOGLE APPS SCRIPT - PHIẾU THU CHI (BẢN FINAL CHUẨN)
 */

const USERS_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c'; 
const VOUCHER_HISTORY_SHEET_ID = '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g';
const VH_SHEET_NAME = 'Voucher_History';

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getVoucherSummary') {
      return handleGetVoucherSummary(e.parameter);
    } else if (action === 'getVoucherHistory') {
      return handleGetVoucherHistory(e.parameter);
    }
    
  } catch (error) {
    return createResponse(false, 'Lỗi: ' + error.message);
  }
  
  return HtmlService.createHtmlOutput("<h2>Backend đang chạy!</h2><p>Vui lòng gửi dữ liệu từ giao diện chính.</p>");
}

function doPost(e) {
  try {
    let requestBody;
    let action;

    // Parse FormData - frontend sends JSON in 'data' field as FormData
    if (e.parameter && e.parameter.data) {
      try {
        requestBody = JSON.parse(e.parameter.data);
        action = requestBody.action;
      } catch (parseError) {
        return createResponse(false, 'Lỗi parse dữ liệu: ' + parseError.message);
      }
    } else if (e.parameter && e.parameter.action) {
      action = e.parameter.action;
      requestBody = e.parameter;
    } else if (e.postData && e.postData.contents) {
      requestBody = JSON.parse(e.postData.contents);
      action = requestBody.action;
    }

    if (!action) return createResponse(false, 'Không tìm thấy action');

    switch (action) {
      case 'login': return handleLogin_(requestBody);
      case 'sendApprovalEmail': return handleSendEmail(requestBody);
      case 'approveVoucher': return handleApproveVoucher(requestBody);
      case 'rejectVoucher': return handleRejectVoucher(requestBody);
      case 'getVoucherSummary': return handleGetVoucherSummary(requestBody);
      case 'getVoucherHistory': return handleGetVoucherHistory(requestBody);
      default: return createResponse(false, 'Action không hợp lệ');
    }
  } catch (error) {
    return createResponse(false, 'Lỗi Server: ' + error.message);
  }
}

/** 1. XỬ LÝ GỬI EMAIL & SUBMIT */
function handleSendEmail(requestBody) {
  try {
    const emailData = requestBody.email;
    const requesterEmailData = requestBody.requesterEmail || null;
    const voucher = requestBody.voucher || {};
    if (!emailData || !emailData.to) return createResponse(false, 'Thiếu người nhận');

    const voucherNo = voucher.voucherNumber || 'AUTO-' + new Date().getTime();
    let fileLinks = "";

    // Upload files - deduplicate by fileName before uploading
    if (voucher.files && voucher.files.length > 0) {
      // Deduplicate files by fileName to prevent duplicate uploads
      const uniqueFiles = [];
      const seenFileNames = new Set();
      for (const file of voucher.files) {
        if (!seenFileNames.has(file.fileName)) {
          seenFileNames.add(file.fileName);
          uniqueFiles.push(file);
        }
      }
      
      if (uniqueFiles.length > 0) {
        const uploaded = uploadFilesToDrive_(uniqueFiles, voucherNo);
        fileLinks = uploaded.map(f => {
          if (f.error) {
            return f.fileName + " (Lỗi upload)";
          }
          // Format: "filename.pdf (2.45 MB)\nhttps://drive.google.com/file/..."
          const sizeMB = f.fileSize ? (f.fileSize / (1024 * 1024)).toFixed(2) + " MB" : '';
          const fileNameWithSize = sizeMB ? f.fileName + " (" + sizeMB + ")" : f.fileName;
          return fileNameWithSize + "\n" + f.fileUrl;
        }).join('\n\n');
      }
    }

    // Gửi email bằng GmailApp - to approvers
    try {
      let options = { htmlBody: emailData.body };
      if (emailData.cc && emailData.cc.trim() !== "") options.cc = emailData.cc.trim();
      GmailApp.sendEmail(emailData.to, emailData.subject, '', options);
    } catch (emailError) {
      return createResponse(false, 'Lỗi gửi email đến người phê duyệt: ' + emailError.message);
    }

    // Gửi email thông báo cho requester
    if (requesterEmailData && requesterEmailData.to && requesterEmailData.to.trim() !== '') {
      try {
        GmailApp.sendEmail(
          requesterEmailData.to,
          requesterEmailData.subject || '[THÔNG BÁO] Phiếu đã được gửi phê duyệt',
          '',
          { htmlBody: requesterEmailData.body || '' }
        );
      } catch (requesterEmailError) {
        // Log but don't fail - requester email is secondary
        Logger.log('Warning: Failed to send requester email: ' + requesterEmailError.toString());
      }
    }

    appendHistory_({
      voucherNumber: voucherNo,
      voucherType: voucher.voucherType || '',
      company: voucher.company || '',
      employee: voucher.employee || '',
      amount: voucher.amount || 0,
      status: 'Pending',
      action: 'Submit',
      by: voucher.employee || 'User',
      note: voucher.reason || '',
      requestorEmail: voucher.requestorEmail || '',
      approverEmail: emailData.to,
      attachments: fileLinks
    });

    return createResponse(true, 'Đã gửi yêu cầu phê duyệt thành công');
  } catch (error) {
    return createResponse(false, 'Lỗi gửi mail: ' + error.message);
  }
}

/** 2. PHÊ DUYỆT / TỪ CHỐI */
function handleApproveVoucher(requestBody) {
  try {
    const v = requestBody.voucher || {};
    appendHistory_({ 
      voucherNumber: v.voucherNumber || '',
      voucherType: v.voucherType || '',
      company: v.company || '',
      employee: v.employee || '',
      amount: v.amount || 0,
      status: 'Approved', 
      action: 'Approved', 
      by: v.approvedBy || v.approverEmail || '', 
      note: 'Duyệt qua Email', 
      requestorEmail: v.requestorEmail || '',
      approverEmail: v.approverEmail || '',
      attachments: "" 
    });
    
    if (v.requestorEmail) {
      GmailApp.sendEmail(v.requestorEmail, "[ĐÃ DUYỆT] " + (v.voucherNumber || ''), "Phiếu của bạn đã được duyệt.");
    }
    
    return createResponse(true, 'Đã duyệt thành công');
  } catch (error) {
    return createResponse(false, 'Lỗi: ' + error.message);
  }
}

function handleRejectVoucher(requestBody) {
  try {
    const v = requestBody.voucher || {};
    appendHistory_({ 
      voucherNumber: v.voucherNumber || '',
      voucherType: v.voucherType || '',
      company: v.company || '',
      employee: v.employee || '',
      amount: v.amount || 0,
      status: 'Rejected', 
      action: 'Rejected', 
      by: v.rejectedBy || v.approverEmail || '', 
      note: v.rejectReason || 'Từ chối', 
      requestorEmail: v.requestorEmail || '',
      approverEmail: v.approverEmail || '',
      attachments: "" 
    });
    
    if (v.requestorEmail) {
      GmailApp.sendEmail(v.requestorEmail, "[TỪ CHỐI] " + (v.voucherNumber || ''), "Lý do: " + (v.rejectReason || ''));
    }
    
    return createResponse(true, 'Đã từ chối phiếu');
  } catch (error) {
    return createResponse(false, 'Lỗi: ' + error.message);
  }
}

/** 3. LOGIN & THỐNG KÊ */
function handleLogin_(requestBody) {
  try {
    const ss = SpreadsheetApp.openById(USERS_SHEET_ID);
    const data = ss.getSheetByName('Nhân viên').getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][4] == requestBody.email) {
        return createResponse(true, 'Thành công', { name: data[i][0], email: data[i][4], role: data[i][1] });
      }
    }
    return createResponse(false, 'Tài khoản không tồn tại');
  } catch (error) {
    return createResponse(false, 'Lỗi: ' + error.message);
  }
}

function handleGetVoucherSummary(requestBody) {
  try {
    // Open spreadsheet with error handling
    let ss;
    try {
      ss = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID);
    } catch (ssError) {
      Logger.log('Error opening spreadsheet: ' + ssError.toString());
      return createResponse(false, 'Không thể truy cập Spreadsheet: ' + ssError.message);
    }
    
    if (!ss) {
      return createResponse(false, 'Không thể mở Spreadsheet với ID: ' + VOUCHER_HISTORY_SHEET_ID);
    }
    
    // Get sheet with error handling
    let sheet;
    try {
      sheet = ss.getSheetByName(VH_SHEET_NAME);
    } catch (sheetError) {
      Logger.log('Error getting sheet: ' + sheetError.toString());
      return createResponse(false, 'Không thể truy cập sheet: ' + sheetError.message);
    }
    
    if (!sheet) {
      return createResponse(false, 'Sheet "' + VH_SHEET_NAME + '" không tồn tại');
    }
    
    // Get data with error handling
    let data;
    try {
      const range = sheet.getDataRange();
      if (!range) {
        return createResponse(true, 'Thành công', {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          recent: []
        });
      }
      data = range.getValues();
    } catch (dataError) {
      Logger.log('Error getting data: ' + dataError.toString());
      return createResponse(false, 'Không thể đọc dữ liệu từ sheet: ' + dataError.message);
    }
    
    if (!data || data.length <= 1) {
      return createResponse(true, 'Thành công', {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        recent: []
      });
    }
    
    // Column structure: A=VoucherNumber, B=VoucherType, C=Company, D=Employee, E=Amount, F=Status, G=Action, H=By, I=Note, J=Attachments, K=RequestorEmail, L=ApproverEmail, M=Timestamp
    const headers = data[0];
    const rows = data.slice(1);
    
    Logger.log('Total rows in sheet (excluding header): ' + rows.length);
    
    // Get latest entry for each voucher number
    const voucherMap = new Map();
    rows.forEach(row => {
      const voucherNumber = row[0]; // Column A
      if (!voucherNumber || voucherNumber.toString().trim() === '') return; // Skip empty voucher numbers
      
      const timestamp = row[12] || new Date(0); // Column M
      // Convert timestamp to Date for comparison
      const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
      
      if (!voucherMap.has(voucherNumber)) {
        // First occurrence of this voucher number
        voucherMap.set(voucherNumber, {
          voucherNumber: voucherNumber.toString().trim(),
          voucherType: row[1] || '', // Column B
          company: row[2] || '', // Column C
          employee: row[3] || '', // Column D
          amount: row[4] || 0, // Column E
          status: row[5] || '', // Column F
          action: row[6] || '', // Column G
          by: row[7] || '', // Column H
          note: row[8] || '', // Column I
          attachments: row[9] || '', // Column J
          requestorEmail: row[10] || '', // Column K
          approverEmail: row[11] || '', // Column L
          timestamp: timestampDate
        });
      } else {
        // Compare timestamps to keep the latest one
        const existingTimestamp = voucherMap.get(voucherNumber).timestamp;
        const existingTimestampDate = existingTimestamp instanceof Date ? existingTimestamp : new Date(existingTimestamp);
        
        if (timestampDate.getTime() > existingTimestampDate.getTime()) {
          // This row is newer, replace the existing entry
          voucherMap.set(voucherNumber, {
            voucherNumber: voucherNumber.toString().trim(),
            voucherType: row[1] || '', // Column B
            company: row[2] || '', // Column C
            employee: row[3] || '', // Column D
            amount: row[4] || 0, // Column E
            status: row[5] || '', // Column F
            action: row[6] || '', // Column G
            by: row[7] || '', // Column H
            note: row[8] || '', // Column I
            attachments: row[9] || '', // Column J
            requestorEmail: row[10] || '', // Column K
            approverEmail: row[11] || '', // Column L
            timestamp: timestampDate
          });
        }
      }
    });
    
    const vouchers = Array.from(voucherMap.values());
    
    Logger.log('Total unique vouchers found: ' + vouchers.length);
    Logger.log('Voucher numbers: ' + Array.from(voucherMap.keys()).join(', '));
    
    // Sort by timestamp descending (newest first)
    vouchers.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    
    // Count by status
    const pending = vouchers.filter(v => v.status === 'Pending').length;
    const approved = vouchers.filter(v => v.status === 'Approved').length;
    const rejected = vouchers.filter(v => v.status === 'Rejected').length;
    
    Logger.log('Vouchers by status - Pending: ' + pending + ', Approved: ' + approved + ', Rejected: ' + rejected);
    
    // Get all vouchers (no limit)
    const recent = vouchers.map(v => ({
      voucherNumber: v.voucherNumber,
      voucherType: v.voucherType,
      company: v.company,
      employee: v.employee,
      amount: v.amount,
      status: v.status,
      action: v.action,
      by: v.by,
      timestamp: v.timestamp instanceof Date ? v.timestamp.toISOString() : v.timestamp,
      timestampFormatted: formatTimestamp(v.timestamp)
    }));
    
    return createResponse(true, 'Thành công', {
      total: vouchers.length,
      pending: pending,
      approved: approved,
      rejected: rejected,
      recent: recent
    });
  } catch (error) {
    return createResponse(false, 'Lỗi: ' + error.message);
  }
}

function handleGetVoucherHistory(requestBody) {
  try {
    const voucherNumber = (requestBody && requestBody.voucherNumber) || '';
    if (!voucherNumber) {
      return createResponse(false, 'Thiếu voucher number');
    }
    
    const sheet = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID).getSheetByName(VH_SHEET_NAME);
    if (!sheet) {
      return createResponse(false, 'Sheet không tồn tại');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createResponse(true, 'Thành công', []);
    }
    
    const rows = data.slice(1);
    const history = [];
    
    // Column structure: A=VoucherNumber, B=VoucherType, C=Company, D=Employee, E=Amount, F=Status, G=Action, H=By, I=Note, J=Attachments, K=RequestorEmail, L=ApproverEmail, M=Timestamp
    rows.forEach(row => {
      if (row[0] === voucherNumber) {
        history.push({
          voucherNumber: row[0] || '',
          voucherType: row[1] || '',
          company: row[2] || '',
          employee: row[3] || '',
          amount: row[4] || 0,
          status: row[5] || '',
          action: row[6] || '',
          by: row[7] || '',
          note: row[8] || '',
          attachments: row[9] || '', // Column J
          requestorEmail: row[10] || '',
          approverEmail: row[11] || '',
          timestamp: row[12] || new Date()
        });
      }
    });
    
    // Sort by timestamp descending (newest first)
    history.sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    
    return createResponse(true, 'Thành công', history);
  } catch (error) {
    return createResponse(false, 'Lỗi: ' + error.message);
  }
}

/** HÀM PHỤ TRỢ */
function uploadFilesToDrive_(files, folderName) {
  const DRIVE_FOLDER_ID = '1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG';
  const parent = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  let folder = parent.getFoldersByName(folderName).hasNext() ? parent.getFoldersByName(folderName).next() : parent.createFolder(folderName);
  return files.map(file => {
    try {
      let data = file.fileData.includes(',') ? file.fileData.split(',')[1] : file.fileData;
      const blob = Utilities.newBlob(Utilities.base64Decode(data), file.mimeType, file.fileName);
      const f = folder.createFile(blob);
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      // Return file info including size if available
      return { 
        fileName: file.fileName, 
        fileUrl: f.getUrl(),
        fileSize: file.fileSize || blob.getBytes().length // Use provided size or calculate from blob
      };
    } catch (e) { 
      return { 
        fileName: file.fileName, 
        error: true,
        fileSize: file.fileSize || 0
      }; 
    }
  });
}

function appendHistory_(entry) {
  const sheet = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID).getSheetByName(VH_SHEET_NAME);
  sheet.appendRow([
    entry.voucherNumber, entry.voucherType, entry.company || '', entry.employee,
    entry.amount, entry.status, entry.action, entry.by, entry.note,
    entry.attachments, entry.requestorEmail, entry.approverEmail, new Date()
  ]);
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function createResponse(success, message, data) {
  return ContentService.createTextOutput(JSON.stringify({ success, message, data })).setMimeType(ContentService.MimeType.JSON);
}

function grantPermissionFinal() {
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), "Xác nhận quyền", "Backend đã sẵn sàng!");
}
