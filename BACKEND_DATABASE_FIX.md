# 🔧 Backend Database Fix Guide

## 🚨 Current Issue

The frontend is now successfully connecting to the backend, but the backend is returning **500 Internal Server Error** when trying to register users.

## 🔍 Root Cause

The backend database is not properly migrated or configured on Render.

## 🛠️ **IMMEDIATE FIXES NEEDED**

### **Step 1: Fix Database Using Build Command (Free Tier)**

Since Render free tier doesn't support Shell access, we'll fix the database through the build process:

**Option A: Update Build Command (Recommended)**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your **ironlog** backend service → **Settings** → **Build & Deploy**
3. Update **Build Command** to:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run build
   ```
4. **Save Changes**
5. Go to **Manual Deploy** → **Deploy Latest Commit**

**Option B: Use Custom Build Script**

1. Update **Build Command** to:
   ```bash
   ./render-build.sh
   ```
2. **Save Changes** and **Deploy Latest Commit**

### **Step 2: Set Database Seeding (Important)**

Add this environment variable to ensure initial data is seeded:

1. **Settings** → **Environment Variables**
2. Add:
   ```
   SEED_DATABASE=true
   ```
3. **Save**

### **Step 3: Monitor Deployment Logs**

1. After triggering the deploy, go to **Logs** tab
2. Watch for these success messages:
   ```
   🔄 Generating Prisma client...
   🗄️ Running database migrations...
   🌱 Seeding database...
   🔨 Building TypeScript application...
   ```

### **Step 4: ~~Check Render Backend Logs~~ (Not available in free tier)**

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

# Database seeding (for initial setup)
SEED_DATABASE=true

# CORS (optional, for explicit frontend URL)
FRONTEND_URL=https://ironlog-web.vercel.app
```

### **Step 4: Test Database Connection (Free Tier Alternative)**

Since Shell access isn't available, test the database by checking:

1. **Deployment logs** for successful migration messages
2. **Application logs** for database connection errors
3. **API endpoints** directly with curl

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
