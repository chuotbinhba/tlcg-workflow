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

// ⚠️ IMPORTANT: Google Sheet ID for Voucher History (same as USERS_SHEET_ID or separate)
const VOUCHER_HISTORY_SHEET_ID = '1-1Q75iKeoRAGO4p7U-1IAOp9jqx77HrxF6WUxuUuT_c'; // Use same spreadsheet as users
const VH_SHEET_NAME = 'Voucher_History';

/**
 * Debug logging function - writes to a Debug_Log sheet
 */
function debugLog_(message) {
  try {
    const ss = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID);
    let debugSheet = ss.getSheetByName('Debug_Log');
    if (!debugSheet) {
      debugSheet = ss.insertSheet('Debug_Log');
      debugSheet.appendRow(['Timestamp', 'Message']);
    }
    debugSheet.appendRow([new Date().toLocaleString('vi-VN'), message]);
  } catch (e) {
    // Ignore errors in debug logging
  }
}

function getVoucherHistorySheet_() {
  try {
    // Use SpreadsheetApp.openById instead of getActiveSpreadsheet for Web App
    const ss = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID);
    if (!ss) {
      Logger.log('❌ ERROR: Cannot open spreadsheet with ID: ' + VOUCHER_HISTORY_SHEET_ID);
      throw new Error('Cannot open spreadsheet. Please check VOUCHER_HISTORY_SHEET_ID.');
    }
    
    let sheet = ss.getSheetByName(VH_SHEET_NAME);
    if (!sheet) {
      Logger.log('Sheet "' + VH_SHEET_NAME + '" not found, creating new sheet...');
      sheet = ss.insertSheet(VH_SHEET_NAME);
      setupVoucherHistorySheet_(sheet);
      Logger.log('✅ Created new sheet: ' + VH_SHEET_NAME);
    } else {
      // Check if headers exist, if not, setup
      const headers = sheet.getRange(1, 1, 1, 13).getValues()[0];
      if (!headers[0] || headers[0] !== 'VoucherNumber') {
        Logger.log('Headers not found or incorrect, setting up...');
        setupVoucherHistorySheet_(sheet);
      }
    }
    return sheet;
  } catch (error) {
    Logger.log('❌ ERROR in getVoucherHistorySheet_: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * Setup Voucher_History sheet with headers and formatting
 * This function can be called manually to setup/refresh the sheet
 */
function setupVoucherHistorySheet_(sheet) {
  try {
    // Clear existing data if any
    sheet.clear();
    
    // Headers
    const headers = [
      'VoucherNumber',
      'VoucherType',
      'Company',
      'Employee',
      'Amount',
      'Status',       // Pending / Approved / Rejected
      'Action',       // Submit / Approved / Rejected
      'By',
      'Note',
      'Attachments',  // Column J - Google Drive links
      'RequestorEmail',
      'ApproverEmail',
      'Timestamp',
      'MetaJSON'
    ];
    
    // Set headers in row 1
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    
    // Format headers
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285F4'); // Google Blue
    headerRange.setFontColor('#FFFFFF');   // White
    headerRange.setHorizontalAlignment('center');
    
    // Set column widths
    sheet.setColumnWidth(1, 150);  // VoucherNumber
    sheet.setColumnWidth(2, 100);  // VoucherType
    sheet.setColumnWidth(3, 250);  // Company
    sheet.setColumnWidth(4, 180);  // Employee
    sheet.setColumnWidth(5, 120);  // Amount
    sheet.setColumnWidth(6, 100);  // Status
    sheet.setColumnWidth(7, 100);  // Action
    sheet.setColumnWidth(8, 180);  // By
    sheet.setColumnWidth(9, 200);  // Note
    sheet.setColumnWidth(10, 400); // Attachments
    sheet.setColumnWidth(11, 220); // RequestorEmail
    sheet.setColumnWidth(12, 220); // ApproverEmail
    sheet.setColumnWidth(13, 180); // Timestamp
    sheet.setColumnWidth(14, 300); // MetaJSON
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    // Set number format for Amount column (E)
    sheet.getRange('E:E').setNumberFormat('#,##0');
    
    // Set date format for Timestamp column (L)
    sheet.getRange('L:L').setNumberFormat('dd/mm/yyyy HH:mm');
    
    // Add conditional formatting for Status column (F)
    const statusRange = sheet.getRange('F:F');
    
    // Pending - Yellow
    const pendingRule = SpreadsheetApp.newConditionalFormatRule()
      .setRanges([statusRange])
      .whenTextEqualTo('Pending')
      .setBackground('#FFF8E1') // Light Yellow
      .setFontColor('#F57C00')   // Dark Orange
      .build();
    
    // Approved - Green
    const approvedRule = SpreadsheetApp.newConditionalFormatRule()
      .setRanges([statusRange])
      .whenTextEqualTo('Approved')
      .setBackground('#E8F5E9') // Light Green
      .setFontColor('#2E7D32')  // Dark Green
      .build();
    
    // Rejected - Red
    const rejectedRule = SpreadsheetApp.newConditionalFormatRule()
      .setRanges([statusRange])
      .whenTextEqualTo('Rejected')
      .setBackground('#FFEBEE') // Light Red
      .setFontColor('#C62828')   // Dark Red
      .build();
    
    const rules = sheet.getConditionalFormatRules();
    rules.push(pendingRule, approvedRule, rejectedRule);
    sheet.setConditionalFormatRules(rules);
    
    Logger.log('✅ Voucher_History sheet setup completed');
  } catch (error) {
    Logger.log('❌ ERROR setting up Voucher_History sheet: ' + error.toString());
    throw error;
  }
}

/**
 * Manual function to setup/refresh Voucher_History sheet
 * Run this function from Apps Script editor to setup the sheet
 */
function setupVoucherHistorySheet() {
  try {
    const ss = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID);
    let sheet = ss.getSheetByName(VH_SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(VH_SHEET_NAME);
      Logger.log('Created new sheet: ' + VH_SHEET_NAME);
    }
    
    setupVoucherHistorySheet_(sheet);
    Logger.log('✅ Voucher_History sheet setup completed successfully!');
    return 'Setup completed!';
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return 'Error: ' + error.message;
  }
}

/**
 * Test function to verify appendHistory_ works
 * Run this from Apps Script editor to test
 */
function testAppendHistory() {
  try {
    Logger.log('=== TEST APPEND HISTORY START ===');
    
    const testEntry = {
      voucherNumber: 'TEST-' + new Date().getTime(),
      voucherType: 'Chi',
      company: 'TEST COMPANY',
      employee: 'Test Employee',
      amount: '1000000',
      status: 'Pending',
      action: 'Submit',
      by: 'Test Employee',
      note: 'Test note from testAppendHistory function',
      requestorEmail: 'test@example.com',
      approverEmail: 'approver@example.com',
      meta: {
        voucherDate: new Date().toISOString().split('T')[0],
        department: 'Test Department',
        payeeName: 'Test Payee'
      }
    };
    
    Logger.log('Test entry: ' + JSON.stringify(testEntry));
    
    appendHistory_(testEntry);
    
    Logger.log('✅ TEST APPEND HISTORY SUCCESS');
    return 'Test completed successfully! Check logs and sheet.';
  } catch (error) {
    Logger.log('❌ TEST APPEND HISTORY FAILED: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack'));
    return 'Test failed: ' + error.message;
  }
}

/**
 * Test function to check if sheet exists and is accessible
 * Run this from Apps Script editor to test
 */
function testVoucherHistorySheet() {
  try {
    Logger.log('=== TEST VOUCHER HISTORY SHEET START ===');
    Logger.log('VOUCHER_HISTORY_SHEET_ID: ' + VOUCHER_HISTORY_SHEET_ID);
    Logger.log('VH_SHEET_NAME: ' + VH_SHEET_NAME);
    
    const ss = SpreadsheetApp.openById(VOUCHER_HISTORY_SHEET_ID);
    Logger.log('✅ Spreadsheet opened successfully');
    Logger.log('Spreadsheet name: ' + ss.getName());
    
    let sheet = ss.getSheetByName(VH_SHEET_NAME);
    if (!sheet) {
      Logger.log('⚠️ Sheet "' + VH_SHEET_NAME + '" not found');
      Logger.log('Available sheets: ' + ss.getSheets().map(s => s.getName()).join(', '));
      return 'Sheet not found. Run setupVoucherHistorySheet() first.';
    }
    
    Logger.log('✅ Sheet found: ' + sheet.getName());
    Logger.log('Sheet last row: ' + sheet.getLastRow());
    Logger.log('Sheet last column: ' + sheet.getLastColumn());
    
    if (sheet.getLastRow() > 0) {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      Logger.log('Headers: ' + headers.join(', '));
      
      if (sheet.getLastRow() > 1) {
        const lastRow = sheet.getRange(sheet.getLastRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
        Logger.log('Last row data: ' + lastRow.join(' | '));
      }
    }
    
    Logger.log('✅ TEST VOUCHER HISTORY SHEET SUCCESS');
    return 'Sheet is accessible. Last row: ' + sheet.getLastRow();
  } catch (error) {
    Logger.log('❌ TEST VOUCHER HISTORY SHEET FAILED: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack'));
    return 'Test failed: ' + error.message;
  }
}

