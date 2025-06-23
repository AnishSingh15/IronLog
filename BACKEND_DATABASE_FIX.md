# 🔧 Backend Database Fix Guide

## 🚨 Current Issue
The frontend is now successfully connecting to the backend, but the backend is returning **500 Internal Server Error** when trying to register users.

## 🔍 Root Cause
The backend database is not properly migrated or configured on Render.

## 🛠️ **IMMEDIATE FIXES NEEDED**

### **Step 1: Check Render Backend Logs**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your **ironlog** backend service
3. Click on it → **Logs** tab
4. Look for database connection errors or Prisma errors

### **Step 2: Fix Database Connection**

**Option A: Use Render Shell (Recommended)**
1. In your Render backend service, go to **Shell** tab
2. Run these commands:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Deploy database migrations
   npx prisma migrate deploy
   
   # Seed the database with initial data
   npx prisma db seed
   ```

**Option B: Update Build Command**
1. Go to **Settings** → **Build & Deploy**  
2. Update **Build Command** to:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

### **Step 3: Verify Environment Variables**

Ensure these are set in **Settings** → **Environment Variables**:

```bash
# Database (required)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secrets (required)
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-32-characters

# Environment
NODE_ENV=production
PORT=3001

# CORS (optional, for explicit frontend URL)
FRONTEND_URL=https://ironlog-web.vercel.app
```

### **Step 4: Test Database Connection**

In the Render Shell, test if the database is accessible:
```bash
# Test database connection
npx prisma db pull

# Check if tables exist
npx prisma studio --browser none --port 5000
```

## 🔍 **Common Database Issues**

### **Issue 1: Prisma Client Not Generated**
```bash
Error: Cannot find module '@prisma/client'
```
**Fix**: Run `npx prisma generate`

### **Issue 2: Database Tables Don't Exist**
```bash
Error: Table 'User' doesn't exist
```
**Fix**: Run `npx prisma migrate deploy`

### **Issue 3: Database Connection Failed**
```bash
Error: Can't reach database server
```
**Fix**: Check `DATABASE_URL` format and database status

### **Issue 4: No Initial Data**
```bash
Error: No exercises found
```
**Fix**: Run `npx prisma db seed`

## ✅ **Success Verification**

After fixing the database:

1. **Test Health Endpoint**: `https://ironlog.onrender.com/health`
   - Should return: `{"status":"OK","timestamp":"...","environment":"production"}`

2. **Test Registration**: 
   ```bash
   curl -X POST "https://ironlog.onrender.com/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"testpass123"}'
   ```
   - Should return: `{"success":true,"data":{"user":{"id":"...","name":"Test User","email":"test@example.com"},...}}`

3. **Test Frontend**: Go to `https://ironlog-web.vercel.app/register`
   - Registration should work without errors

## 🚀 **After Database Fix**

Once the database is properly set up:
- ✅ User registration will work
- ✅ User login will work
- ✅ All app features will be functional
- ✅ Your app will be fully production-ready

---

## 📞 **Need Help?**

If you're still getting errors after these steps, check the Render logs for the specific error message and we can debug further.

**The main issue is that the database migrations haven't been run on your production database yet.**
