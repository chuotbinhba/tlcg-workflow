// Vercel Serverless Function - Proxy for Google Apps Script
// Handles requests to /api/voucher (without action in path)
// Location: api/voucher.js

// Export config to handle large request bodies (up to 10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

import busboy from 'busboy';

// Helper to parse FormData from request
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    try {
      const bb = busboy({ headers: req.headers });
      const fields = {};
      
      bb.on('field', (name, value) => {
        fields[name] = value;
      });
      
      bb.on('file', (name, file, info) => {
        // For file uploads, we'll handle later if needed
        // For now, just consume the file stream
        file.resume();
      });
      
      bb.on('finish', () => {
        resolve(fields);
      });
      
      bb.on('error', (err) => {
        reject(err);
      });
      
      // Try to pipe the request if it's a stream
      if (req.readable || typeof req.pipe === 'function') {
        req.pipe(bb);
      } else {
        // If req is not a stream, try to write the body directly
        // This might not work in Vercel, but we'll try
        reject(new Error('Request is not a readable stream'));
      }
    } catch (error) {
      reject(error);
    }
  });
}

export default async function handler(req, res) {
  // Smart routing: Route to appropriate backend based on action
  // PHIEU_THU_CHI_BACKEND - For voucher operations
  const PHIEU_THU_CHI_BACKEND = process.env.GOOGLE_APPS_SCRIPT_URL || 
    'https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec';
  
  // TLCGROUP_BACKEND - For intranet operations (getMasterData, etc.)
  const TLCGROUP_BACKEND = process.env.TLCGROUP_BACKEND_URL || 
    'https://script.google.com/macros/s/AKfycbwQ9lisLCr2iATBF2NGOqdNlG_f8ygDKrIEYkiZYsaVbm_7gFI4P_EC0FC5Wq-TJdMYKw/exec';
  
  // PAYMENT_REQUEST_BACKEND - For payment request operations
  const PAYMENT_REQUEST_BACKEND = process.env.PAYMENT_REQUEST_BACKEND_URL || 
    'YOUR_PAYMENT_REQUEST_BACKEND_URL_HERE'; // Update after deploying PAYMENT_REQUEST_BACKEND.gs
  
  // Determine which backend to use based on action
  let GAS_URL = PHIEU_THU_CHI_BACKEND; // Default to Phieu Thu Chi Backend
  
  // Get action from request
  let action = null;
  if (req.method === 'GET') {
    action = req.query.action;
  } else if (req.method === 'POST') {
    // Try to get action from body (if parsed)
    if (req.body && req.body.action) {
      action = req.body.action;
    } else if (req.query && req.query.action) {
      action = req.query.action;
    }
  }
  
  // Route getMasterData to TLCGroup Backend
  if (action === 'getMasterData') {
    GAS_URL = TLCGROUP_BACKEND;
    console.log('[Proxy] Routing getMasterData to TLCGroup Backend');
  }
  
  // Route payment request actions to Payment Request Backend
  const paymentRequestActions = [
    'sendPaymentRequest',
    'submitPaymentRequest',        // Alias for sendPaymentRequest
    'approvePaymentRequest',
    'rejectPaymentRequest',
    'getPaymentRequestHistory',
    'getRecentPaymentRequests',    // Alias for getPaymentRequestHistory
    'getPaymentRequestDetails',
    'getSuppliers',                // New: Load suppliers from "Nhà cung cấp" sheet
    'addSupplier'                  // New: Add supplier to "Nhà cung cấp" sheet
  ];
  
  if (paymentRequestActions.includes(action)) {
    GAS_URL = PAYMENT_REQUEST_BACKEND;
    console.log('[Proxy] Routing ' + action + ' to Payment Request Backend');
  }
  
  // Log warnings if environment variables not set (only in development or first request)
  // These are warnings, not errors - fallback URLs are hardcoded and will work
  if (!process.env.GOOGLE_APPS_SCRIPT_URL) {
    // Only log once per instance to avoid spam
    if (!global.__envWarningLogged) {
      console.warn('[Proxy Info] GOOGLE_APPS_SCRIPT_URL environment variable not set. Using fallback URL.');
      console.warn('[Proxy Info] Optional: Set GOOGLE_APPS_SCRIPT_URL in Vercel Dashboard → Settings → Environment Variables for easier management.');
      global.__envWarningLogged = true;
    }
  }
  if (!process.env.TLCGROUP_BACKEND_URL) {
    // Only log once per instance to avoid spam
    if (!global.__tlcgroupWarningLogged) {
      console.warn('[Proxy Info] TLCGROUP_BACKEND_URL environment variable not set. Using fallback URL.');
      console.warn('[Proxy Info] Optional: Set TLCGROUP_BACKEND_URL in Vercel Dashboard → Settings → Environment Variables for easier management.');
      global.__tlcgroupWarningLogged = true;
    }
  }
  
  // CORS headers - allow your domain
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://workflow.egg-ventures.com',
    'http://localhost:3000',
    'http://localhost:8080'
  ];
  
  // Set CORS headers
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin || origin.includes('workflow.egg-ventures.com')) {
    res.setHeader('Access-Control-Allow-Origin', 'https://workflow.egg-ventures.com');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Handle GET requests
    if (req.method === 'GET') {
      // Forward GET request to GAS with query parameters
      const queryParams = new URLSearchParams(req.query);
      const gasUrl = `${GAS_URL}?${queryParams.toString()}`;
      
      console.log(`[Proxy GET] ${gasUrl.substring(0, 100)}...`);
      
      const response = await fetch(gasUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'TLCG-Workflow-Proxy/1.0'
        }
      });
      
      if (!response.ok) {
        console.error(`[Proxy GET Error] ${response.status}: ${response.statusText}`);
        throw new Error(`GAS returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const getAction = req.query.action || 'unknown';
      console.log(`[Proxy GET Success] action: ${getAction}`);
      
      return res.status(200).json(data);
    }
    
    // Handle POST requests
    if (req.method === 'POST') {
      // Frontend sends FormData with fields: action, email, password, etc.
      // Vercel doesn't parse FormData automatically, so we need to parse it manually
      
      let parsedBody = req.body;
      const isFormData = req.headers['content-type']?.includes('multipart/form-data');
      
      // Try to extract action and other fields from body
      // Vercel might parse FormData into req.body, or it might not
      // We'll try multiple approaches
      
      // First, try req.body if it's already an object with fields
      if (!parsedBody || typeof parsedBody !== 'object' || Object.keys(parsedBody || {}).length === 0) {
        // Try parsing FormData if content-type suggests it
        if (isFormData) {
          try {
            console.log('[Proxy POST] Attempting to parse FormData...');
            // Note: In Vercel, req might not be a stream, so this might fail
            // But we'll try anyway and fall back to req.body
            parsedBody = await parseFormData(req);
            console.log('[Proxy POST] FormData parsed successfully');
          } catch (parseError) {
            console.log('[Proxy POST] FormData parsing failed, using req.body:', parseError.message);
            parsedBody = req.body || {};
          }
        } else {
          parsedBody = req.body || {};
        }
      }
      
      // Log what we have
      console.log('[Proxy POST] Parsed body type:', typeof parsedBody);
      console.log('[Proxy POST] Parsed body keys:', parsedBody && typeof parsedBody === 'object' ? Object.keys(parsedBody) : 'N/A');
      
      // Check if we have a 'data' field with a JSON string (from phieu_thu_chi.html)
      // This is used for large payloads with file attachments
      let hasDataField = false;
      let dataFieldValue = null;
      let actualPayload = parsedBody;
      
      if (parsedBody && typeof parsedBody === 'object' && parsedBody.data && typeof parsedBody.data === 'string') {
        hasDataField = true;
        dataFieldValue = parsedBody.data;
        const dataLength = dataFieldValue.length;
        console.log('[Proxy POST] Found data field with JSON string, length:', dataLength, 'chars (~' + Math.round(dataLength / 1024) + 'KB)');
        
        // Try to extract action from the JSON string for routing (without full parse for large payloads)
        try {
          // For small payloads, parse fully to get action
          if (dataLength < 100000) {
            actualPayload = JSON.parse(dataFieldValue);
            console.log('[Proxy POST] Parsed data field, found action:', actualPayload.action);
          } else {
            // For large payloads, extract action using regex to avoid parsing the entire string
            const actionMatch = dataFieldValue.match(/"action"\s*:\s*"([^"]+)"/);
            if (actionMatch) {
              actualPayload = { action: actionMatch[1] };
              console.log('[Proxy POST] Extracted action from large payload:', actualPayload.action);
            } else {
              console.warn('[Proxy POST] Could not extract action from large payload, using default routing');
            }
          }
        } catch (parseError) {
          console.warn('[Proxy POST] Could not parse data field (may be too large):', parseError.message);
          // Try regex extraction as fallback
          const actionMatch = dataFieldValue.match(/"action"\s*:\s*"([^"]+)"/);
          if (actionMatch) {
            actualPayload = { action: actionMatch[1] };
            console.log('[Proxy POST] Extracted action using regex:', actualPayload.action);
          }
        }
      }
      
      // Update action if we found it (for routing decision)
      if (actualPayload && typeof actualPayload === 'object' && actualPayload.action) {
        action = actualPayload.action;
        // Re-route if we now know it's getMasterData
        if (action === 'getMasterData' && GAS_URL !== TLCGROUP_BACKEND) {
          GAS_URL = TLCGROUP_BACKEND;
          console.log('[Proxy POST] Re-routing getMasterData to TLCGroup Backend (action found: ' + action + ')');
        }
      }
      
      // Forward the request appropriately
      let bodyToSend;
      let contentType;
      
      if (hasDataField && dataFieldValue) {
        // For requests with 'data' field, forward as FormData to preserve large JSON strings
        // This avoids URL encoding issues with large payloads
        contentType = 'multipart/form-data';
        const formData = new FormData();
        formData.append('data', dataFieldValue); // Forward the raw JSON string as-is
        bodyToSend = formData;
        console.log('[Proxy POST] Forwarding large payload as FormData (data field preserved)');
      } else if (parsedBody && typeof parsedBody === 'object' && Object.keys(parsedBody).length > 0) {
        // For small requests, use URL-encoded form data
        contentType = 'application/x-www-form-urlencoded';
        const params = new URLSearchParams();
        Object.keys(parsedBody).forEach(key => {
          const value = parsedBody[key];
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        bodyToSend = params.toString();
      } else {
        // Fallback: send as JSON in 'data' field
        contentType = 'application/x-www-form-urlencoded';
        const params = new URLSearchParams();
        params.append('data', JSON.stringify(parsedBody || {}));
        bodyToSend = params.toString();
      }
      
      // Use the action we extracted (for logging)
      const finalAction = action || (parsedBody && parsedBody.action) || 'unknown';
      console.log(`[Proxy POST] ${GAS_URL.substring(0, 60)}... action: ${finalAction}`);
      console.log(`[Proxy POST] Sending as: ${contentType}`);
      
      // Build headers - don't set Content-Type for FormData (browser/Node will set boundary)
      const headers = {
        'User-Agent': 'TLCG-Workflow-Proxy/1.0'
      };
      
      // Only set Content-Type for URL-encoded data, not FormData
      if (contentType && contentType !== 'multipart/form-data') {
        headers['Content-Type'] = contentType;
      }
      
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: bodyToSend,
        headers: headers
      });
      
      // Read response text first (can only be read once)
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`[Proxy POST Error] ${response.status}: ${responseText.substring(0, 200)}`);
        // Check if error response is HTML
        if (responseText.trim().toLowerCase().startsWith('<!doctype') || responseText.trim().toLowerCase().startsWith('<html')) {
          console.error('[Proxy POST Error] GAS returned HTML error page instead of JSON');
          console.error('[Proxy POST Error] Full HTML response:', responseText.substring(0, 1000));
          return res.status(500).json({
            success: false,
            message: `Backend returned HTML error page (status ${response.status}). Check Google Apps Script deployment and logs.`
          });
        }
        // Try to parse as JSON error response
        try {
          const errorData = JSON.parse(responseText);
          return res.status(response.status).json(errorData);
        } catch (parseError) {
          return res.status(500).json({
            success: false,
            message: `Backend error (status ${response.status}): ${responseText.substring(0, 200)}`
          });
        }
      }
      
      // Check if response is HTML (error page) - responseText already read above
      if (responseText.trim().toLowerCase().startsWith('<!doctype') || responseText.trim().toLowerCase().startsWith('<html')) {
        console.error('[Proxy POST Error] GAS returned HTML instead of JSON');
        console.error('[Proxy POST Error] HTML response:', responseText.substring(0, 1000));
        return res.status(500).json({
          success: false,
          message: 'Backend returned HTML error page instead of JSON. Check Google Apps Script deployment and logs. HTML: ' + responseText.substring(0, 200)
        });
      }
      
      let data;
      try {
        data = JSON.parse(responseText); // JSON.parse is not async, no await needed
        console.log(`[Proxy POST Success] action: ${finalAction}`);
      } catch (parseError) {
        console.error('[Proxy POST Error] Failed to parse GAS response as JSON:', parseError);
        console.error('[Proxy POST Error] Response text:', responseText.substring(0, 500));
        return res.status(500).json({
          success: false,
          message: 'Backend returned invalid JSON. Response: ' + responseText.substring(0, 200)
        });
      }
      
      return res.status(200).json(data);
    }
    
    // Method not allowed
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed. Use GET or POST.`
    });
    
  } catch (error) {
    console.error('[Proxy Error]', error.message);
    
    // Return error response
    return res.status(500).json({
      success: false,
      message: 'Proxy error: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