function appendHistory_(entry) {
  try {
    Logger.log('=== appendHistory_ START ===');
    Logger.log('Entry data: ' + JSON.stringify(entry));
    
    const sheet = getVoucherHistorySheet_();
    Logger.log('✅ Sheet accessed successfully');
    
    const now = new Date();
    Logger.log('Timestamp: ' + now.toISOString());

    // Enhanced metadata with more details for better tracking
    const enhancedMeta = {
      ...(entry.meta || {}),
      timestamp: now.toISOString(),
      actionType: entry.action || '',
      status: entry.status || '',
      ipAddress: entry.ipAddress || '', // Can be added from frontend if needed
      userAgent: entry.userAgent || ''  // Can be added from frontend if needed
    };

    // Parse amount to number (remove currency symbols if string)
    let amountValue = entry.amount || 0;
    if (typeof amountValue === 'string') {
      // Remove currency symbols and spaces
      let cleanAmount = amountValue.replace(/[₫\s]/g, '');
      // Handle Vietnamese number format: "10.050" = 10050 (dot is thousand separator)
      cleanAmount = cleanAmount.replace(/\./g, '').replace(/,/g, '');
      amountValue = parseFloat(cleanAmount) || 0;
    } else if (typeof amountValue === 'number') {
      amountValue = amountValue;
    } else {
      amountValue = 0;
    }
    
    const rowData = [
      entry.voucherNumber || '',
      entry.voucherType || '',
      entry.company || '',
      entry.employee || '',
      amountValue, // Store as number, not string
      entry.status || '',
      entry.action || '',
      entry.by || '',
      entry.note || '',
      '', // Column J - Will be set with hyperlinks after append
      entry.requestorEmail || '',
      entry.approverEmail || '',
      now,
      JSON.stringify(enhancedMeta)
    ];
    
    Logger.log('Row data to append: ' + JSON.stringify(rowData));
    Logger.log('Row data length: ' + rowData.length);
    
    sheet.appendRow(rowData);
    Logger.log('✅ Row appended to sheet');
    
    // Verify the row was added
    const lastRow = sheet.getLastRow();
    Logger.log('✅ Last row in sheet: ' + lastRow);
    
    // Set attachments in Column J - individual file links with clickable URLs
    if (entry.attachments && entry.attachments.trim() !== '') {
      Logger.log('=== SETTING COLUMN J ATTACHMENTS ===');
      Logger.log('Raw attachments: ' + entry.attachments);
      
      try {
        const attachmentsCell = sheet.getRange(lastRow, 10); // Column J
        
        // NEW FORMAT: Individual file links
        // Format: filename (size MB) - URL\nfilename2 (size MB) - URL2
        const lines = entry.attachments.split('\n').filter(l => l.trim() !== '');
        Logger.log('Lines count: ' + lines.length);
        Logger.log('First line: ' + (lines[0] || 'EMPTY'));
        
        const hasFileLinks = lines.length > 0 && lines[0].includes(' - https://');
        Logger.log('Has file links format: ' + hasFileLinks);
        
        if (hasFileLinks) {
          // Build RichTextValue with multiple clickable links
          let displayParts = [];
          let linkRanges = [];
          let currentPos = 0;
          
          lines.forEach((line, index) => {
            // Parse: filename (size MB) - URL
            const urlMatch = line.match(/(.*?) - (https?:\/\/[^\s]+)/);
            Logger.log('Line ' + index + ' match: ' + (urlMatch ? 'YES' : 'NO'));
            
            if (urlMatch) {
              const fileInfo = urlMatch[1]; // filename (size MB)
              const fileUrl = urlMatch[2];
              
              Logger.log('File info: ' + fileInfo);
              Logger.log('File URL: ' + fileUrl);
              
              // Add emoji and file info
              const displayLine = '📄 ' + fileInfo;
              displayParts.push(displayLine);
              
              // Track link position (for the file info part, not emoji)
              const startPos = currentPos + 2; // After "📄 " (emoji is 2 chars in some encodings)
              const endPos = startPos + fileInfo.length;
              linkRanges.push({ start: startPos, end: endPos, url: fileUrl });
              
              currentPos += displayLine.length;
              
              // Add newline if not last
              if (index < lines.length - 1) {
                displayParts.push('\n');
                currentPos += 1;
              }
            }
          });
          
          const fullText = displayParts.join('');
          Logger.log('Full display text: ' + fullText);
          Logger.log('Link ranges: ' + JSON.stringify(linkRanges));
          
          // Build RichTextValue with all links
          let richTextBuilder = SpreadsheetApp.newRichTextValue().setText(fullText);
          linkRanges.forEach(range => {
            try {
              richTextBuilder = richTextBuilder.setLinkUrl(range.start, range.end, range.url);
            } catch (rangeError) {
              Logger.log('⚠️ Error setting link for range: ' + JSON.stringify(range) + ' - ' + rangeError.toString());
            }
          });
          
          attachmentsCell.setRichTextValue(richTextBuilder.build());
          
          // Store raw data in note for programmatic access
          attachmentsCell.setNote(entry.attachments);
          
          Logger.log('✅ Set ' + lines.length + ' clickable file links in Column J');
        } else if (entry.attachments.startsWith('http')) {
          // Single URL - make it clickable
          const displayText = 'Tài liệu đính kèm';
          const richText = SpreadsheetApp.newRichTextValue()
            .setText(displayText)
            .setLinkUrl(0, displayText.length, entry.attachments)
            .build();
          attachmentsCell.setRichTextValue(richText);
          Logger.log('✅ Set single clickable link in Column J');
        } else {
          // Plain text - just store as text
          attachmentsCell.setValue(entry.attachments);
          Logger.log('✅ Set plain text attachments in Column J');
        }
      } catch (linkError) {
        Logger.log('⚠️ Could not set hyperlinks, falling back to plain text: ' + linkError.toString());
        sheet.getRange(lastRow, 10).setValue(entry.attachments);
      }
    }
    
    Logger.log('✅ History appended successfully for voucher: ' + (entry.voucherNumber || 'N/A') + ', action: ' + (entry.action || 'N/A') + ', status: ' + (entry.status || 'N/A'));
    Logger.log('=== appendHistory_ END ===');
  } catch (error) {
    Logger.log('❌ ERROR appending history: ' + error.toString());
    Logger.log('Error name: ' + error.name);
    Logger.log('Error message: ' + error.message);
    Logger.log('Stack: ' + (error.stack || 'No stack'));
    Logger.log('=== appendHistory_ ERROR END ===');
    // Don't throw - let the calling function handle it
    throw error;
  }
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

/**
 * Get full history for a specific voucher
 * Returns array of all actions/events for the voucher
 */
function getVoucherHistory_(voucherNumber) {
  try {
    const sheet = getVoucherHistorySheet_();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow <= 1) return [];
    
    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    
    // Get RichTextValues for attachments column (Column J = index 9, but 1-based = 10)
    const attachmentsColIndex = 10; // Column J (1-based)
    let richTextValues = null;
    try {
      if (lastRow > 1) {
        richTextValues = sheet.getRange(2, attachmentsColIndex, lastRow - 1, 1).getRichTextValues();
      }
    } catch (rtError) {
      Logger.log('Could not get RichTextValues: ' + rtError);
    }
    
    const header = data[0];
    const idxVoucherNumber = header.indexOf('VoucherNumber');
    const idxVoucherType = header.indexOf('VoucherType');
    const idxCompany = header.indexOf('Company');
    const idxEmployee = header.indexOf('Employee');
    const idxAmount = header.indexOf('Amount');
    const idxStatus = header.indexOf('Status');
    const idxAction = header.indexOf('Action');
    const idxBy = header.indexOf('By');
    const idxNote = header.indexOf('Note');
    const idxAttachments = header.indexOf('Attachments'); // Column J
    const idxRequestorEmail = header.indexOf('RequestorEmail');
    const idxApproverEmail = header.indexOf('ApproverEmail');
    const idxTimestamp = header.indexOf('Timestamp');
    const idxMetaJSON = header.indexOf('MetaJSON');
    
    const history = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][idxVoucherNumber] === voucherNumber) {
        let meta = {};
        try {
          if (data[i][idxMetaJSON]) {
            meta = JSON.parse(data[i][idxMetaJSON]);
          }
        } catch (e) {
          Logger.log('Error parsing meta JSON: ' + e);
        }
        
        // Get attachments URLs - extract ALL URLs from RichTextValue runs
        let attachments = '';
        if (idxAttachments >= 0) {
          // Method 1: Try to get ALL URLs from RichTextValue runs (for multi-hyperlink cells)
          if (richTextValues && richTextValues[i - 1] && richTextValues[i - 1][0]) {
            const richText = richTextValues[i - 1][0];
            const runs = richText.getRuns();
            const urlsWithNames = [];
            
            // Extract URLs and their display text from each run
            for (const run of runs) {
              const url = run.getLinkUrl();
              const text = run.getText().trim();
              if (url && url.startsWith('http')) {
                urlsWithNames.push(text + '|' + url);
              }
            }
            
            if (urlsWithNames.length > 0) {
              // Return all URLs with their names, separated by newline
              attachments = urlsWithNames.join('\n');
              Logger.log('Row ' + i + ' - Got ' + urlsWithNames.length + ' attachment(s): ' + attachments);
            }
          }
          
          // Method 2: Try to get from cell note (we store FOLDER_URL there for new uploads)
          if (!attachments) {
            try {
              const note = sheet.getRange(i + 1, 10).getNote();
              if (note && note.includes('FOLDER_URL:')) {
                const urlMatch = note.match(/FOLDER_URL:\s*(https?:\/\/[^\s\n]+)/);
                if (urlMatch) {
                  attachments = 'Tài liệu đính kèm|' + urlMatch[1];
                  Logger.log('Row ' + i + ' - Got attachment URL from note: ' + attachments);
                }
              }
            } catch (noteError) {
              Logger.log('Could not read note: ' + noteError);
            }
          }
          
          // Method 3: Check if cell value is a URL or contains URL
          if (!attachments && data[i][idxAttachments]) {
            const cellValue = data[i][idxAttachments].toString();
            if (cellValue.includes('|') && cellValue.startsWith('http')) {
              attachments = 'Tài liệu đính kèm|' + cellValue.split('|')[0];
              Logger.log('Row ' + i + ' - Got attachment URL from pipe format: ' + attachments);
            } else if (cellValue.startsWith('http')) {
              attachments = 'Tài liệu đính kèm|' + cellValue;
              Logger.log('Row ' + i + ' - Got attachment URL from plain text: ' + attachments);
            }
          }
        }
        
        history.push({
          voucherNumber: data[i][idxVoucherNumber] || '',
          voucherType: data[i][idxVoucherType] || '',
          company: data[i][idxCompany] || '',
          employee: data[i][idxEmployee] || '',
          amount: data[i][idxAmount] || '',
          status: data[i][idxStatus] || '',
          action: data[i][idxAction] || '',
          by: data[i][idxBy] || '',
          note: data[i][idxNote] || '',
          attachments: attachments,
          requestorEmail: data[i][idxRequestorEmail] || '',
          approverEmail: data[i][idxApproverEmail] || '',
          timestamp: data[i][idxTimestamp] || '',
          meta: meta
        });
      }
    }
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    });
    
    return history;
  } catch (error) {
    Logger.log('Error getting voucher history: ' + error.toString());
    return [];
  }
}

