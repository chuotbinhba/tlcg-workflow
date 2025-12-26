/**
 * Google Apps Script Code cho Phiếu Thu/Chi
 *
 * KẾT HỢP:
 * - User Authentication (Login)
 * - Gửi email phê duyệt
 * - Đồng bộ Google Sheets
 * - Workflow: Submit / Approved / Rejected
 * - Ghi lịch sử vào sheet "Voucher_History" và không cho phê duyệt/từ chối 2 lần
 */

/** ===================== CẤU HÌNH ===================== */

// ⚠️ IMPORTANT: Google Sheet ID for TLCG Master Data (Users)
const USERS_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c'; // TLCG Master Data
const USERS_SHEET_NAME = 'Nhân viên'; // Sheet name: Nhân viên

const VH_SHEET_NAME = 'Voucher_History';

function getVoucherHistorySheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(VH_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(VH_SHEET_NAME);
    sheet.appendRow([
      'VoucherNumber',
      'VoucherType',
      'Company',
      'Employee',
      'Amount',
      'Status',       // Pending / Approved / Rejected
      'Action',       // Submit / Approved / Rejected
      'By',
      'Note',
      'RequestorEmail',
      'ApproverEmail',
      'Timestamp',
      'MetaJSON'
    ]);
  }
  return sheet;
}

function appendHistory_(entry) {
  const sheet = getVoucherHistorySheet_();
  const now = new Date();

  sheet.appendRow([
    entry.voucherNumber || '',
    entry.voucherType || '',
    entry.company || '',
    entry.employee || '',
    entry.amount || '',
    entry.status || '',
    entry.action || '',
    entry.by || '',
    entry.note || '',
    entry.requestorEmail || '',
    entry.approverEmail || '',
    now,
    entry.meta ? JSON.stringify(entry.meta) : ''
  ]);
}

function getLastActionForVoucher_(voucherNumber) {
  const sheet = getVoucherHistorySheet_();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;
  const header = data[0];
  const idxVoucher = header.indexOf('VoucherNumber');
  const idxAction = header.indexOf('Action');

  let lastAction = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idxVoucher] === voucherNumber) {
      lastAction = data[i][idxAction];
    }
  }
  return lastAction;
}

/** ===================== HÀM CHUNG ===================== */

