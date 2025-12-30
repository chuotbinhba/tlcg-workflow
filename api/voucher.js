// Vercel Serverless Function - Proxy for Google Apps Script
// Handles requests to /api/voucher (without action in path)
// Location: api/voucher.js

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
      // Vercel might parse FormData into req.body, or it might not
      // Frontend sends FormData with fields: action, email, password, etc.
      // Google Apps Script expects FormData with individual fields
      
      let parsedBody = req.body;
      
      // Check if body is FormData (multipart/form-data)
      const isFormData = req.headers['content-type']?.includes('multipart/form-data');
      
      // If it's FormData and not parsed, we need to handle it differently
      // For now, assume Vercel might parse it into req.body
      if (isFormData && (!parsedBody || Object.keys(parsedBody || {}).length === 0)) {
        console.warn('[Proxy POST] FormData detected but body not parsed - this might cause issues');
      }
      
      // Create FormData to forward to Google Apps Script
      const formData = new FormData();
      
      // If we have parsed body (as object), forward individual fields
      if (parsedBody && typeof parsedBody === 'object' && Object.keys(parsedBody).length > 0) {
        // Update action if we found it in body (for routing decision)
        if (parsedBody.action && !action) {
          action = parsedBody.action;
          // Re-route if we now know it's getMasterData
          if (action === 'getMasterData' && GAS_URL !== TLCGROUP_BACKEND) {
            GAS_URL = TLCGROUP_BACKEND;
            console.log('[Proxy POST] Re-routing getMasterData to TLCGroup Backend (action found in body)');
          }
        }
        
        // Forward as individual form fields (GAS can handle this directly)
        Object.keys(parsedBody).forEach(key => {
          const value = parsedBody[key];
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
      } else if (parsedBody && typeof parsedBody === 'object') {
        // Convert object to JSON string in 'data' field
        formData.append('data', JSON.stringify(parsedBody));
      } else if (typeof parsedBody === 'string') {
        // If body is a string, wrap it in 'data' field
        formData.append('data', parsedBody);
      } else {
        // Empty or unparseable body - send empty object
        formData.append('data', JSON.stringify({}));
      }
      
      // Use the action we extracted (for logging)
      const finalAction = action || 'unknown';
      console.log(`[Proxy POST] ${GAS_URL.substring(0, 60)}... action: ${finalAction}`);
      console.log(`[Proxy POST] Body keys:`, parsedBody && typeof parsedBody === 'object' ? Object.keys(parsedBody) : 'no body or not object');
      console.log(`[Proxy POST] Content-Type:`, req.headers['content-type']);
      
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'TLCG-Workflow-Proxy/1.0'
        }
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