/**
 * Get all vouchers for a specific user (by email or employee name)
 * Returns array of unique vouchers with latest status
 */
function getUserVouchers_(userEmail, employeeName) {
  try {
    const sheet = getVoucherHistorySheet_();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const header = data[0];
    const idxVoucherNumber = header.indexOf('VoucherNumber');
    const idxVoucherType = header.indexOf('VoucherType');
    const idxCompany = header.indexOf('Company');
    const idxEmployee = header.indexOf('Employee');
    const idxAmount = header.indexOf('Amount');
    const idxStatus = header.indexOf('Status');
    const idxAction = header.indexOf('Action');
    const idxBy = header.indexOf('By');
    const idxRequestorEmail = header.indexOf('RequestorEmail');
    const idxTimestamp = header.indexOf('Timestamp');
    
    // Get all rows matching user
    const matchingRows = [];
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][idxRequestorEmail] || '';
      const rowEmployee = data[i][idxEmployee] || '';
      
      const matchesEmail = !userEmail || rowEmail.toLowerCase().includes(userEmail.toLowerCase());
      const matchesEmployee = !employeeName || rowEmployee.toLowerCase().includes(employeeName.toLowerCase());
      
      if (matchesEmail || matchesEmployee) {
        matchingRows.push(data[i]);
      }
    }
    
    // Group by voucher number and get latest status
    const voucherMap = new Map();
    matchingRows.forEach(row => {
      const voucherNumber = row[idxVoucherNumber];
      if (!voucherNumber) return;
      
      if (!voucherMap.has(voucherNumber) || 
          new Date(row[idxTimestamp] || 0) > new Date(voucherMap.get(voucherNumber).timestamp || 0)) {
        voucherMap.set(voucherNumber, {
          voucherNumber: voucherNumber,
          voucherType: row[idxVoucherType] || '',
          company: row[idxCompany] || '',
          employee: row[idxEmployee] || '',
          amount: row[idxAmount] || '',
          status: row[idxStatus] || '',
          action: row[idxAction] || '',
          by: row[idxBy] || '',
          timestamp: row[idxTimestamp] || ''
        });
      }
    });
    
    // Convert to array and sort by timestamp
    const vouchers = Array.from(voucherMap.values());
    vouchers.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    });
    
    return vouchers;
  } catch (error) {
    Logger.log('Error getting user vouchers: ' + error.toString());
    return [];
  }
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
    debugLog_('=== doPost called ===');
    
    // Safety check - if called manually without event parameter
    if (!e) {
      debugLog_('❌ ERROR: e is null/undefined');
      return createResponse(false, 'Invalid request - no event data');
    }
    
    debugLog_('e keys: ' + Object.keys(e).join(', '));
    
    // Log all available properties of e
    Logger.log('e keys: ' + Object.keys(e).join(', '));
    Logger.log('e.postData exists: ' + (e.postData ? 'YES' : 'NO'));
    Logger.log('e.parameter exists: ' + (e.parameter ? 'YES' : 'NO'));
    
    if (e.postData) {
      Logger.log('e.postData type: ' + (e.postData.type || 'null'));
      Logger.log('e.postData contents length: ' + (e.postData.contents ? e.postData.contents.length : 0));
    }
    if (e.parameter) {
      Logger.log('e.parameter: ' + JSON.stringify(e.parameter));
    }

    let requestBody;
    let action;

    // Check for FormData action first (e.parameter.action)
    if (e.parameter && e.parameter.action) {
      action = e.parameter.action;
      requestBody = e.parameter;
      Logger.log('Parsed action from FormData: ' + action);
    }

    // 1) e.postData.contents (JSON or text/plain body)
    if (!action && e.postData && e.postData.contents) {
      try {
        // Log the first 500 chars for debugging
        Logger.log('postData.contents preview: ' + e.postData.contents.substring(0, 500));
        Logger.log('postData.type: ' + (e.postData.type || 'unknown'));
        
        var rawContents = e.postData.contents;
        
        // ALWAYS try to decode as UTF-8 first to handle Vietnamese properly
        try {
          var bytes = [];
          for (var i = 0; i < rawContents.length; i++) {
            bytes.push(rawContents.charCodeAt(i) & 0xFF);
          }
          var decodedContents = Utilities.newBlob(bytes).getDataAsString('UTF-8');
          
          // Only use decoded if it successfully parses as JSON
          JSON.parse(decodedContents);
          rawContents = decodedContents;
          Logger.log('✅ Successfully decoded POST data as UTF-8');
        } catch (encErr) {
          // If decoding fails, use original content
          Logger.log('Using original content (UTF-8 decode not needed or failed): ' + encErr.toString());
        }
        
        requestBody = JSON.parse(rawContents);
        action = requestBody.action;
        Logger.log('Parsed from e.postData.contents');
        Logger.log('Parsed requestBody keys: ' + Object.keys(requestBody).join(', '));
        
        // Log voucher.files info specifically
        if (requestBody.voucher && requestBody.voucher.files) {
          Logger.log('📁 voucher.files count: ' + requestBody.voucher.files.length);
          requestBody.voucher.files.forEach((f, idx) => {
            Logger.log('📁 File ' + (idx+1) + ': ' + f.fileName + ', hasData: ' + (f.fileData ? 'YES' : 'NO') + ', dataLen: ' + (f.fileData ? f.fileData.length : 0));
          });
        } else {
          Logger.log('📁 No voucher.files found in request');
        }
        
        if (requestBody.requesterEmail) {
          Logger.log('requesterEmail found in requestBody: ' + JSON.stringify(requestBody.requesterEmail));
        } else {
          Logger.log('⚠️ requesterEmail NOT found in requestBody');
        }
      } catch (err) {
        Logger.log('Error parsing e.postData.contents: ' + err);
        Logger.log('Raw contents (first 1000 chars): ' + (e.postData.contents ? e.postData.contents.substring(0, 1000) : 'null'));
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
        return handleGetVoucherSummary(requestBody);
      case 'getVoucherHistory':
        return handleGetVoucherHistory(requestBody);
      case 'getUserVouchers':
        return handleGetUserVouchers(requestBody);
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
        rejectReason  : e.parameter.rejectReason  || e.parameter.reason || '',
        rejectedBy    : e.parameter.rejectedBy    || e.parameter.approverEmail || '',
        approverSignature: e.parameter.approverSignature || '' // Approver's signature
      };

      Logger.log('=== PARSED VOUCHER FROM GET ===');
      Logger.log('voucherNumber: ' + voucher.voucherNumber);
      Logger.log('requestorEmail: ' + voucher.requestorEmail);
      Logger.log('approverEmail: ' + voucher.approverEmail);
      Logger.log('Has approverSignature: ' + (voucher.approverSignature ? 'YES' : 'NO'));
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

    // Handle getVoucherSummary and getVoucherHistory via GET
    if (action === 'getVoucherSummary') {
      Logger.log('=== CALLING handleGetVoucherSummary FROM GET ===');
      return handleGetVoucherSummary({ userEmail: e.parameter.userEmail || '', employeeName: e.parameter.employeeName || '' });
    }
    
    if (action === 'getVoucherHistory') {
      Logger.log('=== CALLING handleGetVoucherHistory FROM GET ===');
      return handleGetVoucherHistory({ voucherNumber: e.parameter.voucherNumber || '' });
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

/**
 * Encode subject line for proper UTF-8 display in email
 * Uses RFC 2047 MIME encoded-word format: =?UTF-8?B?base64encodedtext?=
 */
function encodeSubjectUtf8(subject) {
  // GmailApp handles UTF-8 natively - just return the subject as-is
  // The previous Base64 encoding was causing double-encoding issues
  return subject || '';
}

/**
 * Fix garbled UTF-8 text that was misinterpreted as Latin-1
 * Example: "PHIÃ¡ÂºÂ¾U" should become "PHIẾU"
 */
function fixGarbledUtf8(str) {
  if (!str) return str;
  
  // Check if the string contains typical garbled patterns
  // These patterns occur when UTF-8 bytes are interpreted as Latin-1
  if (str.indexOf('Ã') === -1 && str.indexOf('Â') === -1) {
    return str; // String looks fine, return as-is
  }
  
  try {
    // Convert the garbled string back: Latin-1 interpretation -> UTF-8 bytes -> proper UTF-8 string
    // In Google Apps Script, we use Utilities for this
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) & 0xFF);
    }
    var decoded = Utilities.newBlob(bytes).getDataAsString('UTF-8');
    Logger.log('Fixed garbled UTF-8: "' + str + '" -> "' + decoded + '"');
    return decoded;
  } catch (e) {
    Logger.log('Could not fix garbled UTF-8: ' + e.toString());
    return str; // Return original if decoding fails
  }
}