function createResponse(success, message, data) {
  const response = { success, message };
  if (data) response.data = data;
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/** ===================== doPost: từ HTML ===================== */

function doPost(e) {
  try {
    Logger.log('=== doPost called ===');
    Logger.log('e.postData: ' + JSON.stringify(e.postData));
    Logger.log('e.parameter: ' + JSON.stringify(e.parameter));

    let requestBody;
    let action;

    // Check for FormData action first (e.parameter.action)
    if (e.parameter && e.parameter.action) {
      action = e.parameter.action;
      requestBody = e.parameter;
      Logger.log('Parsed action from FormData: ' + action);
    }

    // 1) e.postData.contents (JSON body)
    if (!action && e.postData && e.postData.contents) {
      try {
        requestBody = JSON.parse(e.postData.contents);
        action = requestBody.action;
        Logger.log('Parsed from e.postData.contents');
        Logger.log('Parsed requestBody keys: ' + Object.keys(requestBody).join(', '));
        if (requestBody.requesterEmail) {
          Logger.log('requesterEmail found in requestBody: ' + JSON.stringify(requestBody.requesterEmail));
        } else {
          Logger.log('⚠️ requesterEmail NOT found in requestBody');
        }
      } catch (err) {
        Logger.log('Error parsing e.postData.contents: ' + err);
      }
    }

    // 2) e.parameter.data / body (form-encoded)
    if (!action && !requestBody && e.parameter) {
      try {
        const dataParam = e.parameter.data || e.parameter.body;
        if (dataParam) {
          requestBody = typeof dataParam === 'string'
            ? JSON.parse(dataParam)
            : dataParam;
          action = requestBody.action;
          Logger.log('Parsed from e.parameter');
        }
      } catch (err) {
        Logger.log('Error parsing e.parameter: ' + err);
      }
    }

    // 3) e.postData là object
    if (!action && !requestBody && e.postData && !e.postData.contents) {
      requestBody = e.postData;
      action = requestBody.action;
      Logger.log('Using e.postData directly');
    }

    if (!action) {
      Logger.log('❌ Could not parse action from request');
      return createResponse(false, 'Could not parse action from request. Check logs.');
    }

    Logger.log('Action: ' + action);
    Logger.log('Request body: ' + JSON.stringify(requestBody));
    Logger.log('Request body type: ' + typeof requestBody);
    Logger.log('Request body keys: ' + (requestBody ? Object.keys(requestBody).join(', ') : 'null'));

    switch (action) {
      case 'login':
        return handleLogin_(requestBody);
      case 'sendApprovalEmail':
        Logger.log('=== ROUTING TO handleSendEmail ===');
        Logger.log('requestBody.email: ' + JSON.stringify(requestBody.email));
        Logger.log('requestBody.requesterEmail: ' + JSON.stringify(requestBody.requesterEmail));
        Logger.log('requestBody.voucher: ' + JSON.stringify(requestBody.voucher));
        return handleSendEmail(requestBody);
      case 'syncToSheets':
        return handleSyncToSheets(requestBody);
      case 'approveVoucher':
        Logger.log('=== ROUTING TO handleApproveVoucher ===');
        Logger.log('requestBody.voucher: ' + JSON.stringify(requestBody.voucher));
        return handleApproveVoucher(requestBody);
      case 'rejectVoucher':
        Logger.log('=== ROUTING TO handleRejectVoucher ===');
        Logger.log('requestBody.voucher: ' + JSON.stringify(requestBody.voucher));
        return handleRejectVoucher(requestBody);
      case 'getVoucherSummary':
        return handleGetVoucherSummary();
      default:
        return createResponse(false, 'Invalid action: ' + action);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createResponse(false, 'Server error: ' + error.message);
  }
}

/** ===================== doGet: fallback approve/reject ===================== */

function doGet(e) {
  try {
    Logger.log('=== doGet called ===');
    Logger.log('e.parameter: ' + JSON.stringify(e.parameter));
    Logger.log('All parameters:');
    if (e.parameter) {
      Object.keys(e.parameter).forEach(key => {
        Logger.log('  ' + key + ': ' + e.parameter[key]);
      });
    }

    const action = e.parameter ? e.parameter.action : null;
    Logger.log('Action: ' + action);

    if (action === 'approveVoucher' || action === 'rejectVoucher') {
      const voucher = {
        voucherNumber : e.parameter.voucherNumber || '',
        voucherType   : e.parameter.voucherType   || '',
        company       : e.parameter.company       || '',
        employee      : e.parameter.employee      || '',
        amount        : e.parameter.amount        || '',
        requestorEmail: e.parameter.requestorEmail|| '',
        approverEmail : e.parameter.approverEmail || '',
        approvedBy    : e.parameter.approvedBy    || e.parameter.approverEmail || '',
        rejectReason  : e.parameter.rejectReason  || '',
        rejectedBy    : e.parameter.rejectedBy    || e.parameter.approverEmail || ''
      };

      Logger.log('=== PARSED VOUCHER FROM GET ===');
      Logger.log('voucherNumber: ' + voucher.voucherNumber);
      Logger.log('requestorEmail: ' + voucher.requestorEmail);
      Logger.log('approverEmail: ' + voucher.approverEmail);
      Logger.log('Full voucher: ' + JSON.stringify(voucher));

      const requestBody = { action, voucher };
      Logger.log('Request from GET: ' + JSON.stringify(requestBody));

      if (action === 'approveVoucher') {
        Logger.log('=== CALLING handleApproveVoucher FROM GET ===');
        return handleApproveVoucher(requestBody);
      } else {
        Logger.log('=== CALLING handleRejectVoucher FROM GET ===');
        return handleRejectVoucher(requestBody);
      }
    }

    return ContentService.createTextOutput('Google Apps Script is running!')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack'));
    return ContentService.createTextOutput('Error: ' + error.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/** ===================== 1. GỬI EMAIL PHÊ DUYỆT ===================== */

function handleSendEmail(requestBody) {
  try {
    Logger.log('=== handleSendEmail START ===');
    Logger.log('Full requestBody: ' + JSON.stringify(requestBody));
    
    const emailData = requestBody.email;
    const requesterEmailData = requestBody.requesterEmail || null;
    const voucher   = requestBody.voucher || {};

    Logger.log('emailData: ' + JSON.stringify(emailData));
    Logger.log('requesterEmailData: ' + JSON.stringify(requesterEmailData));
    Logger.log('voucher: ' + JSON.stringify(voucher));

    if (!emailData) {
      Logger.log('❌ ERROR: emailData is missing');
      return createResponse(false, 'Email data is required');
    }

    const to      = emailData.to;
    const cc      = emailData.cc || '';
    const subject = emailData.subject;
    const body    = emailData.body;

    Logger.log('Email TO: ' + to);
    Logger.log('Email CC: ' + cc);
    Logger.log('Email Subject: ' + subject);

    if (!to) {
      Logger.log('❌ ERROR: Recipient email (TO) is required');
      return createResponse(false, 'Recipient email is required');
    }

    // Send email to APPROVERS (with buttons)
    try {
      GmailApp.sendEmail(to, subject, '', { htmlBody: body, cc });
      Logger.log('✅ Email sent to approvers: ' + to);
    } catch (approverEmailError) {
      Logger.log('❌ ERROR sending email to approvers: ' + approverEmailError.toString());
      return createResponse(false, 'Failed to send email to approvers: ' + approverEmailError.message);
    }
    
    // Send separate email to REQUESTER (info only, no buttons)
    // Try multiple sources for requester email
    let requesterTo = null;
    let requesterSubject = null;
    let requesterBody = null;
    
    Logger.log('=== CHECKING REQUESTER EMAIL ===');
    Logger.log('requesterEmailData: ' + JSON.stringify(requesterEmailData));
    Logger.log('voucher.requestorEmail: ' + (voucher.requestorEmail || 'NOT FOUND'));
    
    // Priority 1: requesterEmailData.to from frontend
    if (requesterEmailData && requesterEmailData.to && requesterEmailData.to.trim() !== '') {
      requesterTo = requesterEmailData.to;
      requesterSubject = requesterEmailData.subject || `[THÔNG BÁO] Phiếu ${voucher.voucherType || ''} ${voucher.voucherNumber || ''} đã được gửi phê duyệt`;
      requesterBody = requesterEmailData.body || body.replace(/<a href="[^"]*">.*?<\/a>/g, ''); // Remove buttons
      Logger.log('📧 Priority 1: Using requesterEmailData.to: ' + requesterTo);
    }
    // Priority 2: voucher.requestorEmail
    else if (voucher.requestorEmail && voucher.requestorEmail.trim() !== '') {
      requesterTo = voucher.requestorEmail;
      requesterSubject = `[THÔNG BÁO] Phiếu ${voucher.voucherType || ''} ${voucher.voucherNumber || ''} đã được gửi phê duyệt`;
      requesterBody = requesterEmailData && requesterEmailData.body ? requesterEmailData.body : body.replace(/<a href="[^"]*">.*?<\/a>/g, ''); // Remove buttons
      Logger.log('📧 Priority 2: Using voucher.requestorEmail: ' + requesterTo);
    }
    
    if (requesterTo) {
      Logger.log('📧 Sending requester notification email to: ' + requesterTo);
      Logger.log('📧 Subject: ' + requesterSubject);
      try {
        GmailApp.sendEmail(requesterTo, requesterSubject, '', { htmlBody: requesterBody });
        Logger.log('✅ Info email sent to requester: ' + requesterTo);
      } catch (emailError) {
        Logger.log('❌ ERROR sending requester email: ' + emailError.toString());
        Logger.log('Error stack: ' + emailError.stack);
        // Don't fail the whole request if requester email fails
      }
    } else {
      Logger.log('⚠️ WARNING: No requester email found. Requester will not receive notification.');
      Logger.log('⚠️ requesterEmailData: ' + JSON.stringify(requesterEmailData));
      Logger.log('⚠️ voucher.requestorEmail: ' + (voucher.requestorEmail || 'NOT SET'));
    }

    // Ghi lịch sử SUBMIT nếu có thông tin voucher
    if (voucher.voucherNumber) {
      appendHistory_({
        voucherNumber : voucher.voucherNumber,
        voucherType   : voucher.voucherType,
        company       : voucher.company,
        employee      : voucher.employee,
        amount        : voucher.amount,
        status        : 'Pending',
        action        : 'Submit',
        by            : voucher.employee,
        note          : voucher.reason || '',
        requestorEmail: voucher.requestorEmail || '',
        approverEmail : voucher.approverEmail  || '',
        meta: {
          voucherDate: voucher.voucherDate,
          department : voucher.department,
          payeeName  : voucher.payeeName
        }
      });
    }

    return createResponse(true, 'Email sent successfully');
  } catch (error) {
    Logger.log('Error sending email: ' + error.toString());
    return createResponse(false, 'Error sending email: ' + error.message);
  }
}

/** ===================== 2. SYNC TO SHEETS (GIỮ NGUYÊN) ===================== */

function handleSyncToSheets(requestBody) {
  try {
    const spreadsheetId = requestBody.spreadsheetId;
    const sheetName     = requestBody.sheetName || 'Phiếu Thu Chi';
    const data          = requestBody.data;

    if (!spreadsheetId) return createResponse(false, 'Spreadsheet ID is required');
    if (!data)          return createResponse(false, 'Data is required');

    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (error) {
      return createResponse(false, 'Cannot access spreadsheet. Check ID & sharing.');
    }

    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      createHeaderRow(sheet);
    }

    writeVoucherData(sheet, data, spreadsheet);
    Logger.log('Data synced successfully to sheet: ' + sheetName);
    return createResponse(true, 'Data synced successfully');
  } catch (error) {
    Logger.log('Error syncing to sheets: ' + error.toString());
    return createResponse(false, 'Error syncing to sheets: ' + error.message);
  }
}

function createHeaderRow(sheet) {
  const headers = [
    'Thời gian','Số phiếu','Loại phiếu','Ngày lập','Công ty','Người đề nghị',
    'Bộ phận','Người nộp/nhận','Loại tiền','Tổng số tiền','Số tiền bằng chữ',
    'Lý do','Người phê duyệt','Trạng thái','Số dòng chi tiết',
    'Chi tiết (JSON)','Lịch sử phê duyệt (JSON)'
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

function writeVoucherData(sheet, data, spreadsheet) {
  const row = [
    data.timestamp     || new Date().toISOString(),
    data.voucherNumber || '',
    data.voucherType   || '',
    data.voucherDate   || '',
    data.company       || '',
    data.employee      || '',
    data.department    || '',
    data.payeeName     || '',
    data.currency      || '',
    data.totalAmount   || '',
    data.amountInWords || '',
    data.reason        || '',
    data.approver      || '',
    data.status        || '',
    data.expenseItems ? data.expenseItems.length : 0,
    JSON.stringify(data.expenseItems || []),
    JSON.stringify(data.approvalHistory || [])
  ];

  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 1, 1, row.length).setValues([row]);

  // Format
  sheet.getRange(newRow, 10).setNumberFormat('#,##0'); // amount
  if (data.voucherDate) sheet.getRange(newRow, 4).setNumberFormat('dd/mm/yyyy');
  sheet.autoResizeColumns(1, row.length);

  formatStatusColumn(sheet, newRow);

  if (data.expenseItems && data.expenseItems.length > 0 && spreadsheet) {
    createDetailSheet(spreadsheet, data.voucherNumber, data.expenseItems);
  }
}

function formatStatusColumn(sheet, row) {
  const statusCell = sheet.getRange(row, 14);
  const status = statusCell.getValue().toString().toLowerCase();

  if (status.includes('đã phê duyệt') || status.includes('approved')) {
    statusCell.setBackground('#e8f5e9').setFontColor('#4caf50');
  } else if (status.includes('từ chối') || status.includes('rejected')) {
    statusCell.setBackground('#ffebee').setFontColor('#f44336');
  } else {
    statusCell.setBackground('#fff8e1').setFontColor('#ff9800');
  }
  statusCell.setFontWeight('bold').setHorizontalAlignment('center');
}

function createDetailSheet(spreadsheet, voucherNumber, expenseItems) {
  const detailSheetName = 'Chi tiết ' + voucherNumber;
  const existing = spreadsheet.getSheetByName(detailSheetName);
  if (existing) spreadsheet.deleteSheet(existing);

  const detailSheet = spreadsheet.insertSheet(detailSheetName);
  const headers = ['STT','Nội dung','Số tiền','Số file đính kèm'];
  detailSheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#4285F4').setFontColor('#FFFFFF');

  const rows = expenseItems.map((item, i) => [
    i + 1,
    item.content || '',
    item.amount  || 0,
    item.attachments || 0
  ]);

  if (rows.length) {
    detailSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    detailSheet.getRange(2, 3, rows.length, 1).setNumberFormat('#,##0');

    const totalRow = rows.length + 2;
    detailSheet.getRange(totalRow, 2).setValue('TỔNG CỘNG').setFontWeight('bold');
    detailSheet.getRange(totalRow, 3).setFormula(`=SUM(C2:C${totalRow - 1})`)
      .setFontWeight('bold').setNumberFormat('#,##0');
  }

  detailSheet.autoResizeColumns(1, headers.length);
  detailSheet.setFrozenRows(1);
}

/** ===================== 3. APPROVE VOUCHER ===================== */

function handleApproveVoucher(requestBody) {
  try {
    Logger.log('=== APPROVE VOUCHER ===');
    Logger.log('Request body: ' + JSON.stringify(requestBody));
    const voucher = requestBody.voucher;
    if (!voucher) {
      Logger.log('❌ ERROR: No voucher data in request body');
      return createResponse(false, 'Voucher data is required');
    }

    const voucherNumber  = voucher.voucherNumber || '';
    const voucherType    = voucher.voucherType   || '';
    const company        = voucher.company       || '';
    const employee       = voucher.employee      || '';
    const amount         = voucher.amount        || '';
    const requestorEmail = voucher.requestorEmail|| '';
    const approverEmail  = voucher.approverEmail || '';
    const approvedBy     = voucher.approvedBy    || approverEmail || 'Unknown';

    Logger.log('Voucher Number: ' + voucherNumber);
    Logger.log('Requestor Email: ' + requestorEmail);
    Logger.log('Approver Email: ' + approverEmail);
    Logger.log('Approved By: ' + approvedBy);

    if (!voucherNumber) {
      Logger.log('❌ ERROR: voucherNumber is required');
      return createResponse(false, 'voucherNumber is required');
    }
    if (!requestorEmail || requestorEmail.trim() === '') {
      Logger.log('❌ ERROR: Requestor email is required but empty');
      return createResponse(false, 'Requestor email is required');
    }

    const lastAction = getLastActionForVoucher_(voucherNumber);
    Logger.log('Last action for voucher: ' + lastAction);
    if (lastAction === 'Approved' || lastAction === 'Rejected') {
      Logger.log('⚠️ Voucher already processed: ' + lastAction);
      return createResponse(false, 'Voucher already processed: ' + lastAction);
    }

    appendHistory_({
      voucherNumber,
      voucherType,
      company,
      employee,
      amount,
      status: 'Approved',
      action: 'Approved',
      by: approvedBy || approverEmail || 'Unknown',
      note: '',
      requestorEmail,
      approverEmail
    });
    Logger.log('✅ History appended');

    const subject = `[ĐÃ PHÊ DUYỆT] Phiếu ${voucherType.toUpperCase()} - ${voucherNumber}`;
    const emailBodyHtml = [
      `<p>Kính gửi <b>${employee}</b>,</p>`,
      `<p>Phiếu <b>${voucherType}</b> số <b>${voucherNumber}</b> của bạn đã được <b style="color:#34A853;">phê duyệt</b>.</p>`,
      `<p><b>Công ty:</b> ${company}<br><b>Tổng số tiền:</b> ${amount}<br><b>Người phê duyệt:</b> ${approvedBy || approverEmail}</p>`,
      `<p>Trân trọng,<br>Hệ thống Kế toán Tự động</p>`
    ].join('');

    Logger.log('📧 Preparing to send approval notification email');
    Logger.log('📧 To: ' + requestorEmail);
    Logger.log('📧 Subject: ' + subject);

    const options = { htmlBody: emailBodyHtml };
    if (approverEmail && approverEmail.trim() !== '') {
      options.cc = approverEmail;
      Logger.log('📧 CC: ' + approverEmail);
    }
    
    try {
      GmailApp.sendEmail(requestorEmail, subject, '', options);
      Logger.log('✅ Approval notification email sent successfully to: ' + requestorEmail);
      return createResponse(true, 'Voucher approved and email sent to ' + requestorEmail);
    } catch (emailError) {
      Logger.log('❌ ERROR sending approval email: ' + emailError.toString());
      Logger.log('Error name: ' + emailError.name);
      Logger.log('Error message: ' + emailError.message);
      Logger.log('Error stack: ' + (emailError.stack || 'No stack'));
      return createResponse(false, 'Voucher approved but failed to send email: ' + emailError.message);
    }
  } catch (error) {
    Logger.log('Error approving voucher: ' + error.toString());
    return createResponse(false, 'Error approving voucher: ' + error.message);
  }
}

/** ===================== 4. REJECT VOUCHER ===================== */

function handleRejectVoucher(requestBody) {
  try {
    Logger.log('=== REJECT VOUCHER ===');
    Logger.log('Request body: ' + JSON.stringify(requestBody));
    const voucher = requestBody.voucher;
    if (!voucher) {
      Logger.log('❌ ERROR: No voucher data in request body');
      return createResponse(false, 'Voucher data is required');
    }

    const voucherNumber  = voucher.voucherNumber || '';
    const voucherType    = voucher.voucherType   || '';
    const company        = voucher.company       || '';
    const employee       = voucher.employee      || '';
    const amount         = voucher.amount        || '';
    const requestorEmail = voucher.requestorEmail|| '';
    const approverEmail  = voucher.approverEmail || '';
    const rejectReason   = voucher.rejectReason  || '';
    const rejectedBy     = voucher.rejectedBy    || approverEmail || 'Unknown';

    Logger.log('Voucher Number: ' + voucherNumber);
    Logger.log('Requestor Email: ' + requestorEmail);
    Logger.log('Approver Email: ' + approverEmail);
    Logger.log('Reject Reason: ' + rejectReason);
    Logger.log('Rejected By: ' + rejectedBy);

    if (!voucherNumber) {
      Logger.log('❌ ERROR: voucherNumber is required');
      return createResponse(false, 'voucherNumber is required');
    }
    if (!requestorEmail || requestorEmail.trim() === '') {
      Logger.log('❌ ERROR: Requestor email is required but empty');
      return createResponse(false, 'Requestor email is required');
    }
    if (!rejectReason || rejectReason.trim() === '') {
      Logger.log('❌ ERROR: Reject reason is required but empty');
      return createResponse(false, 'Reject reason is required');
    }

    const lastAction = getLastActionForVoucher_(voucherNumber);
    Logger.log('Last action for voucher: ' + lastAction);
    if (lastAction === 'Approved' || lastAction === 'Rejected') {
      Logger.log('⚠️ Voucher already processed: ' + lastAction);
      return createResponse(false, 'Voucher already processed: ' + lastAction);
    }

    appendHistory_({
      voucherNumber,
      voucherType,
      company,
      employee,
      amount,
      status: 'Rejected',
      action: 'Rejected',
      by: rejectedBy || approverEmail || 'Unknown',
      note: rejectReason,
      requestorEmail,
      approverEmail
    });
    Logger.log('✅ History appended');

    const subject = `[TRẢ LẠI] Phiếu ${voucherType.toUpperCase()} - ${voucherNumber}`;
    const emailBodyHtml = [
      `<p>Kính gửi <b>${employee}</b>,</p>`,
      `<p>Phiếu <b>${voucherType}</b> số <b>${voucherNumber}</b> của bạn đã bị <b style="color:#EA4335;">trả lại / từ chối</b>.</p>`,
      `<p><b>Lý do:</b> ${rejectReason}</p>`,
      `<p><b>Công ty:</b> ${company}<br><b>Tổng số tiền:</b> ${amount}<br><b>Người trả lại:</b> ${rejectedBy}</p>`,
      `<p>Vui lòng chỉnh sửa và gửi lại nếu cần.</p>`,
      `<p>Trân trọng,<br>Hệ thống Kế toán Tự động</p>`
    ].join('');

    Logger.log('📧 Preparing to send rejection notification email');
    Logger.log('📧 To: ' + requestorEmail);
    Logger.log('📧 Subject: ' + subject);

    const options = {
      htmlBody: emailBodyHtml
    };
    if (approverEmail && approverEmail.trim() !== '') {
      options.cc = approverEmail;
      Logger.log('📧 CC: ' + approverEmail);
    }
    
    try {
      GmailApp.sendEmail(requestorEmail, subject, '', options);
      Logger.log('✅ Rejection notification email sent successfully to: ' + requestorEmail);
      return createResponse(true, 'Voucher rejected and email sent to ' + requestorEmail);
    } catch (emailError) {
      Logger.log('❌ ERROR sending rejection email: ' + emailError.toString());
      Logger.log('Error name: ' + emailError.name);
      Logger.log('Error message: ' + emailError.message);
      Logger.log('Error stack: ' + (emailError.stack || 'No stack'));
      return createResponse(false, 'Voucher rejected but failed to send email: ' + emailError.message);
    }
  } catch (error) {
    Logger.log('Error rejecting voucher: ' + error.toString());
    return createResponse(false, 'Error rejecting voucher: ' + error.message);
  }
}

/** ===================== GET VOUCHER SUMMARY ===================== */

function handleGetVoucherSummary() {
  try {
    Logger.log('=== GET VOUCHER SUMMARY ===');
    
    const sheet = getVoucherHistorySheet_();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      // Only header row, no data
      return createResponse(true, 'No vouchers found', {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        recent: []
      });
    }
    
    // Skip header row
    const rows = data.slice(1);
    
    // Column indices (based on appendHistory_ function)
    const idxVoucherNumber = 0;
    const idxVoucherType = 1;
    const idxCompany = 2;
    const idxEmployee = 3;
    const idxAmount = 4;
    const idxStatus = 5;
    const idxAction = 6;
    const idxBy = 7;
    const idxNote = 8;
    const idxRequestorEmail = 9;
    const idxApproverEmail = 10;
    const idxTimestamp = 11;
    
    // Get unique vouchers (by voucher number)
    const voucherMap = new Map();
    
    rows.forEach(row => {
      const voucherNumber = row[idxVoucherNumber];
      if (!voucherNumber) return;
      
      // Keep the latest entry for each voucher
      if (!voucherMap.has(voucherNumber) || 
          new Date(row[idxTimestamp] || 0) > new Date(voucherMap.get(voucherNumber)[idxTimestamp] || 0)) {
        voucherMap.set(voucherNumber, row);
      }
    });
    
    // Calculate statistics
    let total = voucherMap.size;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    
    voucherMap.forEach(row => {
      const status = row[idxStatus];
      if (status === 'Pending') pending++;
      else if (status === 'Approved') approved++;
      else if (status === 'Rejected') rejected++;
    });
    
    // Get recent vouchers (last 10 entries, sorted by timestamp)
    const recentRows = rows
      .filter(row => row[idxTimestamp])
      .sort((a, b) => {
        const dateA = new Date(a[idxTimestamp] || 0);
        const dateB = new Date(b[idxTimestamp] || 0);
        return dateB - dateA; // Descending order (newest first)
      })
      .slice(0, 10)
      .map(row => {
        // Get the latest status for this voucher
        const voucherNumber = row[idxVoucherNumber];
        const latestRow = voucherMap.get(voucherNumber);
        
        return {
          voucherNumber: voucherNumber || '',
          voucherType: latestRow[idxVoucherType] || '',
          company: latestRow[idxCompany] || '',
          employee: latestRow[idxEmployee] || '',
          amount: latestRow[idxAmount] || 0,
          status: latestRow[idxStatus] || 'Pending',
          action: row[idxAction] || '',
          by: row[idxBy] || '',
          note: row[idxNote] || '',
          timestamp: formatTimestamp(row[idxTimestamp])
        };
      });
    
    const summary = {
      total: total,
      pending: pending,
      approved: approved,
      rejected: rejected,
      recent: recentRows
    };
    
    Logger.log('Summary: ' + JSON.stringify(summary));
    
    return createResponse(true, 'Summary retrieved successfully', summary);
  } catch (error) {
    Logger.log('Error getting voucher summary: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createResponse(false, 'Error getting summary: ' + error.message);
  }
}

function formatTimestamp(dateValue) {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  } catch (e) {
    return String(dateValue);
  }
}

/** ===================== AUTHENTICATION FUNCTIONS ===================== */

/**
 * Hash password using SHA-256
 */
function hashPassword_(password) {
  try {
    if (!password || password === null || password === undefined) {
      throw new Error('Password cannot be null or undefined');
    }
    
    const passwordString = password.toString().trim();
    if (passwordString === '') {
      throw new Error('Password cannot be empty');
    }
    
    const rawHash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      passwordString,
      Utilities.Charset.UTF_8
    );
    
    const hashString = rawHash.map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
    
    return hashString;
  } catch (error) {
    Logger.log('Hash error: ' + error.toString());
    throw error;
  }
}

/**
 * Authenticate user with email and password
 */
function authenticateUser_(email, password) {
  try {
    Logger.log('=== AUTHENTICATE USER ===');
    Logger.log('Email: ' + email);
    
    const spreadsheet = SpreadsheetApp.openById(USERS_SHEET_ID);
    let sheet = spreadsheet.getSheetByName(USERS_SHEET_NAME);
    if (!sheet) {
      const sheets = spreadsheet.getSheets();
      sheet = sheets[0];
      Logger.log('Sheet name not found, using first sheet');
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return { success: false, message: 'No users configured' };
    }
    
    const headers = data[0];
    
    // Find columns
    let emailCol = headers.indexOf('Email');
    if (emailCol === -1) emailCol = headers.indexOf('email');
    if (emailCol === -1) emailCol = 4; // Column E
    
    let passwordCol = headers.indexOf('Password');
    if (passwordCol === -1) passwordCol = headers.indexOf('password');
    if (passwordCol === -1) {
      if (headers.length > 10 && data.length > 1 && data[1][10]) {
        passwordCol = 10; // Column K
      } else if (headers.length > 9 && data.length > 1 && data[1][9]) {
        passwordCol = 9; // Column J
      } else {
        passwordCol = 10; // Default to Column K
      }
    }
    
    let nameCol = headers.indexOf('Họ và tên');
    if (nameCol === -1) nameCol = headers.indexOf('name');
    if (nameCol === -1) nameCol = 0; // Column A
    
    let roleCol = headers.indexOf('Chức vụ');
    if (roleCol === -1) roleCol = headers.indexOf('Role');
    if (roleCol === -1) roleCol = headers.indexOf('role');
    if (roleCol === -1) roleCol = 1; // Column B
    
    let isAdminCol = headers.indexOf('isAdmin');
    if (isAdminCol === -1) isAdminCol = headers.indexOf('IsAdmin');
    if (isAdminCol === -1) isAdminCol = 9; // Column J
    
    let employeeIdCol = headers.indexOf('EmployeeId');
    if (employeeIdCol === -1) employeeIdCol = headers.indexOf('employeeId');
    if (employeeIdCol === -1) employeeIdCol = headers.indexOf('Employee ID');
    if (employeeIdCol === -1) employeeIdCol = 7; // Column H
    
    let departmentCol = headers.indexOf('Phòng ban');
    if (departmentCol === -1) departmentCol = headers.indexOf('department');
    if (departmentCol === -1) departmentCol = 2; // Column C
    
    let companyCol = headers.indexOf('Công ty');
    if (companyCol === -1) companyCol = headers.indexOf('company');
    if (companyCol === -1) companyCol = 3; // Column D
    
    let phoneCol = headers.indexOf('Điện thoại');
    if (phoneCol === -1) phoneCol = headers.indexOf('phone');
    if (phoneCol === -1) phoneCol = 5; // Column F
    
    let statusCol = headers.indexOf('Status');
    if (statusCol === -1) statusCol = headers.indexOf('status');
    if (statusCol === -1) statusCol = 6; // Column G
    
    if (emailCol === -1) {
      return { success: false, message: 'Database configuration error: Email column not found' };
    }
    
    if (!password || password.toString().trim() === '') {
      return { success: false, message: 'Password is required' };
    }
    
    const hashedPassword = hashPassword_(password);
    
    // Search for user
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowEmail = row[emailCol];
      
      if (!rowEmail || rowEmail.toString().trim() === '') {
        continue;
      }
      
      const rowPassword = passwordCol >= 0 ? row[passwordCol] : '';
      const rowStatus = statusCol >= 0 ? row[statusCol] : 'Active';
      
      if (rowEmail.toString().toLowerCase().trim() === email.toLowerCase().trim()) {
        Logger.log('Found user: ' + rowEmail);
        
        if (rowStatus && rowStatus.toString().toLowerCase() !== 'active') {
          return { success: false, message: 'Account is inactive' };
        }
        
        if (passwordCol < 0 || !rowPassword || rowPassword.toString().trim() === '') {
          return { success: false, message: 'Password not configured for this user. Please contact administrator.' };
        }
        
        const storedPassword = rowPassword.toString().trim();
        
        if (storedPassword === hashedPassword) {
          Logger.log('Password match! Authentication successful');
          
          const userName = nameCol >= 0 && row[nameCol] ? row[nameCol].toString().trim() : 'User';
          const userRole = roleCol >= 0 && row[roleCol] ? row[roleCol].toString().trim() : 'User';
          
          let userEmployeeId = '';
          if (employeeIdCol >= 0 && employeeIdCol < row.length) {
            const employeeIdValue = row[employeeIdCol];
            if (employeeIdValue !== null && employeeIdValue !== undefined && employeeIdValue !== '') {
              userEmployeeId = employeeIdValue.toString().trim();
            }
          }
          
          const userDepartment = departmentCol >= 0 && row[departmentCol] ? row[departmentCol].toString().trim() : '';
          
          let userCompany = '';
          if (companyCol >= 0 && row[companyCol]) {
            userCompany = row[companyCol].toString().trim();
          } else {
            userCompany = row[3] ? row[3].toString().trim() : '';
          }
          
          const userPhone = phoneCol >= 0 && row[phoneCol] ? row[phoneCol].toString().trim() : '';
          
          return {
            success: true,
            user: {
              email: rowEmail.toString().trim(),
              name: userName,
              role: userRole,
              isAdmin: isAdminCol >= 0 ? (row[isAdminCol] === true || row[isAdminCol] === 'TRUE' || row[isAdminCol] === 'true' || row[isAdminCol] === 'True') : false,
              employeeId: userEmployeeId,
              department: userDepartment,
              company: userCompany,
              phone: userPhone
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
 * Handle login request from frontend
 */
function handleLogin_(requestBody) {
  try {
    Logger.log('=== HANDLE LOGIN ===');
    Logger.log('Request body: ' + JSON.stringify(requestBody));
    
    const email = requestBody.email;
    const password = requestBody.password;
    
    Logger.log('Email: ' + email);
    Logger.log('Password: ' + (password ? '***' : 'NULL/UNDEFINED'));
    
    if (!email || email.toString().trim() === '') {
      return createResponse(false, 'Email is required');
    }
    
    if (!password || password.toString().trim() === '') {
      return createResponse(false, 'Password is required');
    }
    
    const authResult = authenticateUser_(email, password);
    
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



