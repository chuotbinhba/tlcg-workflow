/**
 * GOOGLE APPS SCRIPT - PHIẾU THU CHI
 * Handles voucher workflow: email sending, approval, file uploads to Google Drive
 */

const USERS_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c'; 
const VOUCHER_HISTORY_SHEET_ID = '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g';
const VH_SHEET_NAME = 'Voucher_History';
const DRIVE_FOLDER_ID = '1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG';

/** ===================== CẤU HÌNH WEB APP ===================== */
function doGet(e) {
  return HtmlService.createHtmlOutput("<h2>Hệ thống Backend đang chạy ổn định!</h2><p>Vui lòng sử dụng Form từ giao diện chính.</p>");
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
        Logger.log('Parsed FormData - action: ' + action);
      } catch (parseError) {
        Logger.log('Error parsing FormData: ' + parseError.toString());
        return createResponse(false, 'Lỗi parse dữ liệu: ' + parseError.message);
      }
    } else if (e.parameter && e.parameter.action) {
      // Legacy support for URL parameters
      action = e.parameter.action;
      requestBody = e.parameter;
    } else if (e.postData && e.postData.contents) {
      try {
        requestBody = JSON.parse(e.postData.contents);
        action = requestBody.action;
        Logger.log('Parsed postData - action: ' + action);
      } catch (parseError) {
        Logger.log('Error parsing postData: ' + parseError.toString());
        return createResponse(false, 'Lỗi parse dữ liệu: ' + parseError.message);
      }
    }

    if (!action) {
      Logger.log('❌ No action found in request');
      return createResponse(false, 'Không tìm thấy hành động (Action)');
    }

    Logger.log('Processing action: ' + action);

    switch (action) {
      case 'login': 
        return handleLogin_(requestBody);
      case 'sendApprovalEmail': 
        return handleSendEmail(requestBody);
      case 'approveVoucher': 
        return handleApproveVoucher(requestBody);
      case 'rejectVoucher': 
        return handleRejectVoucher(requestBody);
      case 'getVoucherSummary': 
        return handleGetVoucherSummary(requestBody);
      case 'getVoucherHistory':
        return handleGetVoucherHistory(requestBody);
      default: 
        return createResponse(false, 'Hành động không hợp lệ: ' + action);
    }
  } catch (error) {
    Logger.log('❌ doPost error: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack'));
    return createResponse(false, 'Lỗi Server: ' + error.message);
  }
}

