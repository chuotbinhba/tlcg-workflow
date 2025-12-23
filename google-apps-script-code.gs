/**
 * Google Apps Script Code cho Phiếu Thu/Chi
 * 
 * Hướng dẫn setup:
 * 1. Mở script.google.com
 * 2. Tạo project mới
 * 3. Copy toàn bộ code này vào Code.gs
 * 4. Deploy -> New deployment -> Web app
 * 5. Copy Web App URL vào file HTML
 */

/**
 * Hàm xử lý POST request từ web app
 */
function doPost(e) {
  try {
    Logger.log('=== doPost called ===');
    Logger.log('e.postData: ' + JSON.stringify(e.postData));
    Logger.log('e.parameter: ' + JSON.stringify(e.parameter));
    
    // Enable CORS
    const output = ContentService.createTextOutput();
    
    // Parse request body - try multiple methods
    let requestBody;
    
    // Method 1: Try e.postData.contents (standard POST)
    if (e.postData && e.postData.contents) {
      try {
        requestBody = JSON.parse(e.postData.contents);
        Logger.log('Parsed from e.postData.contents');
      } catch (parseError) {
        Logger.log('Error parsing e.postData.contents: ' + parseError.toString());
      }
    }
    
    // Method 2: Try e.parameter (form data or query string)
    if (!requestBody && e.parameter) {
      try {
        // If data is in parameter, it might be a string
        const dataParam = e.parameter.data || e.parameter.body;
        if (dataParam) {
          requestBody = typeof dataParam === 'string' ? JSON.parse(dataParam) : dataParam;
          Logger.log('Parsed from e.parameter');
        }
      } catch (parseError) {
        Logger.log('Error parsing e.parameter: ' + parseError.toString());
      }
    }
    
    // Method 3: Try direct e.postData (if it's already an object)
    if (!requestBody && e.postData) {
      try {
        if (typeof e.postData === 'object' && !e.postData.contents) {
          requestBody = e.postData;
          Logger.log('Using e.postData directly');
        }
      } catch (error) {
        Logger.log('Error using e.postData directly: ' + error.toString());
      }
    }
    
    if (!requestBody) {
      Logger.log('Error: Could not parse request body');
      Logger.log('e object keys: ' + Object.keys(e).join(', '));
      return createResponse(false, 'Could not parse request body. Check logs for details.');
    }
    
    Logger.log('Request body parsed successfully: ' + JSON.stringify(requestBody));
    
    const action = requestBody.action;
    let result;

    switch (action) {
      case 'sendApprovalEmail':
        result = handleSendEmail(requestBody);
        break;
      
      case 'syncToSheets':
        result = handleSyncToSheets(requestBody);
        break;
      
      case 'rejectVoucher':
        result = handleRejectVoucher(requestBody);
        break;
      
      case 'approveVoucher':
        result = handleApproveVoucher(requestBody);
        break;
      
      default:
        result = createResponse(false, 'Invalid action: ' + action);
    }
    
    // Set CORS headers
    output.setMimeType(ContentService.MimeType.JSON);
    return result;
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return createResponse(false, 'Server error: ' + error.message);
  }
}

/**
 * Hàm xử lý GET request (fallback cho approve/reject)
 */
