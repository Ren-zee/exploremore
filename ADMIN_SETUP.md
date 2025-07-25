# Admin Setup Guide for ExploreMore PH

## Overview

This guide explains how to create an admin account and secure the dashboard for admin-only access.

## What Has Been Implemented

### 1. Admin Authentication System

- **Server-side middleware**: Added `requireAdmin` middleware to protect admin routes
- **Client-side protection**: Dashboard pages check for admin role before loading
- **Role-based access control**: Only users with `role = 'admin'` can access dashboard

### 2. Protected Dashboard Routes

All dashboard-related API endpoints now require admin authentication:

- `/api/users-with-feedback` - View user statistics
- `/api/update-price-breakdown` - Update pricing information
- `/api/stats` - Dashboard statistics
- `/api/feedback/*` - All feedback management endpoints
- `/api/feedbacks/*` - Feedback CRUD operations

### 3. Protected Dashboard Pages

All dashboard HTML pages now include admin access checks:

- `dashboard.html` - Main dashboard
- `dashboard-users.html` - User management
- `dashboard-feedbacks.html` - Feedback management
- `dashboard-price.html` - Price management

### 4. UI Enhancements

- **Dashboard button**: Automatically appears for admin users
- **Access protection**: Non-admin users are redirected from dashboard pages
- **Authentication status**: Real-time UI updates based on user role

## Creating an Admin Account

### Option 1: Using the Script (Recommended)

1. **Configure Database**:

   ```bash
   cp .env.example .env
   # Edit .env and add your database URL
   ```

2. **Run the Admin Creation Script**:
   ```bash
   node create-admin.js
   ```

### Option 2: Manual Database Insert

If you prefer to create the admin manually, run this SQL in your database:

```sql
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@exploremore.ph', '$2b$12$cCeqme7LQuSSyhvuD2xQ9OFqQ3AEIYx9pgMzCskaa3PyDkEc1OCnu', 'admin');
```

### Default Admin Credentials

- **Email**: `admin@exploremore.ph`
- **Username**: `admin`
- **Password**: `Admin123!`

⚠️ **IMPORTANT**: Change the admin password after first login!

## How It Works

### Authentication Flow

1. User logs in with admin credentials
2. Server validates credentials and sets session with `role: 'admin'`
3. Client stores user info in sessionStorage
4. Dashboard pages check admin role before rendering
5. API calls include session authentication

### Access Control

- **Dashboard Pages**: Immediate redirect if not admin
- **API Endpoints**: Return 403 Forbidden for non-admin users
- **Navigation**: Dashboard button only visible to admins

### Security Features

- Session-based authentication
- Server-side role validation
- Client-side access guards
- Protected API endpoints
- Automatic redirects for unauthorized access

## Testing the Implementation

1. **Create admin account** (see above)
2. **Login as admin**:
   - Go to login page
   - Use admin credentials
   - Dashboard button should appear
3. **Test dashboard access**:
   - Click dashboard button
   - Should load successfully
4. **Test non-admin access**:
   - Logout and login as regular user
   - Try accessing dashboard URLs directly
   - Should be redirected to home page

## File Changes Made

### Server-side (`server.js`)

- Added `requireAuth` and `requireAdmin` middleware
- Protected all dashboard API routes with `requireAdmin`

### Client-side (`auth.js`)

- Enhanced `checkAuthStatus()` to include admin role checking
- Added dashboard page access protection
- Added helper functions for admin validation

### Dashboard Pages

- Added admin access checks to all dashboard HTML files
- Added dashboard navigation button for admins

### Configuration

- Created `create-admin.js` script for easy admin account creation
- Created `.env.example` with required environment variables

## Troubleshooting

### "Access denied" message when accessing dashboard

- Ensure you're logged in as admin
- Check browser console for authentication errors
- Verify admin role in sessionStorage

### Dashboard button not appearing

- Ensure admin user has `role = 'admin'` in database
- Check if user is properly logged in
- Refresh page after login

### API requests failing with 403 errors

- Verify session is active
- Check if user has admin role
- Ensure server-side session matches client-side storage

## Security Considerations

1. **Password Security**: Change default admin password immediately
2. **Session Management**: Sessions expire after 24 hours
3. **Role Validation**: Both client and server validate admin role
4. **Access Logging**: Consider adding audit logs for admin actions
5. **HTTPS**: Ensure production uses HTTPS for secure authentication

## Next Steps

1. Login as admin and test all dashboard functionality
2. Create additional admin users if needed
3. Consider implementing role-based permissions (super admin, moderator, etc.)
4. Add audit logging for admin actions
5. Implement password change functionality for admins
