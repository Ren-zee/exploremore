# Production Deployment Fix Instructions

## Issues Fixed:

1. CORS configuration updated to allow your Vercel frontend
2. Session configuration updated for cross-origin cookies
3. Added credentials: "include" to frontend fetch requests
4. Added dotenv configuration

## Steps to Deploy:

### 1. Railway Backend Setup:

1. Make sure your Railway service has these environment variables set:

   ```
   POSTGRES_URL=<your_postgres_connection_string>
   POSTGRES_URL_NON_POOLING=<your_postgres_non_pooling_string>
   SESSION_SECRET=<generate_a_strong_secret_key>
   NODE_ENV=production
   ```

2. To generate a strong session secret, you can use:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### 2. Update CORS Origins:

If your Vercel URL is different from `https://exploremore-teal.vercel.app`, update the CORS configuration in `server.js` line 20 to include your actual Vercel URL.

### 3. Verify Frontend API URL:

In `public/auth.js`, make sure the `API_BASE_URL` matches your Railway deployment URL:

```javascript
const API_BASE_URL = "https://exploremore-production-c375.up.railway.app";
```

### 4. Deploy:

1. Push these changes to your repository
2. Railway should automatically redeploy your backend
3. Redeploy your frontend on Vercel

## Testing:

1. Open your Vercel frontend URL
2. Try to login
3. Check browser developer tools > Network tab for any CORS errors
4. Check Railway logs for any server errors

## Common Issues:

- If you still get CORS errors, double-check the CORS origins match your exact Vercel URL
- If sessions don't work, verify the SESSION_SECRET is set on Railway
- If database connections fail, check your POSTGRES_URL variables on Railway