function handleSendEmail(requestBody) {
  try {
    Logger.log('=== handleSendEmail START ===');
    debugLog_('=== handleSendEmail START ===');
    
    const emailData = requestBody.email;
    const requesterEmailData = requestBody.requesterEmail || null;
    const voucher   = requestBody.voucher || {};

    // Debug: Log full voucher object received
    Logger.log('Voucher object received: ' + JSON.stringify(voucher));
    debugLog_('Voucher object: ' + JSON.stringify(voucher));

    if (!emailData) {
      debugLog_('❌ ERROR: emailData is missing');
      return createResponse(false, 'Email data is required');
    }

    const to      = emailData.to;
    const cc      = emailData.cc || '';
    
    // Extract voucherNumber and voucherType - try multiple sources
    let voucherNumber = voucher.voucherNumber || '';
    let voucherType = voucher.voucherType || '';
    
    // If voucher data missing, try to extract from frontend subject (as backup)
    if (!voucherNumber || !voucherType) {
      const frontendSubject = emailData.subject || '';
      // Pattern: [PHIẾU CHI] or [PHIẾU THU] ... - TL-YYYYMM-XXXX
      const typeMatch = frontendSubject.match(/\[PHI[^\]]*\s+(CHI|THU)\]/i);
      const numMatch = frontendSubject.match(/(TL-\d{6}-\d+)/i);
      if (typeMatch && !voucherType) voucherType = typeMatch[1];
      if (numMatch && !voucherNumber) voucherNumber = numMatch[1];
      Logger.log('Extracted from subject - Type: ' + voucherType + ', Number: ' + voucherNumber);
    }
    
    // Build subject in backend with ASCII-safe Vietnamese
    // ALWAYS construct in backend to avoid encoding issues
    let subject;
    if (voucherNumber && voucherType) {
      const typeUpper = voucherType.toUpperCase();
      // Use Vietnamese text directly - it works in approval emails
      subject = '[PHIẾU ' + typeUpper + '] Yêu cầu phê duyệt - ' + voucherNumber;
      Logger.log('📧 Subject constructed in backend: ' + subject);
    } else {
      // Ultimate fallback - use simple ASCII
      subject = '[VOUCHER] Approval Request - ' + (voucherNumber || 'NEW');
      Logger.log('📧 Using fallback ASCII subject: ' + subject);
    }
    
    debugLog_('FINAL Subject: ' + subject);

    if (!to) {
      debugLog_('❌ ERROR: Recipient email (TO) is required');
      return createResponse(false, 'Recipient email is required');
    }

    // ========== UPLOAD FILES FIRST ==========
    let uploadedFiles = [];
    let attachmentsText = '';
    let fileLinksHtml = '';
    
    const voucherNumberForHistory = voucher.voucherNumber || 'AUTO-' + new Date().getTime();
    
    Logger.log('=== CHECKING FILES FOR UPLOAD ===');
    Logger.log('voucher.files exists: ' + (voucher.files ? 'YES' : 'NO'));
    Logger.log('voucher.files length: ' + (voucher.files ? voucher.files.length : 0));
    
    if (voucher.files && voucher.files.length > 0) {
      Logger.log('Uploading ' + voucher.files.length + ' files to Drive...');
      try {
        const uploadResult = uploadFilesToDrive_(voucher.files, voucherNumberForHistory);
        uploadedFiles = uploadResult.files.filter(f => !f.error);
        
        Logger.log('Files uploaded successfully. Count: ' + uploadedFiles.length);
        
        // Generate individual file links for Column J (Option B)
        // Format: filename (size MB) - URL\nfilename2 (size MB) - URL2
        attachmentsText = uploadedFiles.map(f => {
          const sizeMB = f.fileSize ? (f.fileSize / (1024 * 1024)).toFixed(2) : '0.00';
          return f.fileName + ' (' + sizeMB + ' MB) - ' + f.fileUrl;
        }).join('\n');
        
        // Generate HTML links for email body
        fileLinksHtml = generateFileLinksHtml_(uploadedFiles);
        
        Logger.log('Attachments text for history: ' + attachmentsText);
        Logger.log('File links HTML generated: ' + (fileLinksHtml ? 'YES' : 'NO'));
        
      } catch (uploadError) {
        Logger.log('⚠️ Warning: File upload failed: ' + uploadError.toString());
        // Fallback to just file names if upload fails
        attachmentsText = voucher.files.map(f => {
          const sizeMB = f.fileSize ? (f.fileSize / (1024 * 1024)).toFixed(2) : '?';
          return f.fileName + ' (' + sizeMB + ' MB) - Upload failed';
        }).join('\n');
      }
    }
    
    // ========== INJECT FILE LINKS INTO EMAIL BODY ==========
    let body = emailData.body;
    let requesterBodyBase = requesterEmailData && requesterEmailData.body ? requesterEmailData.body : body;
    
    Logger.log('=== INJECTING FILE LINKS INTO EMAIL ===');
    Logger.log('fileLinksHtml exists: ' + (fileLinksHtml ? 'YES (' + fileLinksHtml.length + ' chars)' : 'NO'));
    
    if (fileLinksHtml && fileLinksHtml.length > 0) {
      // Create the files section HTML
      const filesSectionHtml = 
        '<div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">' +
          '<p style="margin: 0 0 10px 0; font-weight: bold; color: #495057;">📎 Tài liệu đính kèm:</p>' +
          fileLinksHtml +
        '</div>';
      
      Logger.log('Files section HTML created: ' + filesSectionHtml.substring(0, 200) + '...');
      
      // Try multiple injection points for approver email
      let injected = false;
      
      // Method 1: Before "Vui lòng xem xét"
      if (body.indexOf('Vui lòng xem xét') !== -1) {
        body = body.replace(/(<p[^>]*><b>Vui lòng xem xét)/i, filesSectionHtml + '$1');
        injected = true;
        Logger.log('✅ Injected before "Vui lòng xem xét"');
      }
      // Method 2: Before approval buttons div
      else if (body.indexOf('style="margin: 20px 0;"') !== -1 && body.indexOf('#34A853') !== -1) {
        body = body.replace(/(<div style="margin: 20px 0;">[\s\S]*?#34A853)/i, filesSectionHtml + '$1');
        injected = true;
        Logger.log('✅ Injected before approval buttons');
      }
      // Method 3: Before "Trân trọng"
      else if (body.indexOf('Trân trọng') !== -1) {
        body = body.replace(/(<p[^>]*>Trân trọng)/i, filesSectionHtml + '$1');
        injected = true;
        Logger.log('✅ Injected before "Trân trọng"');
      }
      // Method 4: Append at end before closing tags
      else {
        body = body + filesSectionHtml;
        injected = true;
        Logger.log('✅ Appended at end of email body');
      }
      
      Logger.log('Approver email injection success: ' + injected);
      
      // Also update requester body with same logic
      let requesterInjected = false;
      if (requesterBodyBase.indexOf('Email thông báo kết quả') !== -1) {
        requesterBodyBase = requesterBodyBase.replace(/(<p[^>]*>Email thông báo kết quả)/i, filesSectionHtml + '$1');
        requesterInjected = true;
      } else if (requesterBodyBase.indexOf('Trân trọng') !== -1) {
        requesterBodyBase = requesterBodyBase.replace(/(<p[^>]*>Trân trọng)/i, filesSectionHtml + '$1');
        requesterInjected = true;
      } else {
        requesterBodyBase = requesterBodyBase + filesSectionHtml;
        requesterInjected = true;
      }
      Logger.log('Requester email injection success: ' + requesterInjected);
    } else {
      Logger.log('⚠️ No file links HTML to inject');
    }
    
    // Debug log the subject
    debugLog_('Subject: ' + subject);
    debugLog_('Email TO: ' + to);

    // ========== SEND EMAIL TO APPROVERS ==========
    try {
      const emailOptions = { 
        to: to,
        subject: subject,
        htmlBody: body,
        noReply: false
      };
      if (cc && cc.trim() !== '') {
        emailOptions.cc = cc;
      }
      MailApp.sendEmail(emailOptions);
      Logger.log('✅ Email sent to approvers: ' + to);
    } catch (approverEmailError) {
      Logger.log('❌ ERROR sending email to approvers: ' + approverEmailError.toString());
      return createResponse(false, 'Failed to send email to approvers: ' + approverEmailError.message);
    }
    
    // ========== SEND EMAIL TO REQUESTER ==========
    let requesterTo = null;
    let requesterSubject = null;
    let requesterBody = null;
    
    Logger.log('=== CHECKING REQUESTER EMAIL ===');
    
    // Priority 1: requesterEmailData.to from frontend
    if (requesterEmailData && requesterEmailData.to && requesterEmailData.to.trim() !== '') {
      requesterTo = requesterEmailData.to;
      requesterSubject = '[THÔNG BÁO] Phiếu ' + (voucher.voucherType || '') + ' ' + (voucher.voucherNumber || '') + ' đã được gửi phê duyệt';
      requesterBody = requesterBodyBase.replace(/<a href="[^"]*">.*?<\/a>/g, ''); // Remove buttons
      Logger.log('📧 Priority 1: Using requesterEmailData.to: ' + requesterTo);
    }
    // Priority 2: voucher.requestorEmail
    else if (voucher.requestorEmail && voucher.requestorEmail.trim() !== '') {
      requesterTo = voucher.requestorEmail;
      requesterSubject = '[THÔNG BÁO] Phiếu ' + (voucher.voucherType || '') + ' ' + (voucher.voucherNumber || '') + ' đã được gửi phê duyệt';
      requesterBody = requesterBodyBase.replace(/<a href="[^"]*">.*?<\/a>/g, ''); // Remove buttons
      Logger.log('📧 Priority 2: Using voucher.requestorEmail: ' + requesterTo);
    }
    
    if (requesterTo) {
      Logger.log('📧 Sending requester notification email to: ' + requesterTo);
      try {
        MailApp.sendEmail({
          to: requesterTo,
          subject: requesterSubject,
          htmlBody: requesterBody,
          noReply: false
        });
        Logger.log('✅ Info email sent to requester: ' + requesterTo);
      } catch (emailError) {
        Logger.log('❌ ERROR sending requester email: ' + emailError.toString());
      }
    }

    // ========== APPEND HISTORY ==========
    Logger.log('=== APPENDING HISTORY ===');
    try {
      appendHistory_({
        voucherNumber : voucherNumberForHistory,
        voucherType   : voucher.voucherType || '',
        company       : voucher.company || '',
        employee      : voucher.employee || '',
        amount        : voucher.amount || '',
        status        : 'Pending',
        action        : 'Submit',
        by            : voucher.employee || voucher.requestorEmail || 'Unknown',
        note          : voucher.reason || voucher.note || '',
        requestorEmail: voucher.requestorEmail || '',
        approverEmail : voucher.approverEmail  || '',
        attachments   : attachmentsText,
        meta: {
          voucherDate: voucher.voucherDate || '',
          department : voucher.department || '',
          payeeName  : voucher.payeeName || '',
          requesterSignature: voucher.requesterSignature || '',
          uploadedFiles: uploadedFiles // Store file details in meta
        }
      });
      Logger.log('✅ History append completed successfully');
    } catch (historyError) {
      Logger.log('❌ ERROR appending history: ' + historyError.toString());
    }

    return createResponse(true, 'Email sent successfully');
  } catch (error) {
    Logger.log('Error in handleSendEmail: ' + error.toString());
    debugLog_('❌ ERROR: ' + error.toString());
    return createResponse(false, 'Error sending email: ' + error.message);
  }
}

/**
 * Generate HTML for file links to include in email body
 * @param {Array} uploadedFiles - Array of {fileName, fileUrl, fileSize}
 * @returns {string} HTML string with clickable file links
 */
function generateFileLinksHtml_(uploadedFiles) {
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return '';
  }
  
  const fileLinks = uploadedFiles.map(f => {
    const sizeMB = f.fileSize ? (f.fileSize / (1024 * 1024)).toFixed(2) : '0.00';
    return '<div style="margin: 5px 0;">' +
      '<span style="margin-right: 8px;">📄</span>' +
      '<a href="' + f.fileUrl + '" style="color: #1a73e8; text-decoration: none; font-weight: 500;">' + 
      f.fileName + '</a>' +
      '<span style="color: #666; margin-left: 8px;">(' + sizeMB + ' MB)</span>' +
      '</div>';
  }).join('');
  
  return fileLinks;
}

