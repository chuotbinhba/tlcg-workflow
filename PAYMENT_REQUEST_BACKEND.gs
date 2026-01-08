/**
 * PAYMENT REQUEST WORKFLOW BACKEND
 * Google Apps Script for handling Payment Request (Đề nghị mua hàng) workflow
 * 
 * Features:
 * - Submit payment requests
 * - Multi-stage approval workflow (Budget, Supplier, Legal, Accounting, Director, Final)
 * - Email notifications with signatures
 * - History tracking
 * - File attachments via Google Drive
 * - Duplicate prevention
 * 
 * Version: 1.0
 * Created: January 2026
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  SPREADSHEET_ID: '1ujmPbtEdkGLgEshfhvV8gRB6R0GLI31jsZM5rDOJS0g', // TLCG_Master Data
  SHEET_NAME: 'Payment_Request_History', // Main sheet for storing all payment requests
  SUPPLIERS_SHEET_NAME: 'Nhà cung cấp', // Existing suppliers sheet
  DRIVE_FOLDER_NAME: 'Payment Request Attachments',
  
  // Column indices for Payment_Request_History sheet
  COLUMNS: {
    REQUEST_ID: 0,
    REQUEST_DATE: 1,
    COMPANY: 2,
    REQUESTOR: 3,
    REQUESTOR_EMAIL: 4,
    DEPARTMENT: 5,
    PURCHASE_TYPE: 6,
    PR_REQUEST_NO: 7,
    PURPOSE: 8,
    SUPPLIER: 9,
    RECIPIENT: 10,
    PRODUCT_ITEMS: 11, // JSON
    TOTAL_AMOUNT: 12,
    PAYMENT_TYPE: 13,
    PAYMENT_PHASES: 14, // JSON
    BUDGET_APPROVER: 15,
    BUDGET_STATUS: 16,
    BUDGET_SIGNATURE: 17,
    SUPPLIER_APPROVER: 18,
    SUPPLIER_STATUS: 19,
    SUPPLIER_SIGNATURE: 20,
    LEGAL_APPROVER: 21,
    LEGAL_STATUS: 22,
    LEGAL_SIGNATURE: 23,
    ACCOUNTING_APPROVER: 24,
    ACCOUNTING_STATUS: 25,
    ACCOUNTING_SIGNATURE: 26,
    DIRECTOR_APPROVER: 27,
    DIRECTOR_STATUS: 28,
    DIRECTOR_SIGNATURE: 29,
    FINAL_APPROVER: 30,
    FINAL_STATUS: 31,
    FINAL_SIGNATURE: 32,
    OVERALL_STATUS: 33,
    SUBMITTED_AT: 34,
    METADATA: 35 // JSON for additional data
  }
};

// ==================== MAIN HANDLERS ====================

function doPost(e) {
  try {
    Logger.log('[Payment Request] Received POST request');
    
    // Parse request data
    let data;
    try {
      const contentType = e.postData.type;
      
      if (contentType === 'application/x-www-form-urlencoded') {
        const params = parseUrlEncodedData(e.postData.contents);
        data = params.data ? JSON.parse(params.data) : params;
      } else {
        data = JSON.parse(e.postData.contents);
      }
    } catch (parseError) {
      Logger.log('[Payment Request] Parse error: ' + parseError.message);
      return createResponse(false, 'Lỗi parse dữ liệu: ' + parseError.message);
    }
    
    const action = data.action;
    Logger.log('[Payment Request] Action: ' + action);
    
    // Route to appropriate handler
    switch (action) {
      case 'submitPaymentRequest':
      case 'sendPaymentRequest':
        return handleSendPaymentRequest(data);
      case 'approvePaymentRequest':
        return handleApprovePaymentRequest(data);
      case 'rejectPaymentRequest':
        return handleRejectPaymentRequest(data);
      case 'getPaymentRequestHistory':
      case 'getRecentPaymentRequests':
        return handleGetPaymentRequestHistory(data);
      case 'getPaymentRequestDetails':
        return handleGetPaymentRequestDetails(data);
      case 'getSuppliers':
        return handleGetSuppliers(data);
      case 'addSupplier':
        return handleAddSupplier(data);
      default:
        return createResponse(false, 'Invalid action: ' + action);
    }
    
  } catch (error) {
    Logger.log('[Payment Request] Error in doPost: ' + error.message);
    Logger.log('[Payment Request] Stack trace: ' + error.stack);
    return createResponse(false, 'Lỗi server: ' + error.message);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const requestId = e.parameter.requestId;
    
    Logger.log('[Payment Request] GET request - Action: ' + action + ', RequestId: ' + requestId);
    
    if (action === 'getPaymentRequestDetails' && requestId) {
      return handleGetPaymentRequestDetails({ requestId: requestId });
    }
    
    return createResponse(false, 'Invalid GET request');
    
  } catch (error) {
    Logger.log('[Payment Request] Error in doGet: ' + error.message);
    return createResponse(false, 'Lỗi server: ' + error.message);
  }
}

// ==================== SUBMIT PAYMENT REQUEST ====================

function handleSendPaymentRequest(data) {
  try {
    Logger.log('[Payment Request] Processing submission...');
    
    // Validate required fields
    const validation = validatePaymentRequest(data);
    if (!validation.valid) {
      return createResponse(false, 'Validation error: ' + validation.errors.join(', '));
    }
    
    // Get or create sheet
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
    
    // Check for duplicate
    if (findRequestByIdInSheet(sheet, data.requestId)) {
      return createResponse(false, 'Request ID already exists: ' + data.requestId);
    }
    
    // Store file attachments in Google Drive
    const productItemsWithFiles = storeProductAttachments(data.productItems, data.requestId);
    const paymentPhasesWithFiles = storePaymentPhaseAttachments(data.paymentPhases, data.requestId);
    const contractFiles = storeContractAttachments(data.contractAttachments, data.requestId);
    
    // Store signatures in Google Drive
    const requesterSignature = data.requesterSignature ? 
      storeSignature(data.requesterSignature, data.requestId, 'requester') : '';
    
    // Prepare row data
    const rowData = new Array(36).fill('');
    rowData[CONFIG.COLUMNS.REQUEST_ID] = data.requestId;
    rowData[CONFIG.COLUMNS.REQUEST_DATE] = data.requestDate;
    rowData[CONFIG.COLUMNS.COMPANY] = data.company;
    rowData[CONFIG.COLUMNS.REQUESTOR] = data.requestor;
    rowData[CONFIG.COLUMNS.REQUESTOR_EMAIL] = data.requestorEmail;
    rowData[CONFIG.COLUMNS.DEPARTMENT] = data.department;
    rowData[CONFIG.COLUMNS.PURCHASE_TYPE] = data.purchaseType;
    rowData[CONFIG.COLUMNS.PR_REQUEST_NO] = data.prRequestNo;
    rowData[CONFIG.COLUMNS.PURPOSE] = data.purpose;
    rowData[CONFIG.COLUMNS.SUPPLIER] = data.supplier;
    rowData[CONFIG.COLUMNS.RECIPIENT] = data.recipient;
    rowData[CONFIG.COLUMNS.PRODUCT_ITEMS] = JSON.stringify(productItemsWithFiles);
    rowData[CONFIG.COLUMNS.TOTAL_AMOUNT] = data.totalAmount;
    rowData[CONFIG.COLUMNS.PAYMENT_TYPE] = data.paymentType;
    rowData[CONFIG.COLUMNS.PAYMENT_PHASES] = JSON.stringify(paymentPhasesWithFiles);
    rowData[CONFIG.COLUMNS.BUDGET_APPROVER] = data.budgetApprover;
    rowData[CONFIG.COLUMNS.BUDGET_STATUS] = 'Pending';
    rowData[CONFIG.COLUMNS.SUPPLIER_APPROVER] = data.supplierApprover;
    rowData[CONFIG.COLUMNS.SUPPLIER_STATUS] = 'Pending';
    rowData[CONFIG.COLUMNS.LEGAL_APPROVER] = data.legalApprover || '';
    rowData[CONFIG.COLUMNS.LEGAL_STATUS] = data.legalApprover ? 'Pending' : 'N/A';
    rowData[CONFIG.COLUMNS.ACCOUNTING_APPROVER] = data.accountingApprover;
    rowData[CONFIG.COLUMNS.ACCOUNTING_STATUS] = 'Pending';
    rowData[CONFIG.COLUMNS.DIRECTOR_APPROVER] = data.directorApprover;
    rowData[CONFIG.COLUMNS.DIRECTOR_STATUS] = 'Pending';
    rowData[CONFIG.COLUMNS.FINAL_APPROVER] = data.finalApprover;
    rowData[CONFIG.COLUMNS.FINAL_STATUS] = 'Pending';
    rowData[CONFIG.COLUMNS.OVERALL_STATUS] = 'Pending';
    rowData[CONFIG.COLUMNS.SUBMITTED_AT] = new Date().toISOString();
    
    // Store metadata
    const metadata = {
      requesterSignature: requesterSignature,
      contractFiles: contractFiles,
      currency: data.currency,
      paymentInfo: data.paymentInfo,
      poRequestNo: data.poRequestNo,
      dueDate: data.dueDate,
      amountInWords: data.amountInWords,
      implementationTime: data.implementationTime,
      legalComment: data.legalComment || '',
      accountingComment: data.accountingComment || '',
      directorComment: data.directorComment || ''
    };
    rowData[CONFIG.COLUMNS.METADATA] = JSON.stringify(metadata);
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    Logger.log('[Payment Request] Saved to sheet successfully');
    
    // Add to history
    appendHistory(data.requestId, 'Submitted', data.requestor, 'Request submitted for approval');
    
    // Send email notifications to all approvers
    sendApprovalEmails(data, requesterSignature);
    
    return createResponse(true, 'Payment request submitted successfully', {
      requestId: data.requestId
    });
    
  } catch (error) {
    Logger.log('[Payment Request] Error in handleSendPaymentRequest: ' + error.message);
    Logger.log('[Payment Request] Stack: ' + error.stack);
    return createResponse(false, 'Lỗi khi lưu đề nghị: ' + error.message);
  }
}

// ==================== APPROVE PAYMENT REQUEST ====================

function handleApprovePaymentRequest(data) {
  try {
    Logger.log('[Payment Request] Processing approval...');
    Logger.log('[Payment Request] Request ID: ' + data.requestId);
    Logger.log('[Payment Request] Approver: ' + data.approver);
    Logger.log('[Payment Request] Stage: ' + data.stage);
    
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
    const rowIndex = findRequestByIdInSheet(sheet, data.requestId);
    
    if (rowIndex === -1) {
      return createResponse(false, 'Request not found: ' + data.requestId);
    }
    
    const row = sheet.getRange(rowIndex, 1, 1, 36).getValues()[0];
    
    // Determine which approval stage
    let statusCol, signatureCol, approverCol, stageName;
    
    switch (data.stage) {
      case 'budget':
        statusCol = CONFIG.COLUMNS.BUDGET_STATUS;
        signatureCol = CONFIG.COLUMNS.BUDGET_SIGNATURE;
        approverCol = CONFIG.COLUMNS.BUDGET_APPROVER;
        stageName = 'Budget Approval';
        break;
      case 'supplier':
        statusCol = CONFIG.COLUMNS.SUPPLIER_STATUS;
        signatureCol = CONFIG.COLUMNS.SUPPLIER_SIGNATURE;
        approverCol = CONFIG.COLUMNS.SUPPLIER_APPROVER;
        stageName = 'Supplier Approval';
        break;
      case 'legal':
        statusCol = CONFIG.COLUMNS.LEGAL_STATUS;
        signatureCol = CONFIG.COLUMNS.LEGAL_SIGNATURE;
        approverCol = CONFIG.COLUMNS.LEGAL_APPROVER;
        stageName = 'Legal Approval';
        break;
      case 'accounting':
        statusCol = CONFIG.COLUMNS.ACCOUNTING_STATUS;
        signatureCol = CONFIG.COLUMNS.ACCOUNTING_SIGNATURE;
        approverCol = CONFIG.COLUMNS.ACCOUNTING_APPROVER;
        stageName = 'Accounting Approval';
        break;
      case 'director':
        statusCol = CONFIG.COLUMNS.DIRECTOR_STATUS;
        signatureCol = CONFIG.COLUMNS.DIRECTOR_SIGNATURE;
        approverCol = CONFIG.COLUMNS.DIRECTOR_APPROVER;
        stageName = 'Director Approval';
        break;
      case 'final':
        statusCol = CONFIG.COLUMNS.FINAL_STATUS;
        signatureCol = CONFIG.COLUMNS.FINAL_SIGNATURE;
        approverCol = CONFIG.COLUMNS.FINAL_APPROVER;
        stageName = 'Final Approval';
        break;
      default:
        return createResponse(false, 'Invalid approval stage: ' + data.stage);
    }
    
    // Check current status
    const currentStatus = row[statusCol];
    if (currentStatus === 'Approved') {
      return createResponse(false, stageName + ' already approved. Cannot approve again.');
    }
    if (currentStatus === 'Rejected') {
      return createResponse(false, stageName + ' already rejected. Cannot approve.');
    }
    
    // Validate signature
    if (!data.signature) {
      return createResponse(false, 'Signature is required for approval');
    }
    
    // Store signature
    const signatureUrl = storeSignature(data.signature, data.requestId, data.stage + '_approver');
    
    // Update status and signature
    sheet.getRange(rowIndex, statusCol + 1).setValue('Approved');
    sheet.getRange(rowIndex, signatureCol + 1).setValue(signatureUrl);
    
    // Check if all required approvals are complete
    const allApproved = checkAllApprovalsComplete(sheet, rowIndex);
    if (allApproved) {
      sheet.getRange(rowIndex, CONFIG.COLUMNS.OVERALL_STATUS + 1).setValue('Approved');
    }
    
    // Add to history
    appendHistory(data.requestId, 'Approved', data.approver, stageName + ' approved');
    
    // Send notification to requester
    sendApprovalNotification(row, data.approver, stageName, 'approved', data.comment);
    
    Logger.log('[Payment Request] Approval processed successfully');
    
    return createResponse(true, stageName + ' approved successfully');
    
  } catch (error) {
    Logger.log('[Payment Request] Error in handleApprovePaymentRequest: ' + error.message);
    return createResponse(false, 'Lỗi khi phê duyệt: ' + error.message);
  }
}

// ==================== REJECT PAYMENT REQUEST ====================

function handleRejectPaymentRequest(data) {
  try {
    Logger.log('[Payment Request] Processing rejection...');
    
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
    const rowIndex = findRequestByIdInSheet(sheet, data.requestId);
    
    if (rowIndex === -1) {
      return createResponse(false, 'Request not found: ' + data.requestId);
    }
    
    const row = sheet.getRange(rowIndex, 1, 1, 36).getValues()[0];
    
    // Determine which approval stage
    let statusCol, stageName;
    
    switch (data.stage) {
      case 'budget':
        statusCol = CONFIG.COLUMNS.BUDGET_STATUS;
        stageName = 'Budget Approval';
        break;
      case 'supplier':
        statusCol = CONFIG.COLUMNS.SUPPLIER_STATUS;
        stageName = 'Supplier Approval';
        break;
      case 'legal':
        statusCol = CONFIG.COLUMNS.LEGAL_STATUS;
        stageName = 'Legal Approval';
        break;
      case 'accounting':
        statusCol = CONFIG.COLUMNS.ACCOUNTING_STATUS;
        stageName = 'Accounting Approval';
        break;
      case 'director':
        statusCol = CONFIG.COLUMNS.DIRECTOR_STATUS;
        stageName = 'Director Approval';
        break;
      case 'final':
        statusCol = CONFIG.COLUMNS.FINAL_STATUS;
        stageName = 'Final Approval';
        break;
      default:
        return createResponse(false, 'Invalid approval stage: ' + data.stage);
    }
    
    // Check current status
    const currentStatus = row[statusCol];
    if (currentStatus === 'Rejected') {
      return createResponse(false, stageName + ' already rejected. Cannot reject again.');
    }
    if (currentStatus === 'Approved') {
      return createResponse(false, stageName + ' already approved. Cannot reject.');
    }
    
    // Update status
    sheet.getRange(rowIndex, statusCol + 1).setValue('Rejected');
    sheet.getRange(rowIndex, CONFIG.COLUMNS.OVERALL_STATUS + 1).setValue('Rejected');
    
    // Add to history
    const reason = data.rejectReason || 'No reason provided';
    appendHistory(data.requestId, 'Rejected', data.approver, stageName + ' rejected: ' + reason);
    
    // Send notification to requester
    sendApprovalNotification(row, data.approver, stageName, 'rejected', reason);
    
    Logger.log('[Payment Request] Rejection processed successfully');
    
    return createResponse(true, stageName + ' rejected successfully');
    
  } catch (error) {
    Logger.log('[Payment Request] Error in handleRejectPaymentRequest: ' + error.message);
    return createResponse(false, 'Lỗi khi từ chối: ' + error.message);
  }
}

// ==================== GET HISTORY ====================

function handleGetPaymentRequestHistory(data) {
  try {
    const historySheet = getOrCreateSheet(CONFIG.SHEET_NAME);
    const dataRange = historySheet.getDataRange();
    
    if (dataRange.getNumRows() <= 1) {
      return createResponse(true, 'No history found', { history: [] });
    }
    
    const values = dataRange.getValues();
    const history = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] === data.requestId) {
        history.push({
          requestId: row[0],
          timestamp: row[1],
          action: row[2],
          actor: row[3],
          note: row[4]
        });
      }
    }
    
    return createResponse(true, 'History retrieved successfully', { history: history });
    
  } catch (error) {
    Logger.log('[Payment Request] Error in handleGetPaymentRequestHistory: ' + error.message);
    return createResponse(false, 'Lỗi khi lấy lịch sử: ' + error.message);
  }
}

// ==================== GET REQUEST DETAILS ====================

function handleGetPaymentRequestDetails(data) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
    const rowIndex = findRequestByIdInSheet(sheet, data.requestId);
    
    if (rowIndex === -1) {
      return createResponse(false, 'Request not found: ' + data.requestId);
    }
    
    const row = sheet.getRange(rowIndex, 1, 1, 36).getValues()[0];
    
    const details = {
      requestId: row[CONFIG.COLUMNS.REQUEST_ID],
      requestDate: row[CONFIG.COLUMNS.REQUEST_DATE],
      company: row[CONFIG.COLUMNS.COMPANY],
      requestor: row[CONFIG.COLUMNS.REQUESTOR],
      requestorEmail: row[CONFIG.COLUMNS.REQUESTOR_EMAIL],
      department: row[CONFIG.COLUMNS.DEPARTMENT],
      purchaseType: row[CONFIG.COLUMNS.PURCHASE_TYPE],
      prRequestNo: row[CONFIG.COLUMNS.PR_REQUEST_NO],
      purpose: row[CONFIG.COLUMNS.PURPOSE],
      supplier: row[CONFIG.COLUMNS.SUPPLIER],
      recipient: row[CONFIG.COLUMNS.RECIPIENT],
      productItems: JSON.parse(row[CONFIG.COLUMNS.PRODUCT_ITEMS] || '[]'),
      totalAmount: row[CONFIG.COLUMNS.TOTAL_AMOUNT],
      paymentType: row[CONFIG.COLUMNS.PAYMENT_TYPE],
      paymentPhases: JSON.parse(row[CONFIG.COLUMNS.PAYMENT_PHASES] || '[]'),
      budgetApprover: row[CONFIG.COLUMNS.BUDGET_APPROVER],
      budgetStatus: row[CONFIG.COLUMNS.BUDGET_STATUS],
      budgetSignature: row[CONFIG.COLUMNS.BUDGET_SIGNATURE],
      supplierApprover: row[CONFIG.COLUMNS.SUPPLIER_APPROVER],
      supplierStatus: row[CONFIG.COLUMNS.SUPPLIER_STATUS],
      supplierSignature: row[CONFIG.COLUMNS.SUPPLIER_SIGNATURE],
      legalApprover: row[CONFIG.COLUMNS.LEGAL_APPROVER],
      legalStatus: row[CONFIG.COLUMNS.LEGAL_STATUS],
      legalSignature: row[CONFIG.COLUMNS.LEGAL_SIGNATURE],
      accountingApprover: row[CONFIG.COLUMNS.ACCOUNTING_APPROVER],
      accountingStatus: row[CONFIG.COLUMNS.ACCOUNTING_STATUS],
      accountingSignature: row[CONFIG.COLUMNS.ACCOUNTING_SIGNATURE],
      directorApprover: row[CONFIG.COLUMNS.DIRECTOR_APPROVER],
      directorStatus: row[CONFIG.COLUMNS.DIRECTOR_STATUS],
      directorSignature: row[CONFIG.COLUMNS.DIRECTOR_SIGNATURE],
      finalApprover: row[CONFIG.COLUMNS.FINAL_APPROVER],
      finalStatus: row[CONFIG.COLUMNS.FINAL_STATUS],
      finalSignature: row[CONFIG.COLUMNS.FINAL_SIGNATURE],
      overallStatus: row[CONFIG.COLUMNS.OVERALL_STATUS],
      submittedAt: row[CONFIG.COLUMNS.SUBMITTED_AT],
      metadata: JSON.parse(row[CONFIG.COLUMNS.METADATA] || '{}')
    };
    
    return createResponse(true, 'Request details retrieved successfully', { details: details });
    
  } catch (error) {
    Logger.log('[Payment Request] Error in handleGetPaymentRequestDetails: ' + error.message);
    return createResponse(false, 'Lỗi khi lấy chi tiết: ' + error.message);
  }
}

// ==================== HELPER FUNCTIONS ====================

function validatePaymentRequest(data) {
  const errors = [];
  
  if (!data.requestId) errors.push('Request ID is required');
  if (!data.company) errors.push('Company is required');
  if (!data.requestor) errors.push('Requestor is required');
  if (!data.purchaseType) errors.push('Purchase type is required');
  if (!data.supplier) errors.push('Supplier is required');
  if (!data.budgetApprover) errors.push('Budget approver is required');
  if (!data.supplierApprover) errors.push('Supplier approver is required');
  if (!data.finalApprover) errors.push('Final approver is required');
  
  if (!data.productItems || data.productItems.length === 0) {
    errors.push('At least one product item is required');
  }
  
  if (!data.paymentPhases || data.paymentPhases.length === 0) {
    errors.push('At least one payment phase is required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function checkAllApprovalsComplete(sheet, rowIndex) {
  const row = sheet.getRange(rowIndex, 1, 1, 36).getValues()[0];
  
  const budgetStatus = row[CONFIG.COLUMNS.BUDGET_STATUS];
  const supplierStatus = row[CONFIG.COLUMNS.SUPPLIER_STATUS];
  const legalStatus = row[CONFIG.COLUMNS.LEGAL_STATUS];
  const accountingStatus = row[CONFIG.COLUMNS.ACCOUNTING_STATUS];
  const directorStatus = row[CONFIG.COLUMNS.DIRECTOR_STATUS];
  const finalStatus = row[CONFIG.COLUMNS.FINAL_STATUS];
  
  // Check required approvals
  if (budgetStatus !== 'Approved') return false;
  if (supplierStatus !== 'Approved') return false;
  if (accountingStatus !== 'Approved') return false;
  if (directorStatus !== 'Approved') return false;
  if (finalStatus !== 'Approved') return false;
  
  // Legal approval is optional (check if approver is assigned)
  if (row[CONFIG.COLUMNS.LEGAL_APPROVER] && legalStatus !== 'Approved') return false;
  
  return true;
}

function storeProductAttachments(productItems, requestId) {
  if (!productItems) return [];
  
  return productItems.map((item, index) => {
    const itemCopy = { ...item };
    if (item.attachments && item.attachments.length > 0) {
      itemCopy.attachmentUrls = item.attachments.map((file, fileIndex) => {
        return storeFileInDrive(file, requestId, `product_${index}_${fileIndex}`);
      });
    }
    delete itemCopy.attachments; // Remove base64 data
    return itemCopy;
  });
}

function storePaymentPhaseAttachments(paymentPhases, requestId) {
  if (!paymentPhases) return [];
  
  return paymentPhases.map((phase, index) => {
    const phaseCopy = { ...phase };
    
    if (phase.acceptanceMinutes && phase.acceptanceMinutes.length > 0) {
      phaseCopy.acceptanceMinutesUrls = phase.acceptanceMinutes.map((file, fileIndex) => {
        return storeFileInDrive(file, requestId, `phase_${index}_acceptance_${fileIndex}`);
      });
      delete phaseCopy.acceptanceMinutes;
    }
    
    if (phase.supplierPaymentRequest && phase.supplierPaymentRequest.length > 0) {
      phaseCopy.supplierPaymentRequestUrls = phase.supplierPaymentRequest.map((file, fileIndex) => {
        return storeFileInDrive(file, requestId, `phase_${index}_supplier_${fileIndex}`);
      });
      delete phaseCopy.supplierPaymentRequest;
    }
    
    if (phase.invoice && phase.invoice.length > 0) {
      phaseCopy.invoiceUrls = phase.invoice.map((file, fileIndex) => {
        return storeFileInDrive(file, requestId, `phase_${index}_invoice_${fileIndex}`);
      });
      delete phaseCopy.invoice;
    }
    
    return phaseCopy;
  });
}

function storeContractAttachments(contractAttachments, requestId) {
  if (!contractAttachments || contractAttachments.length === 0) return [];
  
  return contractAttachments.map((file, index) => {
    return storeFileInDrive(file, requestId, `contract_${index}`);
  });
}

function storeFileInDrive(fileData, requestId, fileName) {
  try {
    const folder = getOrCreateFolder(CONFIG.DRIVE_FOLDER_NAME);
    const requestFolder = getOrCreateFolder(requestId, folder);
    
    // If fileData is base64
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const base64Data = fileData.split(',')[1];
      const mimeType = fileData.split(';')[0].split(':')[1];
      const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
      const file = requestFolder.createFile(blob);
      return file.getUrl();
    }
    
    // If fileData is object with name and data
    if (fileData.data) {
      const base64Data = fileData.data.split(',')[1];
      const mimeType = fileData.data.split(';')[0].split(':')[1];
      const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileData.name || fileName);
      const file = requestFolder.createFile(blob);
      return file.getUrl();
    }
    
    return '';
  } catch (error) {
    Logger.log('[Payment Request] Error storing file: ' + error.message);
    return '';
  }
}

function storeSignature(signatureData, requestId, signatureType) {
  try {
    if (!signatureData) return '';
    
    const folder = getOrCreateFolder(CONFIG.DRIVE_FOLDER_NAME);
    const requestFolder = getOrCreateFolder(requestId, folder);
    
    const base64Data = signatureData.split(',')[1];
    const mimeType = signatureData.split(';')[0].split(':')[1];
    const fileName = `signature_${signatureType}_${new Date().getTime()}.png`;
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
    const file = requestFolder.createFile(blob);
    
    return file.getUrl();
  } catch (error) {
    Logger.log('[Payment Request] Error storing signature: ' + error.message);
    return '';
  }
}

function sendApprovalEmails(data, requesterSignatureUrl) {
  try {
    const approvers = [
      { name: data.budgetApprover, email: data.budgetApproverEmail, stage: 'budget' },
      { name: data.supplierApprover, email: data.supplierApproverEmail, stage: 'supplier' },
      { name: data.legalApprover, email: data.legalApproverEmail, stage: 'legal' },
      { name: data.accountingApprover, email: data.accountingApproverEmail, stage: 'accounting' },
      { name: data.directorApprover, email: data.directorApproverEmail, stage: 'director' },
      { name: data.finalApprover, email: data.finalApproverEmail, stage: 'final' }
    ].filter(a => a.email);
    
    const baseUrl = 'https://workflow.egg-ventures.com';
    const approveUrl = `${baseUrl}/approve_payment_request.html?requestId=${data.requestId}`;
    const rejectUrl = `${baseUrl}/reject_payment_request.html?requestId=${data.requestId}`;
    
    const subject = `[ĐỀ NGHỊ MUA HÀNG] Yêu cầu phê duyệt - ${data.requestId}`;
    
    const emailBody = `
      <p>Kính gửi các cấp quản lý,</p>
      <p>Đề nghị mua hàng số <b>${data.requestId}</b> đã được tạo và đang chờ phê duyệt.</p>
      
      <h3>Thông tin chung:</h3>
      <ul>
        <li><b>Số đề nghị:</b> ${data.requestId}</li>
        <li><b>Ngày lập:</b> ${data.requestDate}</li>
        <li><b>Công ty:</b> ${data.company}</li>
        <li><b>Người đề nghị:</b> ${data.requestor} (${data.requestorEmail})</li>
        <li><b>Bộ phận:</b> ${data.department}</li>
      </ul>
      
      <h3>Đề nghị mua hàng:</h3>
      <ul>
        <li><b>Loại:</b> ${data.purchaseType}</li>
        <li><b>Số PR:</b> ${data.prRequestNo}</li>
        <li><b>Mục đích:</b> ${data.purpose}</li>
        <li><b>Nhà cung cấp:</b> ${data.supplier}</li>
        <li><b>Người nhận:</b> ${data.recipient}</li>
        <li><b>Tổng số tiền:</b> ${data.totalAmount}</li>
      </ul>
      
      <h3>Hành động:</h3>
      <p>
        <a href="${approveUrl}" style="background-color: #34A853; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Phê duyệt</a>
        <a href="${rejectUrl}" style="background-color: #EA4335; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Từ chối</a>
      </p>
      
      <p>Trân trọng,<br>Hệ thống Workflow TLC Group</p>
    `;
    
    approvers.forEach(approver => {
      try {
        GmailApp.sendEmail(approver.email, subject, '', {
          htmlBody: emailBody,
          replyTo: data.requestorEmail,
          name: 'TLC Group Workflow'
        });
        Logger.log('[Payment Request] Email sent to: ' + approver.email);
      } catch (emailError) {
        Logger.log('[Payment Request] Error sending email to ' + approver.email + ': ' + emailError.message);
      }
    });
    
  } catch (error) {
    Logger.log('[Payment Request] Error in sendApprovalEmails: ' + error.message);
  }
}

function sendApprovalNotification(row, approver, stage, action, comment) {
  try {
    const requestorEmail = row[CONFIG.COLUMNS.REQUESTOR_EMAIL];
    const requestId = row[CONFIG.COLUMNS.REQUEST_ID];
    const requestor = row[CONFIG.COLUMNS.REQUESTOR];
    
    if (!requestorEmail) return;
    
    const subject = `[ĐỀ NGHỊ MUA HÀNG] ${stage} ${action === 'approved' ? 'đã phê duyệt' : 'đã từ chối'} - ${requestId}`;
    
    const emailBody = `
      <p>Kính gửi ${requestor},</p>
      <p>Đề nghị mua hàng số <b>${requestId}</b> của bạn đã được ${action === 'approved' ? 'phê duyệt' : 'từ chối'} bởi ${approver} tại giai đoạn <b>${stage}</b>.</p>
      
      ${comment ? `<p><b>Nhận xét:</b> ${comment}</p>` : ''}
      
      <p>Vui lòng truy cập hệ thống để xem chi tiết.</p>
      
      <p>Trân trọng,<br>Hệ thống Workflow TLC Group</p>
    `;
    
    GmailApp.sendEmail(requestorEmail, subject, '', {
      htmlBody: emailBody,
      name: 'TLC Group Workflow'
    });
    
    Logger.log('[Payment Request] Notification sent to requester: ' + requestorEmail);
    
  } catch (error) {
    Logger.log('[Payment Request] Error sending notification: ' + error.message);
  }
}

function appendHistory(requestId, action, actor, note) {
  try {
    const historySheet = getOrCreateSheet(CONFIG.SHEET_NAME);
    
    // Create header if sheet is empty
    if (historySheet.getLastRow() === 0) {
      historySheet.appendRow(['Request ID', 'Timestamp', 'Action', 'Actor', 'Note']);
    }
    
    historySheet.appendRow([
      requestId,
      new Date().toISOString(),
      action,
      actor,
      note
    ]);
    
  } catch (error) {
    Logger.log('[Payment Request] Error appending history: ' + error.message);
  }
}

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // Create headers based on sheet type
    if (sheetName === CONFIG.SHEET_NAME) {
      const headers = [
        'Request ID', 'Request Date', 'Company', 'Requestor', 'Requestor Email', 'Department',
        'Purchase Type', 'PR Request No', 'Purpose', 'Supplier', 'Recipient',
        'Product Items (JSON)', 'Total Amount', 'Payment Type', 'Payment Phases (JSON)',
        'Budget Approver', 'Budget Status', 'Budget Signature',
        'Supplier Approver', 'Supplier Status', 'Supplier Signature',
        'Legal Approver', 'Legal Status', 'Legal Signature',
        'Accounting Approver', 'Accounting Status', 'Accounting Signature',
        'Director Approver', 'Director Status', 'Director Signature',
        'Final Approver', 'Final Status', 'Final Signature',
        'Overall Status', 'Submitted At', 'Metadata (JSON)'
      ];
      sheet.appendRow(headers);
    } else if (sheetName === CONFIG.SHEET_NAME) {
      // Payment_Request_History sheet - will be created manually by user
      // Header row should already exist
    }
  }
  
  return sheet;
}

function getOrCreateFolder(folderName, parentFolder) {
  const parent = parentFolder || DriveApp.getRootFolder();
  const folders = parent.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parent.createFolder(folderName);
  }
}

function findRequestByIdInSheet(sheet, requestId) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === requestId) {
      return i + 1; // Return 1-based row index
    }
  }
  
  return -1;
}

function parseUrlEncodedData(contents) {
  const params = {};
  const pairs = contents.split('&');
  
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    const key = decodeURIComponent(pair[0]);
    const value = decodeURIComponent(pair[1] || '');
    params[key] = value;
  }
  
  return params;
}

function createResponse(success, message, data = {}) {
  const response = {
    success: success,
    message: message,
    ...data
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== SUPPLIER MANAGEMENT ====================

/**
 * Get all suppliers from "Nhà cung cấp" sheet
 */
