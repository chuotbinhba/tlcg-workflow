// Vercel Serverless Function - Proxy for Google Apps Script
// Handles requests to /api/voucher (without action in path)
// Location: api/voucher.js

export default async function handler(req, res) {
  // Get GAS URL from environment variable
  // ⚠️ IMPORTANT: This is a SERVER-SIDE variable (no prefix needed for Vercel Serverless Functions)
  // If undefined, log warning and use fallback
  // PHIEU_THU_CHI_BACKEND - For voucher operations (getVoucherSummary, getVoucherHistory, approveVoucher, rejectVoucher, sendApprovalEmail)
  const GAS_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 
    'https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec';
  
  // Log warning if using fallback (environment variable not set)
  if (!process.env.GOOGLE_APPS_SCRIPT_URL) {
    console.warn('[Proxy Warning] GOOGLE_APPS_SCRIPT_URL environment variable not set. Using fallback URL.');
    console.warn('[Proxy Warning] Please set GOOGLE_APPS_SCRIPT_URL in Vercel Dashboard → Settings → Environment Variables');
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
      const action = req.query.action || 'unknown';
      console.log(`[Proxy GET Success] action: ${action}`);
      
      return res.status(200).json(data);
    }
    
    // Handle POST requests
    if (req.method === 'POST') {
      // Vercel parses FormData automatically into req.body
      // Frontend sends FormData with fields: action, email, password, etc.
      // Google Apps Script expects either:
      // 1. FormData with individual fields (action, email, password) - works directly
      // 2. FormData with 'data' field containing JSON string
      
      // Create FormData to forward to Google Apps Script
      const formData = new FormData();
      
      // Check if data is in req.body (Vercel parses FormData automatically)
      if (req.body && typeof req.body === 'object') {
        // If req.body has action field, it's already parsed FormData
        if (req.body.action) {
          // Forward as individual form fields (GAS can handle this)
          Object.keys(req.body).forEach(key => {
            formData.append(key, req.body[key]);
          });
        } else {
          // Convert object to JSON string in 'data' field
          formData.append('data', JSON.stringify(req.body));
        }
      } else if (typeof req.body === 'string') {
        // If body is a string, wrap it in 'data' field
        formData.append('data', req.body);
      } else {
        // Empty body
        formData.append('data', JSON.stringify({}));
      }
      
      // Extract action for logging
      let action = 'unknown';
      if (req.body && req.body.action) {
        action = req.body.action;
      } else if (req.query && req.query.action) {
        action = req.query.action;
      }
      
      console.log(`[Proxy POST] ${GAS_URL.substring(0, 60)}... action: ${action}`);
      console.log(`[Proxy POST] Body keys:`, req.body ? Object.keys(req.body) : 'no body');
      
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
      console.log(`[Proxy POST Success] action: ${action}`);
      
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

