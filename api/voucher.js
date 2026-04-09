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
  // For Vercel serverless functions, we might need to handle raw body
  // But bodyParser is enabled by default for Next.js API routes
};

import busboy from 'busboy';

// ==================== RATE LIMITING ====================
// In-memory rate limit tracking (IP -> { count, resetTime })
const requestCounts = new Map();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in ms

/**
 * Check if client has exceeded rate limit
 * @param {string} ip - Client IP address
 * @returns {boolean} - True if within limit, false if exceeded
 */
function checkRateLimit(ip) {
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
        // No record or window expired - reset counter
        requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        // Rate limit exceeded
        return false;
    }

    // Increment counter
    record.count++;
    return true;
}

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
  // ==================== RATE LIMITING CHECK ====================
  const clientIp = req.headers['x-forwarded-for'] ||
                   req.headers['x-real-ip'] ||
                   req.socket?.remoteAddress ||
                   'unknown';

  if (!checkRateLimit(clientIp)) {
    console.warn(`[Proxy] Rate limit exceeded for IP: ${clientIp}`);
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.',
      error: 'TOO_MANY_REQUESTS'
    });
  }

  // Smart routing: Route to appropriate backend based on action
  // PHIEU_THU_CHI_BACKEND - For voucher operations
  const PHIEU_THU_CHI_BACKEND = process.env.PHIEU_THU_CHI_BACKEND_URL ||
    process.env.GOOGLE_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbxhaInTbJKzU7BdgfgHShqKzKeslq-HG-ZTS3kXKngWVn_RqOxogLY_-NiALiEE2bHm/exec';
  
  // TLCGROUP_BACKEND - For intranet operations (login, getMasterData, etc.)
  const TLCGROUP_BACKEND = process.env.TLCGROUP_BACKEND_URL ||
    'https://script.google.com/macros/s/AKfycbzPRHqtSW6JSef5A4tiDJbHnIhm2jhK9c8RH6lOBFPEMLR-EjF0iVJO2ndinMZRwbJ4Xw/exec';
  
  // PAYMENT_REQUEST_BACKEND - For payment request operations
  const PAYMENT_REQUEST_BACKEND = process.env.PAYMENT_REQUEST_BACKEND_URL || 
    'https://script.google.com/macros/s/AKfycbxg_DlOgCCCq4393-OKdinqYt6Onni-YlkYiO6hbq9LuFiXC5oj1AiNgJbbJHih4g/exec';
  
  // Determine which backend to use based on action
  let GAS_URL = PHIEU_THU_CHI_BACKEND; // Default to Phieu Thu Chi Backend
  
  // Get action from request
  let action = null;
  if (req.method === 'GET') {
    action = req.query.action;
  } else if (req.method === 'POST') {
    // Try to get action from body (if parsed)
    // Vercel may parse URL-encoded bodies automatically
    if (req.body) {
      if (typeof req.body === 'object' && req.body.action) {
        action = req.body.action;
        console.log('[Proxy] Extracted action from req.body:', action);
      } else if (typeof req.body === 'string') {
        // If body is still a string, try to parse action from it
        try {
          const params = new URLSearchParams(req.body);
          action = params.get('action');
          if (action) {
            console.log('[Proxy] Extracted action from URL-encoded string:', action);
          }
        } catch (e) {
          console.log('[Proxy] Could not parse action from string body:', e.message);
        }
      }
    }
    // Fallback to query parameter
    if (!action && req.query && req.query.action) {
      action = req.query.action;
      console.log('[Proxy] Using action from query:', action);
    }
  }
  
  console.log('[Proxy] Final extracted action:', action);
  
  // Route login and getMasterData to TLCGroup Backend (TLCG_INTRANET_BACKEND_COMPLETE.gs)
  if (action === 'login' || action === 'getMasterData') {
    GAS_URL = TLCGROUP_BACKEND;
    console.log('[Proxy] Routing ' + action + ' to TLCGroup Backend');
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
    'getSuppliers',                // Load suppliers from "Nhà cung cấp" sheet
    'addSupplier',                 // Add supplier to "Nhà cung cấp" sheet
    'getEmployees',                // Load employees from "Nhân viên" sheet
    'getPurchaseOrderTypes'        // Load purchase order types from "Purchase Order" sheet
  ];
  
  if (paymentRequestActions.includes(action)) {
    GAS_URL = PAYMENT_REQUEST_BACKEND;
    console.log('[Proxy] Routing ' + action + ' to Payment Request Backend');
  }
  
  // Log warnings if environment variables not set (only in development or first request)
  // These are warnings, not errors - fallback URLs are hardcoded and will work
  if (!process.env.PHIEU_THU_CHI_BACKEND_URL && !process.env.GOOGLE_APPS_SCRIPT_URL) {
    // Only log once per instance to avoid spam
    if (!global.__envWarningLogged) {
      console.warn('[Proxy Info] PHIEU_THU_CHI_BACKEND_URL and GOOGLE_APPS_SCRIPT_URL are not set. Using fallback URL.');
      console.warn('[Proxy Info] Optional: Set PHIEU_THU_CHI_BACKEND_URL (preferred) or GOOGLE_APPS_SCRIPT_URL in Vercel Dashboard → Settings → Environment Variables.');
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
      
      const responseText = await response.text();
      const getAction = req.query.action || 'unknown';

      if (!response.ok) {
        console.error(`[Proxy GET Error] ${response.status}: ${response.statusText}`);
        console.error(`[Proxy GET Error] Body: ${responseText.substring(0, 500)}`);
        return res.status(500).json({
          success: false,
          message: `Backend error (HTTP ${response.status}) for action "${getAction}". Check Google Apps Script deployment.`
        });
      }

      if (responseText.trim().toLowerCase().startsWith('<!doctype') || responseText.trim().toLowerCase().startsWith('<html')) {
        console.error(`[Proxy GET Error] GAS returned HTML instead of JSON for action "${getAction}"`);
        console.error(`[Proxy GET Error] HTML preview: ${responseText.substring(0, 500)}`);
        return res.status(500).json({
          success: false,
          message: `Backend returned HTML instead of JSON for action "${getAction}". The Google Apps Script deployment may need re-authorization or re-deployment.`
        });
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`[Proxy GET Error] Failed to parse JSON for action "${getAction}":`, parseError.message);
        console.error(`[Proxy GET Error] Response: ${responseText.substring(0, 300)}`);
        return res.status(500).json({
          success: false,
          message: `Backend returned invalid JSON for action "${getAction}".`
        });
      }

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
      
      // Update action from parsedBody if we found it there and action is still null
      // This is critical for URL-encoded requests where Vercel auto-parses the body
      if (parsedBody && typeof parsedBody === 'object') {
        // Check for action in parsedBody
        if (parsedBody.action) {
          // Always update action from parsedBody if it exists (even if action was already set from earlier extraction)
          action = String(parsedBody.action).trim();
          console.log('[Proxy POST] Extracted/Updated action from parsedBody:', action);
          console.log('[Proxy POST] Action type:', typeof action);
          console.log('[Proxy POST] Action length:', action.length);
        }
        
        // Log all keys in parsedBody for debugging
        console.log('[Proxy POST] parsedBody keys:', Object.keys(parsedBody).join(', '));
        if (parsedBody.companyName) {
          console.log('[Proxy POST] parsedBody.companyName:', parsedBody.companyName);
        }
        
        // Re-route based on action if needed
        if (action === 'getMasterData' && GAS_URL !== TLCGROUP_BACKEND) {
          GAS_URL = TLCGROUP_BACKEND;
          console.log('[Proxy POST] Re-routing to TLCGroup Backend based on parsedBody action');
        }
        // getCompanyApprovers defaults to PHIEU_THU_CHI_BACKEND (already set)
        if (action === 'getCompanyApprovers') {
          console.log('[Proxy POST] ✅ getCompanyApprovers detected - will use PHIEU_THU_CHI_BACKEND (default)');
          console.log('[Proxy POST] Target URL:', GAS_URL.substring(0, 60) + '...');
        }
      }
      
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
        // For requests with 'data' field, forward as URL-encoded to preserve large JSON strings
        // URLSearchParams is more reliable in Node.js/Vercel than FormData
        contentType = 'application/x-www-form-urlencoded';
        const params = new URLSearchParams();
        params.append('data', dataFieldValue); // Forward the raw JSON string as-is
        bodyToSend = params.toString();
        console.log('[Proxy POST] Forwarding large payload as URL-encoded (data field preserved)');
      } else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded') && typeof req.body === 'string') {
        // If original request was URL-encoded string, forward it as-is
        // This preserves the exact format that Google Apps Script expects
        contentType = 'application/x-www-form-urlencoded';
        bodyToSend = req.body; // Forward the raw URL-encoded string directly
        console.log('[Proxy POST] Forwarding URL-encoded string directly to preserve format');
      } else if (parsedBody && typeof parsedBody === 'object' && Object.keys(parsedBody).length > 0) {
        // For parsed objects, convert to URL-encoded form data
        // This ensures Google Apps Script receives data in e.parameter format
        contentType = 'application/x-www-form-urlencoded';
        const params = new URLSearchParams();
        Object.keys(parsedBody).forEach(key => {
          const value = parsedBody[key];
          if (value !== undefined && value !== null) {
            // Convert to string and trim to ensure clean values
            const stringValue = String(value).trim();
            params.append(key, stringValue);
            console.log(`[Proxy POST] Adding to URL-encoded: ${key}=${stringValue.substring(0, 50)}${stringValue.length > 50 ? '...' : ''}`);
          }
        });
        bodyToSend = params.toString();
        console.log('[Proxy POST] ✅ Converted parsed body to URL-encoded format');
        console.log('[Proxy POST] URL-encoded body:', bodyToSend.substring(0, 200)); // Log first 200 chars
        console.log('[Proxy POST] URL-encoded body length:', bodyToSend.length);
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
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cd238998-d527-4813-9e30-22fe3efc32e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/voucher.js:367',message:'PRE_FETCH_TO_BACKEND',data:{hypothesisA_backendUrl:GAS_URL,hypothesisB_bodyToSend:typeof bodyToSend==='string'?bodyToSend.substring(0,500):String(bodyToSend),hypothesisC_finalAction:finalAction,hypothesisD_contentType:contentType,hypothesisE_parsedBodyKeys:parsedBody?Object.keys(parsedBody):null,hypothesisE_companyName:parsedBody?.companyName||'NOT_FOUND'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
      // #endregion
      
      // Build headers - don't set Content-Type for FormData (browser/Node will set boundary)
      const headers = {
        'User-Agent': 'TLCG-Workflow-Proxy/1.0'
      };
      
      // Only set Content-Type for URL-encoded data, not FormData
      if (contentType && contentType !== 'multipart/form-data') {
        headers['Content-Type'] = contentType;
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cd238998-d527-4813-9e30-22fe3efc32e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/voucher.js:383',message:'BEFORE_FETCH_TO_BACKEND',data:{gasUrl:GAS_URL,bodyType:typeof bodyToSend,bodyLength:typeof bodyToSend==='string'?bodyToSend.length:'N/A',contentType:contentType,finalAction:finalAction},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      console.log('[Proxy POST] Sending request to backend...');
      const fetchStartTime = Date.now();
      
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: bodyToSend,
        headers: headers
      });
      
      const fetchDuration = Date.now() - fetchStartTime;
      console.log(`[Proxy POST] Backend responded in ${fetchDuration}ms`);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cd238998-d527-4813-9e30-22fe3efc32e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/voucher.js:390',message:'AFTER_FETCH_TO_BACKEND',data:{responseStatus:response.status,responseOk:response.ok,fetchDuration:fetchDuration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Read response text first (can only be read once)
      const responseText = await response.text();
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cd238998-d527-4813-9e30-22fe3efc32e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/voucher.js:390',message:'POST_FETCH_RESPONSE',data:{responseStatus:response.status,responseOk:response.ok,responseTextPreview:responseText.substring(0,500),finalUrl:GAS_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
      // #endregion
      
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
