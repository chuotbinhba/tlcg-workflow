// Vercel Serverless Function - Proxy for Google Apps Script
// Handles requests to /api/voucher (without action in path)
// Location: api/voucher.js

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
  
  // Log warnings if environment variables not set
  if (!process.env.GOOGLE_APPS_SCRIPT_URL) {
    console.warn('[Proxy Warning] GOOGLE_APPS_SCRIPT_URL environment variable not set. Using fallback URL.');
    console.warn('[Proxy Warning] Please set GOOGLE_APPS_SCRIPT_URL in Vercel Dashboard → Settings → Environment Variables');
  }
  if (!process.env.TLCGROUP_BACKEND_URL) {
    console.warn('[Proxy Warning] TLCGROUP_BACKEND_URL environment variable not set. Using fallback URL for getMasterData.');
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
      
      // Update action if we found it in parsed body (for routing decision)
      if (parsedBody && typeof parsedBody === 'object' && parsedBody.action) {
        action = parsedBody.action;
        // Re-route if we now know it's getMasterData
        if (action === 'getMasterData' && GAS_URL !== TLCGROUP_BACKEND) {
          GAS_URL = TLCGROUP_BACKEND;
          console.log('[Proxy POST] Re-routing getMasterData to TLCGroup Backend (action found: ' + action + ')');
        }
      }
      
      // Google Apps Script can receive FormData and parse fields from e.parameter
      // We'll send as URL-encoded form data (application/x-www-form-urlencoded)
      // This is simpler and more reliable than multipart/form-data
      let bodyToSend;
      let contentType = 'application/x-www-form-urlencoded';
      
      if (parsedBody && typeof parsedBody === 'object' && Object.keys(parsedBody).length > 0) {
        // Convert to URLSearchParams (application/x-www-form-urlencoded)
        // This format is parsed by GAS into e.parameter
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Proxy POST Error] ${response.status}: ${errorText.substring(0, 200)}`);
        throw new Error(`GAS returned ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
      const data = await response.json();
      console.log(`[Proxy POST Success] action: ${finalAction}`);
      
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

