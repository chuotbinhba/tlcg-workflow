// Test endpoint to check environment variables status
// Access at: /api/test-env
// This helps verify that environment variables are set correctly in Vercel

export default async function handler(req, res) {
  // Only allow in development or with authentication
  // For production, you might want to add authentication
  
  const envStatus = {
    GOOGLE_APPS_SCRIPT_URL: process.env.GOOGLE_APPS_SCRIPT_URL ? '✅ Set' : '❌ Not set (using fallback)',
    TLCGROUP_BACKEND_URL: process.env.TLCGROUP_BACKEND_URL ? '✅ Set' : '❌ Not set (using fallback)',
    // Security: Don't expose actual URLs
    hasGoogleAppsScriptUrl: !!process.env.GOOGLE_APPS_SCRIPT_URL,
    hasTlcGroupBackendUrl: !!process.env.TLCGROUP_BACKEND_URL,
    // Show first/last few characters for verification (not full URL)
    googleAppsScriptUrlPreview: process.env.GOOGLE_APPS_SCRIPT_URL 
      ? process.env.GOOGLE_APPS_SCRIPT_URL.substring(0, 30) + '...' + process.env.GOOGLE_APPS_SCRIPT_URL.substring(process.env.GOOGLE_APPS_SCRIPT_URL.length - 10)
      : 'Using fallback URL',
    tlcGroupBackendUrlPreview: process.env.TLCGROUP_BACKEND_URL
      ? process.env.TLCGROUP_BACKEND_URL.substring(0, 30) + '...' + process.env.TLCGROUP_BACKEND_URL.substring(process.env.TLCGROUP_BACKEND_URL.length - 10)
      : 'Using fallback URL'
  };
  
  return res.status(200).json({
    success: true,
    message: 'Environment Variables Status',
    environment: envStatus,
    note: 'Both backends have fallback URLs hardcoded, so the app works with or without environment variables.',
    instructions: {
      setVariables: 'Go to Vercel Dashboard → Settings → Environment Variables',
      verify: 'Redeploy after setting environment variables for changes to take effect',
      checkLogs: 'Check Vercel function logs to see if warnings about environment variables are gone'
    }
  });
}