/** ===================== 2. SYNC TO SHEETS (GIỮ NGUYÊN) ===================== */

function handleSyncToSheets(requestBody) {
  try {
    const data = requestBody.data;

    if (!data) return createResponse(false, 'Data is required');

    // Upload files to Drive if present
    let attachmentsText = '';
    if (data.files && data.files.length > 0) {
      Logger.log('Uploading ' + data.files.length + ' files to Drive...');
      try {
        const uploadedFiles = uploadFilesToDrive_(data.files, data.voucherNumber);
        // Format attachments with Drive links for Column J
        attachmentsText = uploadedFiles.map(f => {
          if (f.error) return `${f.fileName} (Upload failed)`;
          const sizeMB = f.fileSize ? (f.fileSize / (1024 * 1024)).toFixed(2) : '?';
          return `${f.fileName} (${sizeMB} MB)\n${f.fileUrl}`;
        }).join('\n\n');
        Logger.log('Files uploaded successfully');
      } catch (uploadError) {
        Logger.log('⚠️ Warning: File upload failed: ' + uploadError.toString());
        attachmentsText = ''; // No attachments if upload fails
      }
    }

    // Write to Voucher_History sheet with action "Created"
    try {
      appendHistory_({
        voucherNumber: data.voucherNumber || '',
        voucherType: data.voucherType || '',
        company: data.company || '',
        employee: data.employee || '',
        amount: data.totalAmount || '',
        status: 'Created',
        action: 'Created',
        by: data.employee || '',
        note: data.reason || '',
        attachments: attachmentsText, // Column J - Drive links
        requestorEmail: '',
        approverEmail: data.approver || '',
        meta: {
          voucherDate: data.voucherDate || '',
          department: data.department || '',
          payeeName: data.payeeName || '',
          currency: data.currency || '',
          amountInWords: data.amountInWords || '',
          expenseItems: data.expenseItems || [],
          approvalHistory: data.approvalHistory || []
        }
      });
      Logger.log('Data synced successfully to Voucher_History');
      return createResponse(true, 'Data synced successfully to Voucher_History');
    } catch (historyError) {
      Logger.log('Error writing to Voucher_History: ' + historyError.toString());
      return createResponse(false, 'Error syncing to Voucher_History: ' + historyError.message);
    }
  } catch (error) {
    Logger.log('Error syncing to sheets: ' + error.toString());
    return createResponse(false, 'Error syncing to sheets: ' + error.message);
  }
}

/**
 * DEPRECATED - No longer used. Data now goes directly to Voucher_History
 * Previously used for separate "Phiếu Thu Chi" sheet
 */
