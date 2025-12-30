# Vercel Proxy Implementation Guide

## Architecture with Vercel

```
Browser (workflow.egg-ventures.com)
  ↓ (Same-origin request, no CORS)
Vercel Serverless Function (/api/voucher/*)
  ↓ (Server-to-server, no CORS)
Google Apps Script Web App
```

## Implementation Steps

### Step 1: Create API Route Structure

If using **Next.js**:
```
your-project/
├── pages/
│   └── api/
│       └── voucher/
│           └── [action].js       # Dynamic route for all actions
└── ...
```

If using **Static HTML** (Vercel Serverless Functions):
```
your-project/
├── api/
│   └── voucher/
│       └── [action].js           # Serverless function
├── phieu_thu_chi.html
├── index.html
└── vercel.json                   # Configuration
```

### Step 2: Create Serverless Function

**For Next.js** (`pages/api/voucher/[action].js`):
```javascript
export default async function handler(req, res) {
  const { action } = req.query;
  const GAS_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://workflow.egg-ventures.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method === 'GET') {
      // Forward GET request to GAS
      const params = new URLSearchParams(req.query);
      const gasUrl = `${GAS_URL}?${params.toString()}`;
      
      const response = await fetch(gasUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'TLCG-Workflow-Proxy/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GAS returned ${response.status}`);
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    }
    
    if (req.method === 'POST') {
      // Handle POST requests
      // Convert JSON body to FormData for GAS
      const formData = new FormData();
      
      // If request has body, send it as 'data' field
      if (req.body && typeof req.body === 'object') {
        formData.append('data', JSON.stringify(req.body));
      }
      
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'TLCG-Workflow-Proxy/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GAS returned ${response.status}`);
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    }
    
    return res.status(405).json({ success: false, message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Proxy error: ' + error.message
    });
  }
}
```

**For Static HTML** (`api/voucher/[action].js`):
```javascript
// Vercel Serverless Function
export default async function handler(req, res) {
  const { action } = req.query;
  const GAS_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 
    'https://script.google.com/macros/s/AKfycbxtJKuVxfWePJ0216BDmnmfgdaJhovY1ZlwLJB6kyAe0TpzcLrQbI9toFTV-g5bN_xU/exec';
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or specific domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // For GET requests, forward query params
    if (req.method === 'GET') {
      const params = new URLSearchParams(req.query);
      const gasUrl = `${GAS_URL}?${params.toString()}`;
      
      const response = await fetch(gasUrl);
      const data = await response.json();
      return res.status(200).json(data);
    }
    
    // For POST requests, convert to FormData
    if (req.method === 'POST') {
      const formData = new FormData();
      
      // Handle different body types
      if (req.body) {
        if (typeof req.body === 'string') {
          // Already JSON string
          formData.append('data', req.body);
        } else if (typeof req.body === 'object') {
          // Convert object to JSON string
          formData.append('data', JSON.stringify(req.body));
        }
      }
      
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      return res.status(200).json(data);
    }
    
    return res.status(405).json({ success: false, message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Proxy error: ' + error.message
    });
  }
}
```

### Step 3: Configure Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   GOOGLE_APPS_SCRIPT_URL = https://script.google.com/macros/s/YOUR_ID/exec
   ```
   **⚠️ Important:** 
   - This is a **server-side** variable (no prefix needed for Vercel Serverless Functions)
   - If you use Next.js client-side, you'll need `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL`
   - If you use Vite client-side, you'll need `VITE_GOOGLE_APPS_SCRIPT_URL`
   - See `ENVIRONMENT_VARIABLES.md` for details
3. Select environments: Production, Preview, Development (all)
4. Click **Save**
5. **Redeploy your project**

### Step 4: Update Frontend Code

**Update `phieu_thu_chi.html`:**

Find this line (around line 2253):
```javascript
const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/.../exec';
```

Replace with:
```javascript
// Use Vercel API route as proxy
const PROXY_API_URL = '/api/voucher'; // Same origin, no CORS!

// Keep GAS URL as fallback if needed (optional)
const GOOGLE_APPS_SCRIPT_WEB_APP_URL = PROXY_API_URL;
```

**Update all fetch calls:**

All fetch calls will work the same, but now they go through your proxy!