/** ===================== 1. XỬ LÝ GỬI EMAIL ===================== */
function handleSendEmail(requestBody) {
  try {
    Logger.log('=== handleSendEmail START ===');
    Logger.log('Full requestBody keys: ' + Object.keys(requestBody).join(', '));
    
    const emailData = requestBody.email;
    const requesterEmailData = requestBody.requesterEmail || null;
    const voucher = requestBody.voucher || {};
    
    if (!emailData || !emailData.to) {
      Logger.log('❌ Missing email data or recipient');
      return createResponse(false, 'Thiếu người nhận email');
    }

    const to = emailData.to;
    const subject = emailData.subject || "Yêu cầu phê duyệt";
    const body = emailData.body || "";
    const cc = emailData.cc || "";

    Logger.log('Email TO: ' + to);
    Logger.log('Email Subject: ' + subject);
    Logger.log('Voucher Number: ' + (voucher.voucherNumber || 'NOT SET'));

    // Upload files to Google Drive and get clickable links
    const voucherNo = voucher.voucherNumber || 'AUTO-' + new Date().getTime();
    let attachmentsText = "";

    if (voucher.files && Array.isArray(voucher.files) && voucher.files.length > 0) {
      Logger.log('Uploading ' + voucher.files.length + ' files to Drive...');
      try {
        const uploadedFiles = uploadFilesToDrive_(voucher.files, voucherNo);
        Logger.log('Uploaded files: ' + uploadedFiles.length);
        
        // Format as individual clickable links for Column J (Attachments)
        // Format: "filename.pdf (2.45 MB)\nhttps://drive.google.com/file/d/.../view\n\nfilename2.jpg (1.23 MB)\nhttps://drive.google.com/file/d/.../view"
        attachmentsText = uploadedFiles.map(f => {
          if (f.error) {
            return f.fileName + " (Lỗi upload)";
          }
          const sizeMB = f.fileSize ? (f.fileSize / (1024 * 1024)).toFixed(2) : '?';
          // Create clickable link format for Google Sheets
          return f.fileName + " (" + sizeMB + " MB)\n" + f.fileUrl;
        }).join('\n\n');
        
        Logger.log('Attachments text formatted: ' + attachmentsText.substring(0, 200));
      } catch (uploadError) {
        Logger.log('❌ Error uploading files: ' + uploadError.toString());
        attachmentsText = "Lỗi khi upload files: " + uploadError.message;
      }
    } else {
      Logger.log('⚠️ No files to upload');
    }

    // Send email to approvers
    try {
      let options = { htmlBody: body };
      if (cc && cc.toString().trim() !== "") {
        options.cc = cc.trim();
      }
      GmailApp.sendEmail(to, subject, '', options);
      Logger.log('✅ Email sent to approvers: ' + to);
    } catch (emailError) {
      Logger.log('❌ Error sending email: ' + emailError.toString());
      return createResponse(false, 'Lỗi khi gửi email: ' + emailError.message);
    }

    // Send separate email to requester (if provided)
    if (requesterEmailData && requesterEmailData.to) {
      try {
        GmailApp.sendEmail(
          requesterEmailData.to, 
          requesterEmailData.subject || '[THÔNG BÁO] Phiếu đã được gửi phê duyệt',
          '',
          { htmlBody: requesterEmailData.body || '' }
        );
        Logger.log('✅ Info email sent to requester: ' + requesterEmailData.to);
      } catch (requesterEmailError) {
        Logger.log('⚠️ Warning: Failed to send requester email: ' + requesterEmailError.toString());
        // Don't fail the whole request if requester email fails
      }
    }

    // Save to Voucher_History sheet with attachments in Column J
    try {
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
        approverEmail: to,
        attachments: attachmentsText  // Column J - Google Drive clickable links
      });
      Logger.log('✅ Voucher history saved successfully');
    } catch (historyError) {
      Logger.log('❌ Error saving history: ' + historyError.toString());
      // Don't fail the whole request if history save fails, but log it
    }

    return createResponse(true, 'Đã gửi yêu cầu phê duyệt thành công');
  } catch (error) {
    Logger.log('❌ handleSendEmail error: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack'));
    return createResponse(false, 'Lỗi hệ thống: ' + error.message);
  }
}

/** ===================== 2. PHÊ DUYỆT / TỪ CHỐI ===================== */
function handleApproveVoucher(requestBody) {
  try {
    Logger.log('=== APPROVE VOUCHER ===');
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
      note: 'Đã phê duyệt qua Email',
      requestorEmail: v.requestorEmail || '',
      approverEmail: v.approverEmail || '',
      attachments: '' // No new attachments on approval
    });
    
    if (v.requestorEmail) {
      GmailApp.sendEmail(v.requestorEmail, "[ĐÃ DUYỆT] " + (v.voucherNumber || ''), "Phiếu của bạn đã được duyệt.");
    }
    
    return createResponse(true, 'Đã phê duyệt thành công');
  } catch (e) {
    Logger.log('❌ Approve error: ' + e.toString());
    return createResponse(false, e.message);
  }
}

