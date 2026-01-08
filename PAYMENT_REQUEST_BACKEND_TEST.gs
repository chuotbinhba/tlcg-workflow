/**
 * SIMPLE TEST VERSION - Payment Request Backend
 * Use this to verify deployment works before using the full version
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Payment Request Backend is working!',
    method: 'GET',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    Logger.log('[Test] Received POST request');
    
    // Parse request
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
      Logger.log('[Test] Parse error: ' + parseError.message);
      return createResponse(false, 'Parse error: ' + parseError.message);
    }
    
    const action = data.action || 'unknown';
    Logger.log('[Test] Action: ' + action);
    
    // Simple response
    return createResponse(true, 'Test successful! Action: ' + action, {
      receivedAction: action,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    Logger.log('[Test] Error: ' + error.message);
    return createResponse(false, 'Error: ' + error.message);
  }
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

