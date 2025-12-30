/**
 * GOOGLE APPS SCRIPT - PHIẾU THU CHI (BẢN FINAL CHUẨN)
 */

const USERS_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c'; 
const VOUCHER_HISTORY_SHEET_ID = '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g';
const VH_SHEET_NAME = 'Voucher_History';

function doGet(e) {
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
      case 'getVoucherSummary': return handleGetVoucherSummary();
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
    const voucher = requestBody.voucher || {};
    if (!emailData || !emailData.to) return createResponse(false, 'Thiếu người nhận');

    // Gửi email bằng GmailApp
    let options = { htmlBody: emailData.body };
    if (emailData.cc && emailData.cc.trim() !== "") options.cc = emailData.cc.trim();
    GmailApp.sendEmail(emailData.to, emailData.subject, '', options);

    const voucherNo = voucher.voucherNumber || 'AUTO-' + new Date().getTime();
    let fileLinks = "";

    // Upload files
    if (voucher.files && voucher.files.length > 0) {
      const uploaded = uploadFilesToDrive_(voucher.files, voucherNo);
      fileLinks = uploaded.map(f => f.error ? f.fileName + " (Lỗi)" : f.fileName + "\n" + f.fileUrl).join('\n\n');
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
  const v = requestBody.voucher;
  appendHistory_({ ...v, status: 'Approved', action: 'Approved', by: v.approvedBy || v.approverEmail, note: 'Duyệt qua Email', attachments: "" });
  GmailApp.sendEmail(v.requestorEmail, "[ĐÃ DUYỆT] " + v.voucherNumber, "Phiếu của bạn đã được duyệt.");
  return createResponse(true, 'Đã duyệt thành công');
}

function handleRejectVoucher(requestBody) {
  const v = requestBody.voucher;
  appendHistory_({ ...v, status: 'Rejected', action: 'Rejected', by: v.rejectedBy || v.approverEmail, note: v.rejectReason, attachments: "" });
  GmailApp.sendEmail(v.requestorEmail, "[TỪ CHỐI] " + v.voucherNumber, "Lý do: " + v.rejectReason);
  return createResponse(true, 'Đã từ chối phiếu');
}

/** 3. LOGIN & THỐNG KÊ */
function handleLogin_(requestBody) {
  const ss = SpreadsheetApp.openById(USERS_SHEET_ID);
  const data = ss.getSheetByName('Nhân viên').getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] == requestBody.email) {
      return createResponse(true, 'Thành công', { name: data[i][0], email: data[i][4], role: data[i][1] });
    }
  }
  return createResponse(false, 'Tài khoản không tồn tại');
}

function handleGetVoucherSummary() {
  const sheet = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID).getSheetByName(VH_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  return createResponse(true, 'Thành công', { total: data.length - 1 });
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
      return { fileName: file.fileName, fileUrl: f.getUrl() };
    } catch (e) { return { fileName: file.fileName, error: true }; }
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

function createResponse(success, message, data) {
  return ContentService.createTextOutput(JSON.stringify({ success, message, data })).setMimeType(ContentService.MimeType.JSON);
}

function grantPermissionFinal() {
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), "Xác nhận quyền", "Backend đã sẵn sàng!");
}