function doGet(e) {
  try {
    Logger.log('=== doGet called ===');
    Logger.log('Full e object: ' + JSON.stringify(e));
    Logger.log('e.parameter: ' + JSON.stringify(e.parameter));
    Logger.log('e.parameter keys: ' + Object.keys(e.parameter || {}).join(', '));
    
    const action = e.parameter ? e.parameter.action : null;
    Logger.log('Action: ' + action);
    
    if (action === 'approveVoucher' || action === 'rejectVoucher') {
      // Parse data from query parameters
      let requestBody = {
        action: action,
        voucher: {}
      };
      
      if (e.parameter && e.parameter.voucherNumber) {
        requestBody.voucher.voucherNumber = e.parameter.voucherNumber || '';
        requestBody.voucher.voucherType = e.parameter.voucherType || '';
        requestBody.voucher.company = e.parameter.company || '';
        requestBody.voucher.employee = e.parameter.employee || '';
        requestBody.voucher.amount = e.parameter.amount || '';
        requestBody.voucher.requestorEmail = e.parameter.requestorEmail || '';
        requestBody.voucher.approverEmail = e.parameter.approverEmail || '';
        requestBody.voucher.approvedBy = e.parameter.approvedBy || e.parameter.approverEmail || '';
        requestBody.voucher.rejectReason = e.parameter.rejectReason || '';
        requestBody.voucher.rejectedBy = e.parameter.rejectedBy || e.parameter.approverEmail || '';
        
        Logger.log('Parsed requestorEmail: ' + requestBody.voucher.requestorEmail);
        Logger.log('Parsed approverEmail: ' + requestBody.voucher.approverEmail);
      } else {
        Logger.log('⚠️ WARNING: e.parameter.voucherNumber is missing!');
        Logger.log('Available parameters: ' + JSON.stringify(e.parameter));
      }
      
      Logger.log('Request body from GET: ' + JSON.stringify(requestBody));
      
      if (action === 'approveVoucher') {
        Logger.log('Calling handleApproveVoucher...');
        return handleApproveVoucher(requestBody);
      } else if (action === 'rejectVoucher') {
        Logger.log('Calling handleRejectVoucher...');
        return handleRejectVoucher(requestBody);
      }
    } else {
      Logger.log('Action is not approveVoucher or rejectVoucher, returning default message');
    }
    
    return ContentService.createTextOutput('Google Apps Script is running!')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return ContentService.createTextOutput('Error: ' + error.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Xử lý gửi email phê duyệt
 */
function handleSendEmail(requestBody) {
  try {
    const emailData = requestBody.email;
    const to = emailData.to;
    const cc = emailData.cc || '';
    const subject = emailData.subject;
    const body = emailData.body;

    if (!to) {
      return createResponse(false, 'Recipient email is required');
    }

    GmailApp.sendEmail(to, subject, '', {
      htmlBody: body,
      cc: cc
    });

    Logger.log('Email sent successfully to: ' + to);
    return createResponse(true, 'Email sent successfully');
  } catch (error) {
    Logger.log('Error sending email: ' + error.toString());
    return createResponse(false, 'Error sending email: ' + error.message);
  }
}

/**
 * Xử lý đồng bộ dữ liệu vào Google Sheets
 */
function handleSyncToSheets(requestBody) {
  try {
    const spreadsheetId = requestBody.spreadsheetId;
    const sheetName = requestBody.sheetName || 'Phiếu Thu Chi';
    const data = requestBody.data;

    if (!spreadsheetId) {
      return createResponse(false, 'Spreadsheet ID is required');
    }

    if (!data) {
      return createResponse(false, 'Data is required');
    }

    // Mở spreadsheet
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (error) {
      return createResponse(false, 'Cannot access spreadsheet. Please check ID and sharing permissions.');
    }

    // Lấy hoặc tạo sheet
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      // Tạo header row
      createHeaderRow(sheet);
    }

    // Ghi dữ liệu vào sheet
    writeVoucherData(sheet, data);

    Logger.log('Data synced successfully to sheet: ' + sheetName);
    return createResponse(true, 'Data synced successfully');
  } catch (error) {
    Logger.log('Error syncing to sheets: ' + error.toString());
    return createResponse(false, 'Error syncing to sheets: ' + error.message);
  }
}

/**
 * Tạo header row cho sheet
 */
function createHeaderRow(sheet) {
  const headers = [
    'Thời gian',
    'Số phiếu',
    'Loại phiếu',
    'Ngày lập',
    'Công ty',
    'Người đề nghị',
    'Bộ phận',
    'Người nộp/nhận',
    'Loại tiền',
    'Tổng số tiền',
    'Số tiền bằng chữ',
    'Lý do',
    'Người phê duyệt',
    'Trạng thái',
    'Số dòng chi tiết',
    'Chi tiết (JSON)',
    'Lịch sử phê duyệt (JSON)'
  ];

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Ghi dữ liệu phiếu vào sheet
 */
function writeVoucherData(sheet, data) {
  const row = [
    data.timestamp || new Date().toISOString(),
    data.voucherNumber || '',
    data.voucherType || '',
    data.voucherDate || '',
    data.company || '',
    data.employee || '',
    data.department || '',
    data.payeeName || '',
    data.currency || '',
    data.totalAmount || '',
    data.amountInWords || '',
    data.reason || '',
    data.approver || '',
    data.status || '',
    data.expenseItems ? data.expenseItems.length : 0,
    JSON.stringify(data.expenseItems || []),
    JSON.stringify(data.approvalHistory || [])
  ];

  // Thêm dòng mới
  const lastRow = sheet.getLastRow();
  const newRow = lastRow + 1;
  
  // Ghi dữ liệu
  sheet.getRange(newRow, 1, 1, row.length).setValues([row]);
  
  // Format số tiền
  const amountColumn = 10; // Cột tổng số tiền
  const amountCell = sheet.getRange(newRow, amountColumn);
  amountCell.setNumberFormat('#,##0');
  
  // Format ngày
  const dateColumn = 4; // Cột ngày lập
  const dateCell = sheet.getRange(newRow, dateColumn);
  if (data.voucherDate) {
    dateCell.setNumberFormat('dd/mm/yyyy');
  }
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, row.length);
  
  // Thêm conditional formatting cho trạng thái
  formatStatusColumn(sheet, newRow);
  
  // Tạo sheet chi tiết nếu có expense items
  if (data.expenseItems && data.expenseItems.length > 0) {
    createDetailSheet(spreadsheet, data.voucherNumber, data.expenseItems);
  }
}

/**
 * Format cột trạng thái với màu sắc
 */
function formatStatusColumn(sheet, row) {
  const statusColumn = 14; // Cột trạng thái
  const statusCell = sheet.getRange(row, statusColumn);
  const status = statusCell.getValue().toString().toLowerCase();
  
  if (status.includes('đã phê duyệt') || status.includes('approved')) {
    statusCell.setBackground('#e8f5e9');
    statusCell.setFontColor('#4caf50');
  } else if (status.includes('từ chối') || status.includes('rejected')) {
    statusCell.setBackground('#ffebee');
    statusCell.setFontColor('#f44336');
  } else {
    statusCell.setBackground('#fff8e1');
    statusCell.setFontColor('#ff9800');
  }
  
  statusCell.setFontWeight('bold');
  statusCell.setHorizontalAlignment('center');
}

/**
 * Tạo sheet chi tiết cho từng phiếu
 */
function createDetailSheet(spreadsheet, voucherNumber, expenseItems) {
  const detailSheetName = 'Chi tiết ' + voucherNumber;
  
  // Xóa sheet cũ nếu tồn tại
  const existingSheet = spreadsheet.getSheetByName(detailSheetName);
  if (existingSheet) {
    spreadsheet.deleteSheet(existingSheet);
  }
  
  // Tạo sheet mới
  const detailSheet = spreadsheet.insertSheet(detailSheetName);
  
  // Header
  const headers = ['STT', 'Nội dung', 'Số tiền', 'Số file đính kèm'];
  detailSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  detailSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  detailSheet.getRange(1, 1, 1, headers.length).setBackground('#4285F4');
  detailSheet.getRange(1, 1, 1, headers.length).setFontColor('#FFFFFF');
  
  // Dữ liệu
  const dataRows = expenseItems.map((item, index) => [
    index + 1,
    item.content || '',
    item.amount || 0,
    item.attachments || 0
  ]);
  
  if (dataRows.length > 0) {
    detailSheet.getRange(2, 1, dataRows.length, headers.length).setValues(dataRows);
    
    // Format số tiền
    detailSheet.getRange(2, 3, dataRows.length, 1).setNumberFormat('#,##0');
    
    // Tổng cộng
    const totalRow = dataRows.length + 2;
    detailSheet.getRange(totalRow, 2, 1, 1).setValue('TỔNG CỘNG');
    detailSheet.getRange(totalRow, 2, 1, 1).setFontWeight('bold');
    detailSheet.getRange(totalRow, 3, 1, 1).setFormula('=SUM(C2:C' + (totalRow - 1) + ')');
    detailSheet.getRange(totalRow, 3, 1, 1).setFontWeight('bold');
    detailSheet.getRange(totalRow, 3, 1, 1).setNumberFormat('#,##0');
  }
  
  // Auto-resize columns
  detailSheet.autoResizeColumns(1, headers.length);
  
  // Freeze header
  detailSheet.setFrozenRows(1);
}

/**
 * Xử lý phê duyệt phiếu
 */
function handleApproveVoucher(requestBody) {
  try {
    Logger.log('=== APPROVE VOUCHER ===');
    Logger.log('Request body: ' + JSON.stringify(requestBody));
    
    const voucher = requestBody.voucher;
    if (!voucher) {
      Logger.log('Error: voucher object is missing');
      return createResponse(false, 'Voucher data is required');
    }
    
    const voucherNumber = voucher.voucherNumber || 'N/A';
    const voucherType = voucher.voucherType || 'N/A';
    const company = voucher.company || 'N/A';
    const employee = voucher.employee || 'N/A';
    const amount = voucher.amount || 'N/A';
    const requestorEmail = voucher.requestorEmail;
    const approverEmail = voucher.approverEmail || '';
    const approvedBy = voucher.approvedBy || approverEmail;

    Logger.log('Voucher Number: ' + voucherNumber);
    Logger.log('Requestor Email: ' + requestorEmail);
    Logger.log('Approver Email: ' + approverEmail);

    if (!requestorEmail || requestorEmail.trim() === '') {
      Logger.log('Error: Requestor email is missing or empty');
      return createResponse(false, 'Requestor email is required');
    }

    // Create approval email
    const subject = `[ĐÃ PHÊ DUYỆT] Phiếu ${voucherType.toUpperCase()} - ${voucherNumber}`;
    
    const emailBodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #34A853; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">✅ Phiếu đã được phê duyệt</h2>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border: 1px solid #ddd; border-top: none;">
          <p>Kính gửi <b>${employee}</b>,</p>
          
          <p>Phiếu <b>${voucherType}</b> số <b>${voucherNumber}</b> của bạn đã được <b style="color: #34A853;">phê duyệt</b>.</p>
          
          <div style="background-color: #d4edda; border-left: 4px solid #34A853; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #155724;">Thông tin phê duyệt:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li><b>Trạng thái:</b> Đã phê duyệt</li>
              <li><b>Người phê duyệt:</b> ${approvedBy || approverEmail}</li>
              <li><b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}</li>
            </ul>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Thông tin phiếu:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><b>Số phiếu:</b> ${voucherNumber}</li>
              <li><b>Loại phiếu:</b> ${voucherType}</li>
              <li><b>Công ty:</b> ${company}</li>
              <li><b>Người đề nghị:</b> ${employee}</li>
              <li><b>Tổng số tiền:</b> ${amount}</li>
            </ul>
          </div>
          
          <p style="margin-top: 30px;">Trân trọng,<br>Hệ thống Kế toán Tự động</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; color: #666; font-size: 12px;">
          <p style="margin: 0;">Email này được gửi tự động từ hệ thống. Vui lòng không reply email này.</p>
        </div>
      </div>
    `;

    // Send email to requestor
    try {
      Logger.log('Attempting to send email to: ' + requestorEmail);
      
      const emailOptions = {
        htmlBody: emailBodyHtml
      };
      
      if (approverEmail && approverEmail.trim() !== '') {
        emailOptions.cc = approverEmail;
        Logger.log('CC to: ' + approverEmail);
      }
      
      GmailApp.sendEmail(requestorEmail, subject, '', emailOptions);
      
      Logger.log('✅ Approval email sent successfully to: ' + requestorEmail);
      return createResponse(true, 'Voucher approved and notification email sent to ' + requestorEmail);
    } catch (emailError) {
      Logger.log('❌ Error sending email: ' + emailError.toString());
      Logger.log('Error details: ' + JSON.stringify(emailError));
      return createResponse(false, 'Error sending email: ' + emailError.message);
    }
    
  } catch (error) {
    Logger.log('Error approving voucher: ' + error.toString());
    return createResponse(false, 'Error approving voucher: ' + error.message);
  }
}

/**
 * Xử lý trả lại/từ chối phiếu
 */
function handleRejectVoucher(requestBody) {
  try {
    const voucher = requestBody.voucher;
    const voucherNumber = voucher.voucherNumber;
    const voucherType = voucher.voucherType;
    const company = voucher.company;
    const employee = voucher.employee;
    const amount = voucher.amount;
    const requestorEmail = voucher.requestorEmail;
    const approverEmail = voucher.approverEmail;
    const rejectReason = voucher.rejectReason;
    const rejectedBy = voucher.rejectedBy;

    if (!requestorEmail) {
      return createResponse(false, 'Requestor email is required');
    }

    if (!rejectReason) {
      return createResponse(false, 'Reject reason is required');
    }

    // Create rejection email
    const subject = `[TRẢ LẠI] Phiếu ${voucherType.toUpperCase()} - ${voucherNumber}`;
    
    const emailBodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #EA4335; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">❌ Phiếu đã bị trả lại</h2>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border: 1px solid #ddd; border-top: none;">
          <p>Kính gửi <b>${employee}</b>,</p>
          
          <p>Phiếu <b>${voucherType}</b> số <b>${voucherNumber}</b> của bạn đã bị <b style="color: #EA4335;">trả lại</b> và cần được chỉnh sửa.</p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">Lý do trả lại:</h3>
            <p style="margin-bottom: 0; color: #856404; white-space: pre-wrap;">${rejectReason}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Thông tin phiếu:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><b>Số phiếu:</b> ${voucherNumber}</li>
              <li><b>Loại phiếu:</b> ${voucherType}</li>
              <li><b>Công ty:</b> ${company}</li>
              <li><b>Người đề nghị:</b> ${employee}</li>
              <li><b>Tổng số tiền:</b> ${amount}</li>
              <li><b>Người trả lại:</b> ${rejectedBy || approverEmail}</li>
              <li><b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}</li>
            </ul>
          </div>
          
          <p><b>Vui lòng:</b></p>
          <ol>
            <li>Xem lại lý do trả lại ở trên</li>
            <li>Chỉnh sửa phiếu theo yêu cầu</li>
            <li>Gửi lại yêu cầu phê duyệt sau khi đã sửa</li>
          </ol>
          
          <p style="margin-top: 30px;">Trân trọng,<br>Hệ thống Kế toán Tự động</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; color: #666; font-size: 12px;">
          <p style="margin: 0;">Email này được gửi tự động từ hệ thống. Vui lòng không reply email này.</p>
        </div>
      </div>
    `;

    // Send email to requestor
    GmailApp.sendEmail(requestorEmail, subject, '', {
      htmlBody: emailBodyHtml,
      cc: approverEmail || ''
    });

    Logger.log('Rejection email sent successfully to: ' + requestorEmail);
    return createResponse(true, 'Voucher rejected and notification email sent');
    
  } catch (error) {
    Logger.log('Error rejecting voucher: ' + error.toString());
    return createResponse(false, 'Error rejecting voucher: ' + error.message);
  }
}

/**
 * Tạo response JSON với CORS headers
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message
  };
  
  if (data) {
    response.data = data;
  }
  
  const output = ContentService.createTextOutput(JSON.stringify(response));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Note: Google Apps Script automatically handles CORS for Web Apps
  // But we can't set custom headers directly
  
  return output;
}

/**
 * Test function - để test các hàm riêng lẻ
 */
function testSyncToSheets() {
  const testData = {
    action: 'syncToSheets',
    spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE', // Thay bằng ID thực tế
    sheetName: 'Phiếu Thu Chi',
    data: {
      timestamp: new Date().toISOString(),
      voucherNumber: 'TL-2024-0001',
      voucherType: 'Chi',
      voucherDate: '2024-12-21',
      company: 'CÔNG TY TNHH TLCG',
      employee: 'Lê Ngân Anh',
      department: 'Ban Giám đốc',
      payeeName: 'Nguyễn Văn A',
      currency: 'VND',
      totalAmount: '1,000,000 VNĐ',
      amountInWords: 'Một triệu đồng',
      reason: 'Test sync',
      approver: 'Lê Thùy Linh',
      status: 'Chờ phê duyệt',
      expenseItems: [
        { stt: 1, content: 'Test item 1', amount: 500000, attachments: 0 },
        { stt: 2, content: 'Test item 2', amount: 500000, attachments: 1 }
      ],
      approvalHistory: []
    }
  };
  
  const result = handleSyncToSheets(testData);
  Logger.log(result.getContent());
}