function handleGetSuppliers(data) {
  try {
    Logger.log('[Payment Request] Getting suppliers from "Nhà cung cấp" sheet');
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const suppliersSheet = ss.getSheetByName(CONFIG.SUPPLIERS_SHEET_NAME);
    
    if (!suppliersSheet) {
      Logger.log('[Payment Request] Sheet "Nhà cung cấp" not found');
      return createResponse(false, 'Sheet "Nhà cung cấp" not found');
    }
    
    // Get all data (starting from row 2 to skip header)
    const lastRow = suppliersSheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('[Payment Request] No suppliers found');
      return createResponse(true, 'No suppliers found', { suppliers: [], count: 0 });
    }
    
    // Get Column C (Vendor_Full_Name) - index 3
    const vendorNames = suppliersSheet.getRange(2, 3, lastRow - 1, 1).getValues();
    
    // Filter out empty rows and create supplier list
    const suppliers = vendorNames
      .map(row => row[0])
      .filter(name => name && name.toString().trim() !== '')
      .map(name => name.toString().trim())
      .sort(); // Sort alphabetically
    
    // Remove duplicates
    const uniqueSuppliers = [...new Set(suppliers)];
    
    Logger.log('[Payment Request] Found ' + uniqueSuppliers.length + ' suppliers');
    
    return createResponse(true, 'Suppliers retrieved successfully', {
      suppliers: uniqueSuppliers,
      count: uniqueSuppliers.length
    });
    
  } catch (error) {
    Logger.log('[Payment Request] Error getting suppliers: ' + error.message);
    return createResponse(false, 'Error: ' + error.message);
  }
}