function handleRejectVoucher(requestBody) {
  try {
    Logger.log('=== REJECT VOUCHER ===');
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
      attachments: '' // No new attachments on rejection
    });
    
    if (v.requestorEmail) {
      GmailApp.sendEmail(v.requestorEmail, "[TỪ CHỐI] " + (v.voucherNumber || ''), "Lý do: " + (v.rejectReason || ''));
    }
    
    return createResponse(true, 'Đã từ chối phiếu');
  } catch (e) {
    Logger.log('❌ Reject error: ' + e.toString());
    return createResponse(false, e.message);
  }
}

/** ===================== 3. ĐĂNG NHẬP & THỐNG KÊ ===================== */
function handleLogin_(requestBody) {
  try {
    const ss = SpreadsheetApp.openById(USERS_SHEET_ID);
    const data = ss.getSheetByName('Nhân viên').getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][4] == requestBody.email) {
        return createResponse(true, 'Thành công', { name: data[i][0], email: data[i][4], role: data[i][1] });
      }
    }
    return createResponse(false, 'Sai email hoặc mật khẩu');
  } catch (e) {
    Logger.log('❌ Login error: ' + e.toString());
    return createResponse(false, e.message);
  }
}

function handleGetVoucherSummary(requestBody) {
  try {
    const sheet = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID).getSheetByName(VH_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    return createResponse(true, 'Thành công', { total: data.length - 1 });
  } catch (e) {
    Logger.log('❌ Get summary error: ' + e.toString());
    return createResponse(false, e.message);
  }
}

function handleGetVoucherHistory(requestBody) {
  try {
    const voucherNumber = requestBody.voucherNumber || '';
    const sheet = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID).getSheetByName(VH_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const history = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === voucherNumber) {
        history.push({
          voucherNumber: data[i][0],
          voucherType: data[i][1],
          company: data[i][2],
          employee: data[i][3],
          amount: data[i][4],
          status: data[i][5],
          action: data[i][6],
          by: data[i][7],
          note: data[i][8],
          requestorEmail: data[i][9],
          approverEmail: data[i][10],
          timestamp: data[i][11],
          attachments: data[i][12] || '' // Column J (index 12) - Attachments
        });
      }
    }
    
    return createResponse(true, 'Thành công', { history: history });
  } catch (e) {
    Logger.log('❌ Get history error: ' + e.toString());
    return createResponse(false, e.message);
  }
}

/** ===================== HÀM PHỤ TRỢ ===================== */
/**
 * Upload files to Google Drive and return clickable links
 * @param {Array} files - Array of file objects with fileName, fileData (base64), mimeType, fileSize
 * @param {String} folderName - Name of folder to create/use in Drive
 * @return {Array} Array of objects with fileName, fileUrl, fileSize, or error flag
 */
function uploadFilesToDrive_(files, folderName) {
  try {
    Logger.log('=== uploadFilesToDrive_ START ===');
    Logger.log('Folder name: ' + folderName);
    Logger.log('Number of files: ' + files.length);
    
    const parent = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Create or get folder for this voucher
    let folder;
    const folders = parent.getFoldersByName(folderName);
    if (folders.hasNext()) {
      folder = folders.next();
      Logger.log('Using existing folder: ' + folderName);
    } else {
      folder = parent.createFolder(folderName);
      Logger.log('Created new folder: ' + folderName);
    }
    
    const uploadedFiles = files.map((file, index) => {
      try {
        Logger.log('Processing file ' + (index + 1) + ': ' + file.fileName);
        
        // Handle base64 data (may include data:image/png;base64, prefix)
        let base64Data = file.fileData;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        
        // Decode base64 and create blob
        const decodedData = Utilities.base64Decode(base64Data);
        const blob = Utilities.newBlob(decodedData, file.mimeType || 'application/octet-stream', file.fileName);
        
        // Upload to Drive
        const driveFile = folder.createFile(blob);
        
        // Set sharing to "Anyone with the link can view"
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // Get the file URL (clickable link)
        const fileUrl = driveFile.getUrl();
        
        Logger.log('✅ Uploaded: ' + file.fileName + ' -> ' + fileUrl);
        
        return {
          fileName: file.fileName,
          fileUrl: fileUrl,
          fileSize: file.fileSize || 0,
          fileId: driveFile.getId()
        };
      } catch (fileError) {
        Logger.log('❌ Error uploading file ' + file.fileName + ': ' + fileError.toString());
        return {
          fileName: file.fileName,
          error: true,
          errorMessage: fileError.message
        };
      }
    });
    
    Logger.log('=== uploadFilesToDrive_ COMPLETE ===');
    Logger.log('Successfully uploaded: ' + uploadedFiles.filter(f => !f.error).length + ' files');
    
    return uploadedFiles;
  } catch (error) {
    Logger.log('❌ uploadFilesToDrive_ error: ' + error.toString());
    // Return error for all files if folder access fails
    return files.map(file => ({
      fileName: file.fileName,
      error: true,
      errorMessage: error.message
    }));
  }
}

