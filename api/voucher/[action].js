// Vercel Serverless Function - Proxy for Google Apps Script
// Handles all voucher-related API calls
// Location: api/voucher/[action].js

export default async function handler(req, res) {
  const { action } = req.query;
  
  // Get GAS URL from environment variable
  // ⚠️ IMPORTANT: This is a SERVER-SIDE variable (no prefix needed for Vercel Serverless Functions)
  // If undefined, log warning and use fallback
  const GAS_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 
    'https://script.google.com/macros/s/AKfycbxtJKuVxfWePJ0216BDmnmfgdaJhovY1ZlwLJB6kyAe0TpzcLrQbI9toFTV-g5bN_xU/exec';
  
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
      console.log(`[Proxy GET Success] action: ${action}`);
      
      return res.status(200).json(data);
    }
    
    // Handle POST requests
    if (req.method === 'POST') {
      // For Vercel, req.body is already parsed if Content-Type is application/json
      // But GAS expects FormData with 'data' field containing JSON string
      
      let bodyToSend;
      
      // Check if body is already FormData (from client)
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        // If it's FormData, we need to forward it as-is
        // But Vercel doesn't parse FormData by default, so we'll need to handle it
        // For now, assume it's JSON that was sent as FormData by frontend
        bodyToSend = req.body;
      } else {
        // Create FormData for GAS
        // Use native FormData (available in Node 18+ on Vercel)
        const formData = new FormData();
        
        // Get JSON string from body
        let dataString;
        if (typeof req.body === 'string') {
          dataString = req.body;
        } else if (req.body) {
          dataString = JSON.stringify(req.body);
        } else {
          dataString = JSON.stringify({});
        }
        
        formData.append('data', dataString);
        bodyToSend = formData;
      }
      
      console.log(`[Proxy POST] ${GAS_URL.substring(0, 60)}... action: ${action || 'from body'}`);
      
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: bodyToSend,
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
      console.log(`[Proxy POST Success] action: ${action || 'from body'}`);
      
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