function createHeaderRow(sheet) {
  const headers = [
    'Thời gian','Số phiếu','Loại phiếu','Ngày lập','Công ty','Người đề nghị',
    'Bộ phận','Người nộp/nhận','Loại tiền','Tổng số tiền','Số tiền bằng chữ',
    'Lý do','Người phê duyệt','Trạng thái','Số dòng chi tiết',
    'Chi tiết (JSON)','Lịch sử phê duyệt (JSON)','Files đính kèm'
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

/**
 * DEPRECATED - No longer used. Data now goes directly to Voucher_History via appendHistory_
 * Previously used for separate "Phiếu Thu Chi" sheet
 */
function writeVoucherData(sheet, data, spreadsheet) {
  // Format file information for display - prefer Drive links if available
  let filesText = '';
  if (data.driveFiles && data.driveFiles.length > 0) {
    // Use Drive links if files were uploaded
    filesText = data.driveFiles.map(f => {
      if (f.error) {
        return `${f.fileName} (Upload failed)`;
      }
      const sizeMB = f.fileSize ? (f.fileSize / (1024 * 1024)).toFixed(2) : '?';
      return `${f.fileName} (${sizeMB} MB)\n${f.fileUrl}`;
    }).join('\n\n');
  } else if (data.filesInfo && data.filesInfo.length > 0) {
    // Fallback to metadata only if no Drive upload
    filesText = data.filesInfo.map(f => {
      const sizeMB = (f.fileSize / (1024 * 1024)).toFixed(2);
      return `${f.fileName} (${sizeMB} MB)`;
    }).join('\n');
  }

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
    JSON.stringify(data.approvalHistory || []),
    filesText
  ];

  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 1, 1, row.length).setValues([row]);

  // Format
  sheet.getRange(newRow, 10).setNumberFormat('#,##0'); // amount
  if (data.voucherDate) sheet.getRange(newRow, 4).setNumberFormat('dd/mm/yyyy');
  sheet.autoResizeColumns(1, row.length);

  formatStatusColumn(sheet, newRow);

  if (data.expenseItems && data.expenseItems.length > 0 && spreadsheet) {
/**
 * DEPRECATED - No longer used
 * Previously used for separate "Phiếu Thu Chi" sheet
 */
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
/**
 * DEPRECATED - No longer used
 * Previously created detail sheets for vouchers
 */
  }
  statusCell.setFontWeight('bold').setHorizontalAlignment('center');
}