/**
 * Add new supplier to "Nhà cung cấp" sheet
 */
function handleAddSupplier(data) {
  try {
    const { name, address, phone, email, taxCode, companyType } = data;
    
    Logger.log('[Payment Request] Adding new supplier: ' + name);
    
    // Validate required field
    if (!name || name.trim() === '') {
      return createResponse(false, 'Supplier name is required');
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const suppliersSheet = ss.getSheetByName(CONFIG.SUPPLIERS_SHEET_NAME);
    
    if (!suppliersSheet) {
      Logger.log('[Payment Request] Sheet "Nhà cung cấp" not found');
      return createResponse(false, 'Sheet "Nhà cung cấp" not found');
    }
    
    // Check for duplicates in Column C
    const lastRow = suppliersSheet.getLastRow();
    if (lastRow > 1) {
      const existingNames = suppliersSheet.getRange(2, 3, lastRow - 1, 1).getValues();
      const isDuplicate = existingNames.some(row => 
        row[0] && row[0].toString().trim().toLowerCase() === name.trim().toLowerCase()
      );
      
      if (isDuplicate) {
        Logger.log('[Payment Request] Supplier already exists: ' + name);
        return createResponse(false, 'Supplier "' + name + '" already exists');
      }
    }
    
    // Generate unique ID for Column A
    const newId = 'VD' + String(lastRow).padStart(3, '0');
    
    // Prepare row data matching the sheet structure
    const newRow = [
      newId,                           // A: Name (ID)
      name.substring(0, 50),           // B: Vendor (short name)
      name,                            // C: Vendor_Full_Name
      '',                              // D: Công ty mua hàng (empty for now)
      '',                              // E: QBO_Code (empty for now)
      companyType || 'Others',         // F: Vendor_Type
      taxCode || '',                   // G: Tax_ID
      address || '',                   // H: Address
      '',                              // I: QB_ID
      '',                              // J: FCT
      'VND',                           // K: Payment_Currency
      '',                              // L: Quoc_tich
      '',                              // M: Khong_cu_tru
      '',                              // N: Loai_giay_to
      '',                              // O: CMND/CCCD/Ho_Chieu
      '',                              // P: Ngay_cap
      '',                              // Q: Noi_cap
      phone || '',                     // R: So_dien_thoai_lien_he
      address || '',                   // S: Dia_chi_lien_he
      email || '',                     // T: Email_lien_he
      '',                              // U: Gioi_tinh
      '',                              // V: Ngay_sinh
      '',                              // W: Loan
      '',                              // X: Freelancer_Job_Name
      'Yes'                            // Y: Active
    ];
    
    // Append the new row
    suppliersSheet.appendRow(newRow);
    
    Logger.log('[Payment Request] Successfully added supplier: ' + name + ' with ID: ' + newId);
    
    return createResponse(true, 'Supplier added successfully', {
      supplierId: newId,
      name: name
    });
    
  } catch (error) {
    Logger.log('[Payment Request] Error adding supplier: ' + error.message);
    return createResponse(false, 'Error: ' + error.message);
  }
}
