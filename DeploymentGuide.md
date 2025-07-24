# 🚀 Deployment Guide for ExploreMore PH

This guide will help you deploy your ExploreMore PH project using Supabase (Database), Railway (Backend), and Vercel (Frontend).

## 📋 Prerequisites

1. GitHub account
2. Supabase account
3. Railway account
4. Vercel account
5. Your project pushed to a GitHub repository

## 🗄️ Step 1: Set up Supabase (Database)

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in and click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `exploremore-ph`
   - Database Password: (generate a strong password and save it)
   - Region: Choose closest to your users
5. Click "Create new project"

### 1.2 Set up the Database Schema

1. In your Supabase dashboard, go to "SQL Editor"
2. Copy the contents of `supabase-schema.sql` from your project
3. Paste it into the SQL Editor and click "Run"
4. This will create all necessary tables and indexes

### 1.3 Get Database Connection Details

1. Go to Settings → Database
2. Copy the following values (you'll need them for Railway):
   - Host
   - Database name
   - Username
   - Password (the one you set during project creation)
   - Port (usually 5432)

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your ExploreMore PH repository
6. Railway will automatically detect it's a Node.js project

### 2.2 Configure Environment Variables

1. In your Railway project dashboard, go to "Variables"
2. Add the following environment variables:

```env
POSTGRES_HOST=your-supabase-host
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-supabase-password
POSTGRES_DATABASE=postgres
DB_PORT=5432
SESSION_SECRET=your-very-secure-session-secret-key-here
NODE_ENV=production
```

Replace the Supabase values with the ones you copied from Step 1.3.

### 2.3 Deploy

1. Railway will automatically deploy your backend
2. Once deployed, copy the deployment URL (e.g., `https://your-app.railway.app`)
3. You'll need this URL for the frontend configuration

## ⚡ Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Other
   - Root Directory: `./`
   - Build Command: Leave empty (we're deploying static files)
   - Output Directory: `public`

### 3.2 Update Frontend API URLs

Before deploying, you need to update your frontend JavaScript files to use the Railway backend URL instead of localhost.

In your frontend files (like `auth.js`, `budget.js`, etc.), replace:

```javascript
const API_BASE_URL = "http://localhost:3001";
```

With:

```javascript
const API_BASE_URL = "https://your-app.railway.app";
```

### 3.3 Deploy

1. Click "Deploy"
2. Vercel will deploy your frontend
3. Copy the deployment URL (e.g., `https://your-app.vercel.app`)

## 🔧 Step 4: Update CORS Configuration

### 4.1 Update Railway Environment Variables

1. Go back to your Railway project
2. Add/update the `FRONTEND_URL` environment variable:

```env
FRONTEND_URL=https://your-app.vercel.app
```

### 4.2 Redeploy Railway

Railway should automatically redeploy with the new environment variable.

## 📱 Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test the following functionality:
   - User registration
   - User login
   - Submitting feedback
   - Viewing tourist spots
   - Admin features (if applicable)

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**

   - Make sure `FRONTEND_URL` is set correctly in Railway
   - Ensure no trailing slashes in URLs

2. **Database Connection Issues**

   - Verify Supabase connection details
   - Check if Supabase project is active
   - Ensure environment variables are set correctly

3. **API Not Working**
   - Check Railway deployment logs
   - Verify backend is running on correct port
   - Test API endpoints directly

### Checking Logs:

- **Railway**: Go to your project → Deployments → View logs
- **Vercel**: Go to your project → Functions → View function logs
- **Supabase**: Go to Logs & Analytics

## 🔄 Continuous Deployment

Both Railway and Vercel are now set up for continuous deployment:

- Push to your main branch → Railway redeploys backend
- Push to your main branch → Vercel redeploys frontend

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files to Git
2. **Session Secret**: Use a long, random string for `SESSION_SECRET`
3. **Database**: Supabase has built-in security features enabled
4. **HTTPS**: Both Railway and Vercel provide HTTPS by default

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)

## 🎉 Congratulations!

Your ExploreMore PH application is now live and ready for users!

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-app.railway.app
- **Database**: Managed by Supabase

Remember to update DNS settings if you plan to use a custom domain.