function createDetailSheet(spreadsheet, voucherNumber, expenseItems) {
  const detailSheetName = 'Chi tiết ' + voucherNumber;
  const existing = spreadsheet.getSheetByName(detailSheetName);
  if (existing) spreadsheet.deleteSheet(existing);

  const detailSheet = spreadsheet.insertSheet(detailSheetName);
  const headers = ['STT','Nội dung','Số tiền','Số file đính kèm','Tên files'];
  detailSheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#4285F4').setFontColor('#FFFFFF');

  const rows = expenseItems.map((item, i) => [
    i + 1,
    item.content || '',
    item.amount  || 0,
    item.attachments || 0,
    item.attachmentNames || ''
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
    // Fix garbled UTF-8 in voucherType (e.g., "CHI" might come as garbled)
    const voucherType    = fixGarbledUtf8(voucher.voucherType || '');
    const company        = fixGarbledUtf8(voucher.company || '');
    const employee       = fixGarbledUtf8(voucher.employee || '');
    const amount         = voucher.amount        || '';
    const requestorEmail = voucher.requestorEmail|| '';
    const approverEmail  = voucher.approverEmail || '';
    const approvedBy     = fixGarbledUtf8(voucher.approvedBy || approverEmail || 'Unknown');
    const approverSignature = voucher.approverSignature || ''; // Approver signature data

    Logger.log('Voucher Number: ' + voucherNumber);
    Logger.log('Voucher Type (fixed): ' + voucherType);
    Logger.log('Requestor Email: ' + requestorEmail);
    Logger.log('Approver Email: ' + approverEmail);
    Logger.log('Approved By: ' + approvedBy);
    Logger.log('Has Approver Signature: ' + (approverSignature ? 'Yes' : 'No'));

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

    // Include approver signature in meta data
    const meta = {
      approverSignature: approverSignature,
      approvedAt: new Date().toISOString()
    };

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
      approverEmail,
      meta: meta
    });
    Logger.log('✅ History appended');

    // Build approval email with approver signature if available
    let signatureHtml = '';
    if (approverSignature && approverSignature.startsWith('data:image')) {
      signatureHtml = `<p><b>Chữ ký người phê duyệt:</b></p><img src="${approverSignature}" style="max-height: 80px; max-width: 200px;" alt="Chữ ký">`;
    }

    const subject = encodeSubjectUtf8(`[ĐÃ PHÊ DUYỆT] Phiếu ${voucherType.toUpperCase()} - ${voucherNumber}`);
    const emailBodyHtml = [
      `<p>Kính gửi <b>${employee}</b>,</p>`,
      `<p>Phiếu <b>${voucherType}</b> số <b>${voucherNumber}</b> của bạn đã được <b style="color:#34A853;">phê duyệt</b>.</p>`,
      `<p><b>Công ty:</b> ${company}<br><b>Tổng số tiền:</b> ${amount}<br><b>Người phê duyệt:</b> ${approvedBy || approverEmail}</p>`,
      signatureHtml,
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
    // Fix garbled UTF-8 in text fields
    const voucherType    = fixGarbledUtf8(voucher.voucherType || '');
    const company        = fixGarbledUtf8(voucher.company || '');
    const employee       = fixGarbledUtf8(voucher.employee || '');
    const amount         = voucher.amount        || '';
    const requestorEmail = voucher.requestorEmail|| '';
    const approverEmail  = voucher.approverEmail || '';
    const rejectReason   = fixGarbledUtf8(voucher.rejectReason || '');
    const rejectedBy     = fixGarbledUtf8(voucher.rejectedBy || approverEmail || 'Unknown');
    const approverSignature = voucher.approverSignature || ''; // Approver signature data

    Logger.log('Voucher Number: ' + voucherNumber);
    Logger.log('Voucher Type (fixed): ' + voucherType);
    Logger.log('Requestor Email: ' + requestorEmail);
    Logger.log('Approver Email: ' + approverEmail);
    Logger.log('Reject Reason (fixed): ' + rejectReason);
    Logger.log('Rejected By: ' + rejectedBy);
    Logger.log('Has Approver Signature: ' + (approverSignature ? 'Yes' : 'No'));

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

    // Include approver signature in meta data
    const meta = {
      approverSignature: approverSignature,
      rejectedAt: new Date().toISOString()
    };

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
      approverEmail,
      meta: meta
    });
    Logger.log('✅ History appended');

    // Build rejection email with approver signature if available
    let signatureHtml = '';
    if (approverSignature && approverSignature.startsWith('data:image')) {
      signatureHtml = `<p><b>Chữ ký người từ chối:</b></p><img src="${approverSignature}" style="max-height: 80px; max-width: 200px;" alt="Chữ ký">`;
    }

    const subject = encodeSubjectUtf8(`[TRẢ LẠI] Phiếu ${voucherType.toUpperCase()} - ${voucherNumber}`);
    const emailBodyHtml = [
      `<p>Kính gửi <b>${employee}</b>,</p>`,
      `<p>Phiếu <b>${voucherType}</b> số <b>${voucherNumber}</b> của bạn đã bị <b style="color:#EA4335;">trả lại / từ chối</b>.</p>`,
      `<p><b>Lý do:</b> ${rejectReason}</p>`,
      `<p><b>Công ty:</b> ${company}<br><b>Tổng số tiền:</b> ${amount}<br><b>Người trả lại:</b> ${rejectedBy}</p>`,
      signatureHtml,
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

function handleGetVoucherSummary(requestBody) {
  try {
    Logger.log('=== GET VOUCHER SUMMARY ===');
    Logger.log('Request body: ' + JSON.stringify(requestBody));
    Logger.log('VOUCHER_HISTORY_SHEET_ID: ' + VOUCHER_HISTORY_SHEET_ID);
    Logger.log('VH_SHEET_NAME: ' + VH_SHEET_NAME);
    
    // Get optional filter parameters
    const userEmail = requestBody ? (requestBody.userEmail || requestBody.email || '') : '';
    const employeeName = requestBody ? (requestBody.employee || requestBody.employeeName || '') : '';
    
    Logger.log('Filter by userEmail: ' + userEmail);
    Logger.log('Filter by employeeName: ' + employeeName);
    
    Logger.log('Attempting to get voucher history sheet...');
    let sheet;
    try {
      sheet = getVoucherHistorySheet_();
      Logger.log('✅ Sheet accessed successfully');
    } catch (sheetError) {
      Logger.log('❌ ERROR accessing sheet: ' + sheetError.toString());
      Logger.log('Sheet error stack: ' + (sheetError.stack || 'No stack'));
      return createResponse(false, 'Error accessing voucher history sheet: ' + sheetError.message);
    }
    
    if (!sheet) {
      Logger.log('❌ ERROR: Sheet is null');
      return createResponse(false, 'Voucher history sheet not found. Please run setupVoucherHistorySheet() first.');
    }
    
    Logger.log('Getting data range from sheet...');
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow <= 1) {
      // Only header row, no data
      return createResponse(true, 'No vouchers found', {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        recent: []
      });
    }
    
    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    Logger.log('Data rows retrieved: ' + data.length);
    
    // Get RichTextValues for attachments column (Column J = column 10, 1-based)
    const attachmentsColIndex = 10; // Column J
    let richTextValues = null;
    try {
      richTextValues = sheet.getRange(2, attachmentsColIndex, lastRow - 1, 1).getRichTextValues();
      Logger.log('RichTextValues retrieved for attachments column');
    } catch (rtError) {
      Logger.log('Could not get RichTextValues: ' + rtError);
    }
    
    // Skip header row
    const rows = data.slice(1);
    
    // Column indices (based on appendHistory_ function)
    // A:VoucherNumber, B:VoucherType, C:Company, D:Employee, E:Amount, 
    // F:Status, G:Action, H:By, I:Note, J:Attachments,
    // K:RequestorEmail, L:ApproverEmail, M:Timestamp, N:MetaJSON
    const idxVoucherNumber = 0;
    const idxVoucherType = 1;
    const idxCompany = 2;
    const idxEmployee = 3;
    const idxAmount = 4;
    const idxStatus = 5;
    const idxAction = 6;
    const idxBy = 7;
    const idxNote = 8;
    const idxAttachments = 9;  // Column J
    const idxRequestorEmail = 10;
    const idxApproverEmail = 11;
    const idxTimestamp = 12;
    
    // Helper function to get attachment URLs for a row (returns all URLs with names)
    function getAttachmentUrl(rowIndex) {
      let attachments = '';
      
      // Method 1: Try to get ALL URLs from RichTextValue runs (for multi-hyperlink cells)
      if (richTextValues && richTextValues[rowIndex] && richTextValues[rowIndex][0]) {
        const richText = richTextValues[rowIndex][0];
        const runs = richText.getRuns();
        const urlsWithNames = [];
        
        // Extract URLs and their display text from each run
        for (const run of runs) {
          const url = run.getLinkUrl();
          const text = run.getText().trim();
          if (url && url.startsWith('http')) {
            urlsWithNames.push(text + '|' + url);
          }
        }
        
        if (urlsWithNames.length > 0) {
          attachments = urlsWithNames.join('\n');
          Logger.log('Row ' + rowIndex + ' - Got ' + urlsWithNames.length + ' attachment(s)');
          return attachments;
        }
      }
      
      // Method 2: Try to get from cell note (for new uploads with folder URL)
      try {
        const note = sheet.getRange(rowIndex + 2, attachmentsColIndex).getNote();
        if (note && note.includes('FOLDER_URL:')) {
          const urlMatch = note.match(/FOLDER_URL:\s*(https?:\/\/[^\s\n]+)/);
          if (urlMatch) {
            attachments = 'Tài liệu đính kèm|' + urlMatch[1];
            return attachments;
          }
        }
      } catch (noteError) {
        // Ignore note read errors
      }
      
      // Method 3: Fall back to plain text value
      const cellValue = rows[rowIndex] && rows[rowIndex][idxAttachments];
      if (cellValue) {
        const textValue = cellValue.toString();
        if (textValue.includes('|') && textValue.startsWith('http')) {
          attachments = 'Tài liệu đính kèm|' + textValue.split('|')[0];
          return attachments;
        } else if (textValue.startsWith('http')) {
          attachments = 'Tài liệu đính kèm|' + textValue;
          return attachments;
        }
      }
      
      return attachments;
    }
    
    // Get unique vouchers (by voucher number)
    // Filter by user if provided
    const voucherMap = new Map();
    
    rows.forEach((row, rowIndex) => {
      // Safety check - skip rows with insufficient columns
      if (!row || row.length < 6) {
        Logger.log('⚠️ Skipping row with insufficient columns');
        return;
      }
      
      const voucherNumber = row[idxVoucherNumber];
      if (!voucherNumber) return;
      
      // Filter by user if provided
      if (userEmail || employeeName) {
        const rowEmail = row[idxRequestorEmail] || '';
        const rowEmployee = row[idxEmployee] || '';
        
        // Check if this row matches the filter
        const matchesEmail = !userEmail || rowEmail.toLowerCase().includes(userEmail.toLowerCase());
        const matchesEmployee = !employeeName || rowEmployee.toLowerCase().includes(employeeName.toLowerCase());
        
        if (!matchesEmail && !matchesEmployee) {
          return; // Skip this row if it doesn't match the filter
        }
      }
      
      // Keep the latest entry for each voucher
      if (!voucherMap.has(voucherNumber) || 
          new Date(row[idxTimestamp] || 0) > new Date(voucherMap.get(voucherNumber).row[idxTimestamp] || 0)) {
        voucherMap.set(voucherNumber, { row: row, rowIndex: rowIndex });
      }
    });
    
    // Calculate statistics
    let total = voucherMap.size;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    
    voucherMap.forEach(item => {
      const status = item.row[idxStatus];
      if (status === 'Pending') pending++;
      else if (status === 'Approved') approved++;
      else if (status === 'Rejected') rejected++;
    });
    
    // Get recent vouchers (last 15 entries, sorted by timestamp - showing ALL actions)
    // Create rows with their original index for RichText lookup
    const rowsWithIndex = rows.map((row, index) => ({ row, index }));
    
    const recentRows = rowsWithIndex
      .filter(item => item.row && item.row.length >= 6 && item.row[idxTimestamp])
      .sort((a, b) => {
        const dateA = new Date(a.row[idxTimestamp] || 0);
        const dateB = new Date(b.row[idxTimestamp] || 0);
        return dateB - dateA; // Descending order (newest first)
      })
      .slice(0, 15) // Show last 15 entries
      .map(item => {
        const row = item.row;
        const rowIndex = item.index;
        const voucherNumber = row[idxVoucherNumber];
        
        // Safety check - ensure row has enough columns
        if (!row || row.length < 6) {
          Logger.log('⚠️ Warning: Row has insufficient columns: ' + JSON.stringify(row));
          return null;
        }
        
        // Parse amount to number (handle string with currency symbols)
        let amountValue = row[idxAmount] || 0;
        if (typeof amountValue === 'string') {
          let cleanAmount = amountValue.replace(/[₫\s]/g, '');
          cleanAmount = cleanAmount.replace(/\./g, '').replace(/,/g, '');
          amountValue = parseFloat(cleanAmount) || 0;
        } else if (typeof amountValue !== 'number') {
          amountValue = 0;
        }
        
        // Get attachment URL (from RichText or plain text)
        const attachmentUrl = getAttachmentUrl(rowIndex);
        
        // Show actual status of THIS row (not latest status)
        return {
          voucherNumber: voucherNumber || '',
          voucherType: row[idxVoucherType] || '',
          company: row[idxCompany] || '',
          employee: row[idxEmployee] || '',
          amount: amountValue,
          status: row[idxStatus] || 'Pending',  // THIS row's status
          action: row[idxAction] || '',          // THIS row's action
          by: row[idxBy] || '',
          note: row[idxNote] || '',
          attachments: attachmentUrl,  // Column J - with proper URL extraction
          requestorEmail: row[idxRequestorEmail] || '',
          approverEmail: row[idxApproverEmail] || '',
          timestamp: formatTimestamp(row[idxTimestamp])
        };
      })
      .filter(item => item !== null); // Remove any null entries
    
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

/** ===================== GET VOUCHER HISTORY ===================== */

function handleGetVoucherHistory(requestBody) {
  try {
    Logger.log('=== GET VOUCHER HISTORY ===');
    Logger.log('Request body: ' + JSON.stringify(requestBody));
    
    const voucherNumber = requestBody ? (requestBody.voucherNumber || '') : '';
    
    if (!voucherNumber) {
      return createResponse(false, 'Voucher number is required');
    }
    
    const history = getVoucherHistory_(voucherNumber);
    
    // Format timestamps for display
    const formattedHistory = history.map(item => ({
      ...item,
      timestampFormatted: formatTimestamp(item.timestamp)
    }));
    
    Logger.log('Found ' + formattedHistory.length + ' history entries for voucher: ' + voucherNumber);
    
    return createResponse(true, 'History retrieved successfully', {
      voucherNumber: voucherNumber,
      history: formattedHistory,
      totalEntries: formattedHistory.length
    });
  } catch (error) {
    Logger.log('Error getting voucher history: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createResponse(false, 'Error getting history: ' + error.message);
  }
}

/** ===================== GET USER VOUCHERS ===================== */

function handleGetUserVouchers(requestBody) {
  try {
    Logger.log('=== GET USER VOUCHERS ===');
    Logger.log('Request body: ' + JSON.stringify(requestBody));
    
    const userEmail = requestBody ? (requestBody.userEmail || requestBody.email || '') : '';
    const employeeName = requestBody ? (requestBody.employee || requestBody.employeeName || '') : '';
    
    if (!userEmail && !employeeName) {
      return createResponse(false, 'User email or employee name is required');
    }
    
    const vouchers = getUserVouchers_(userEmail, employeeName);
    
    // Format timestamps and add status text
    const formattedVouchers = vouchers.map(voucher => ({
      ...voucher,
      timestampFormatted: formatTimestamp(voucher.timestamp),
      statusText: voucher.status === 'Pending' && voucher.action === 'Submit' ? 'Đã gửi thông tin' : voucher.status
    }));
    
    Logger.log('Found ' + formattedVouchers.length + ' vouchers for user: ' + (userEmail || employeeName));
    
    return createResponse(true, 'User vouchers retrieved successfully', {
      userEmail: userEmail,
      employeeName: employeeName,
      vouchers: formattedVouchers,
      total: formattedVouchers.length
    });
  } catch (error) {
    Logger.log('Error getting user vouchers: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createResponse(false, 'Error getting user vouchers: ' + error.message);
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

/**
 * Upload files to Google Drive folder
 * @param {Array} files - Array of file objects with {fileName, fileData (base64), mimeType}
 * @param {string} voucherNumber - Voucher number for subfolder organization
 * @returns {Array} Array of objects with {fileName, fileUrl, fileId}
 */
function uploadFilesToDrive_(files, voucherNumber) {
  try {
    Logger.log('=== UPLOAD FILES TO DRIVE ===');
    Logger.log('Voucher Number: ' + voucherNumber);
    Logger.log('Files to upload: ' + files.length);
    
    // Target folder ID for 01.Phieu_Thu_Chi
    const DRIVE_FOLDER_ID = '1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG';
    
    const parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Create subfolder for this voucher (or use existing)
    let voucherFolder;
    const folders = parentFolder.getFoldersByName(voucherNumber);
    if (folders.hasNext()) {
      voucherFolder = folders.next();
      Logger.log('Using existing voucher folder: ' + voucherNumber);
    } else {
      voucherFolder = parentFolder.createFolder(voucherNumber);
      Logger.log('Created new voucher folder: ' + voucherNumber);
    }
    
    const uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      Logger.log('Processing file ' + (i + 1) + ': ' + fileData.fileName);
      Logger.log('File mimeType: ' + fileData.mimeType);
      Logger.log('File size: ' + fileData.fileSize);
      Logger.log('fileData.fileData exists: ' + (fileData.fileData ? 'YES' : 'NO'));
      Logger.log('fileData.fileData length: ' + (fileData.fileData ? fileData.fileData.length : 0));
      
      try {
        // Validate fileData exists
        if (!fileData.fileData || fileData.fileData.length === 0) {
          throw new Error('No file data received for ' + fileData.fileName);
        }
        
        // Decode base64 data - handle both "data:mime;base64,xxx" and plain base64
        let base64Data = fileData.fileData;
        if (base64Data.indexOf(',') !== -1) {
          base64Data = base64Data.split(',')[1];
        }
        
        Logger.log('Base64 data length after split: ' + base64Data.length);
        
        // Check for valid base64
        if (!base64Data || base64Data.length < 10) {
          throw new Error('Invalid or empty base64 data');
        }
        
        const bytes = Utilities.base64Decode(base64Data);
        Logger.log('Decoded bytes length: ' + bytes.length);
        
        const blob = Utilities.newBlob(bytes, fileData.mimeType, fileData.fileName);
        
        // Upload to Drive
        const file = voucherFolder.createFile(blob);
        
        // Make file accessible to anyone with the link
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        const fileUrl = file.getUrl();
        const fileId = file.getId();
        
        Logger.log('✅ Uploaded: ' + fileData.fileName + ' -> ' + fileUrl);
        
        uploadedFiles.push({
          fileName: fileData.fileName,
          fileUrl: fileUrl,
          fileId: fileId,
          fileSize: fileData.fileSize || blob.getBytes().length
        });
        
      } catch (fileError) {
        Logger.log('❌ Error uploading file ' + fileData.fileName + ': ' + fileError.toString());
        Logger.log('❌ Error stack: ' + (fileError.stack || 'No stack'));
        // Continue with next file even if one fails
        uploadedFiles.push({
          fileName: fileData.fileName,
          fileUrl: 'ERROR: ' + fileError.message,
          fileId: null,
          error: true
        });
      }
    }
    
    Logger.log('Upload complete. Successful: ' + uploadedFiles.filter(f => !f.error).length + '/' + files.length);
    
    // Return both files and folder URL
    const folderUrl = voucherFolder.getUrl();
    Logger.log('Voucher folder URL: ' + folderUrl);
    
    return {
      files: uploadedFiles,
      folderUrl: folderUrl,
      folderName: voucherNumber
    };
    
  } catch (error) {
    Logger.log('❌ ERROR in uploadFilesToDrive_: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * UTILITY FUNCTION - Fix existing attachments data
 * This extracts URLs from RichTextValue runs and stores them in cell notes
 * Run this ONCE to fix existing data in the sheet
 */
function fixExistingAttachments() {
  try {
    Logger.log('=== FIX EXISTING ATTACHMENTS ===');
    
    const sheet = getVoucherHistorySheet_();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      Logger.log('No data rows to fix');
      return;
    }
    
    const attachmentsColIndex = 10; // Column J
    let fixedCount = 0;
    
    for (let row = 2; row <= lastRow; row++) {
      const cell = sheet.getRange(row, attachmentsColIndex);
      const richText = cell.getRichTextValue();
      
      if (!richText) continue;
      
      // Try to get URL from RichText runs
      const runs = richText.getRuns();
      let foundUrl = null;
      
      for (const run of runs) {
        const url = run.getLinkUrl();
        if (url && url.startsWith('http')) {
          foundUrl = url;
          break;
        }
      }
      
      // If we found a URL, store it in the cell note
      if (foundUrl) {
        const existingNote = cell.getNote() || '';
        if (!existingNote.includes('FOLDER_URL:')) {
          const fileName = richText.getText() || 'Files';
          cell.setNote('FOLDER_URL: ' + foundUrl + '\\nFILES: ' + fileName);
          fixedCount++;
          Logger.log('Row ' + row + ': Fixed attachment URL - ' + foundUrl);
        }
      }
    }
    
    Logger.log('Fixed ' + fixedCount + ' rows with attachment URLs');
    return fixedCount;
    
  } catch (error) {
    Logger.log('Error fixing attachments: ' + error.toString());
    throw error;
  }
}

/**
 * TEST FUNCTION - Run this to verify Drive access
 * Run from Apps Script Editor > Select this function > Run
 */
function testDriveAccess() {
  const DRIVE_FOLDER_ID = '1RBBUUAQIrYTWeBONIgkMtELL0hxZhtqG';
  
  try {
    Logger.log('=== TESTING DRIVE ACCESS ===');
    
    // Test 1: Can we access the folder?
    const parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    Logger.log('✅ Parent folder accessed: ' + parentFolder.getName());
    
    // Test 2: Can we create a test subfolder?
    const testFolderName = 'TEST-' + new Date().getTime();
    const testFolder = parentFolder.createFolder(testFolderName);
    Logger.log('✅ Created test folder: ' + testFolder.getName());
    
    // Test 3: Can we create a test file?
    const testBlob = Utilities.newBlob('Hello World', 'text/plain', 'test.txt');
    const testFile = testFolder.createFile(testBlob);
    testFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Logger.log('✅ Created test file: ' + testFile.getUrl());
    
    // Cleanup: Delete test folder
    testFolder.setTrashed(true);
    Logger.log('✅ Cleaned up test folder');
    
    Logger.log('=== ALL TESTS PASSED ===');
    return 'SUCCESS: Drive access working properly. Folder: ' + parentFolder.getName();
    
  } catch (error) {
    Logger.log('❌ DRIVE ACCESS ERROR: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return 'ERROR: ' + error.message;
  }
}

/**
 * TEST FUNCTION - Test base64 decoding
 */
function testBase64Decode() {
  try {
    // Small test string in base64
    const testBase64 = 'SGVsbG8gV29ybGQ='; // "Hello World"
    const bytes = Utilities.base64Decode(testBase64);
    const text = Utilities.newBlob(bytes).getDataAsString();
    Logger.log('Decoded text: ' + text);
    Logger.log('✅ Base64 decoding works');
    return 'SUCCESS: ' + text;
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return 'ERROR: ' + error.message;
  }
}