Example GET request:
```javascript
// Before:
const response = await fetch(`${GOOGLE_APPS_SCRIPT_WEB_APP_URL}?action=getVoucherSummary`, {
    method: 'GET',
    mode: 'cors',
    redirect: 'follow'
});

// After:
const response = await fetch(`${PROXY_API_URL}?action=getVoucherSummary`, {
    method: 'GET'
    // No need for mode: 'cors' or redirect: 'follow'!
});
```

Example POST request:
```javascript
// Before:
const formData = new FormData();
formData.append('data', JSON.stringify(payload));
const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    body: formData
});

// After:
const formData = new FormData();
formData.append('data', JSON.stringify(payload));
const response = await fetch(PROXY_API_URL, {
    method: 'POST',
    body: formData
    // No CORS headers needed!
});
```

### Step 5: Update `vercel.json` (if needed)

For static HTML projects, you might need `vercel.json`:
```json
{
  "functions": {
    "api/voucher/[action].js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/voucher/:action*",
      "destination": "/api/voucher/[action]"
    }
  ]
}
```

### Step 6: Handle File Uploads (Advanced)

If you need to handle file uploads through the proxy:

```javascript
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  const form = new IncomingForm();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    
    // Forward to GAS as FormData
    const formData = new FormData();
    
    // Add fields
    if (fields.data) {
      formData.append('data', fields.data[0]);
    }
    
    // Add files if any
    for (const [key, file] of Object.entries(files)) {
      const fileBuffer = fs.readFileSync(file[0].filepath);
      formData.append(key, fileBuffer, file[0].originalFilename);
    }
    
    const response = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    return res.status(200).json(data);
  });
}
```

## Benefits of Vercel Proxy

1. ✅ **No CORS Issues**: Same-origin requests
2. ✅ **Free Tier**: 100GB bandwidth/month, 100 function invocations/second
3. ✅ **Fast**: Edge network, low latency
4. ✅ **Easy Deploy**: Just push to Git, Vercel auto-deploys
5. ✅ **Environment Variables**: Secure secret management
6. ✅ **Logging**: Built-in logs in Vercel dashboard
7. ✅ **Monitoring**: Automatic error tracking

## Testing

1. **Deploy to Vercel**
2. **Test locally** (if using Next.js):
   ```bash
   npm run dev
   # Visit http://localhost:3000/api/voucher?action=getVoucherSummary
   ```
3. **Test in production**: 
   - Visit `https://workflow.egg-ventures.com/api/voucher?action=getVoucherSummary`
   - Should return voucher summary JSON

## Troubleshooting

### Function timeout
- Increase timeout in `vercel.json`:
  ```json
  {
    "functions": {
      "api/voucher/[action].js": {
        "maxDuration": 60
      }
    }
  }
  ```

### Environment variables not working
- Check Vercel dashboard → Settings → Environment Variables
- Make sure variables are set for correct environment (Production, Preview, Development)
- Redeploy after adding variables
- **Important:** For Vercel Serverless Functions (server-side), use `GOOGLE_APPS_SCRIPT_URL` (no prefix needed)
- If using Next.js client-side, use `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL`
- If using Vite client-side, use `VITE_GOOGLE_APPS_SCRIPT_URL`
- See `ENVIRONMENT_VARIABLES.md` for detailed explanation

### 404 on API route
- Check file structure matches: `api/voucher/[action].js`
- Check `vercel.json` rewrites if using static HTML
- Check Vercel deployment logs

### FormData issues
- Make sure to use `form-data` package if needed:
  ```bash
  npm install form-data
  ```
- Import: `import FormData from 'form-data';`

## Migration Checklist

- [ ] Create API route file (`api/voucher/[action].js` or `pages/api/voucher/[action].js`)
- [ ] Add `GOOGLE_APPS_SCRIPT_URL` to Vercel environment variables
- [ ] Update frontend: Change `GOOGLE_APPS_SCRIPT_WEB_APP_URL` to `/api/voucher`
- [ ] Remove `mode: 'cors'` and `redirect: 'follow'` from fetch calls (optional)
- [ ] Test GET requests (loadRecentVouchers, openVoucherDetail)
- [ ] Test POST requests (sendForApproval, approveVoucher, rejectVoucher)
- [ ] Deploy to Vercel
- [ ] Monitor Vercel logs for errors

## Next Steps

1. **Create the API route file** in your project
2. **Add environment variable** in Vercel dashboard
3. **Update frontend** to use proxy URL
4. **Test locally** (if possible) or deploy and test
5. **Monitor logs** in Vercel dashboard

Need help implementing? Let me know which file structure you're using (Next.js or static HTML)!