/**
 * Append voucher history entry to Voucher_History sheet
 * Column structure:
 * A: VoucherNumber
 * B: VoucherType
 * C: Company
 * D: Employee
 * E: Amount
 * F: Status
 * G: Action
 * H: By
 * I: Note
 * J: Attachments (Tài liệu đính kèm) - Google Drive clickable links
 * K: RequestorEmail
 * L: ApproverEmail
 * M: Timestamp
 */
function appendHistory_(entry) {
  try {
    Logger.log('=== appendHistory_ START ===');
    Logger.log('Voucher Number: ' + (entry.voucherNumber || 'NOT SET'));
    Logger.log('Attachments length: ' + (entry.attachments ? entry.attachments.length : 0));
    
    const sheet = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID).getSheetByName(VH_SHEET_NAME);
    
    // Ensure sheet exists
    if (!sheet) {
      throw new Error('Sheet "' + VH_SHEET_NAME + '" not found');
    }
    
    // Prepare row data in correct column order
    const rowData = [
      entry.voucherNumber || '',      // Column A
      entry.voucherType || '',        // Column B
      entry.company || '',            // Column C
      entry.employee || '',           // Column D
      entry.amount || 0,              // Column E
      entry.status || '',             // Column F
      entry.action || '',             // Column G
      entry.by || '',                 // Column H
      entry.note || '',               // Column I
      entry.attachments || '',        // Column J - Attachments (Tài liệu đính kèm) - Google Drive links
      entry.requestorEmail || '',     // Column K
      entry.approverEmail || '',      // Column L
      new Date()                      // Column M - Timestamp
    ];
    
    // Append row
    sheet.appendRow(rowData);
    
    // Set hyperlink formula for URLs in Column J (Attachments) to make them clickable
    const lastRow = sheet.getLastRow();
    const attachmentsCell = sheet.getRange(lastRow, 10); // Column J = 10
    
    if (entry.attachments && entry.attachments.trim() !== '') {
      // Try to extract URLs and create hyperlink formulas
      const urlPattern = /https:\/\/drive\.google\.com\/file\/d\/[^\s\n]+/g;
      const urls = entry.attachments.match(urlPattern);
      
      if (urls && urls.length > 0) {
        // For multiple URLs, we'll set the cell value with the formatted text
        // Google Sheets will automatically detect and make URLs clickable
        attachmentsCell.setValue(entry.attachments);
        attachmentsCell.setWrap(true); // Enable text wrapping
      } else {
        attachmentsCell.setValue(entry.attachments);
      }
    }
    
    Logger.log('✅ History appended to row ' + lastRow);
    Logger.log('=== appendHistory_ COMPLETE ===');
    
  } catch (error) {
    Logger.log('❌ appendHistory_ error: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack'));
    throw error;
  }
}

function createResponse(success, message, data) {
  const response = { success: success, message: message };
  if (data) {
    response.data = data;
  }
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function grantPermissionFinal() {
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), "Hệ thống xác nhận", "Quyền gửi mail đã được kích hoạt.");
}
