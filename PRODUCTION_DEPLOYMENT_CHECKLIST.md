# 🚀 IronLog Production Deployment Checklist

## Current Status: 🔄 BACKEND DATABASE SETUP NEEDED

✅ **FRONTEND FIXED**: CORS errors resolved, environment variables properly configured
⚠️ **BACKEND ISSUE**: Database not properly migrated/seeded (500 Internal Server Error)

## 🔧 **NEXT STEPS REQUIRED**

### 1. **✅ Vercel Environment Variables** (COMPLETED)

**Problem**: ~~Frontend is trying to connect to `http://localhost:3001` instead of production backend~~

**✅ FIXED**: Environment variable properly set on Vercel

### 2. **🔧 Backend Database Setup** (CRITICAL - CURRENT ISSUE)

**Problem**: Backend returning 500 Internal Server Error on user registration

**Root Cause**: Database migrations not run, Prisma client not properly generated

**Solution**: 
1. Go to [Render Dashboard](https://dashboard.render.com/) → Your backend service → **Shell**
2. Run these commands:
   ```bash
   npx prisma generate
   npx prisma migrate deploy  
   npx prisma db seed
   ```
3. Or update Build Command to: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`

**Verification**: 
- Test: `curl -X POST "https://ironlog.onrender.com/api/v1/auth/register" -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com","password":"test123"}'`
- Should return success response, not 500 error

### 3. **Service Worker Cache Issue** (✅ FIXED)

✅ The "Response body is already used" error has been fixed in the service worker by properly cloning responses before caching.

## 🧪 **TESTING CHECKLIST**

After applying the fixes above, test these scenarios:

### **Functional Testing**
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are properly set as httpOnly cookies
- [ ] API calls return data (not 404/CORS errors)
- [ ] Workout creation and tracking works
- [ ] Set timer functionality works
- [ ] Calendar heatmap displays
- [ ] Profile editing works

### **PWA Testing**
- [ ] Service worker registers without errors
- [ ] Install prompt appears on mobile/desktop
- [ ] App works offline (cached content)
- [ ] Push notifications work (if enabled)
- [ ] App behaves like native app when installed

### **Cross-Browser Testing**
- [ ] Chrome (desktop/mobile)
- [ ] Safari (desktop/mobile)
- [ ] Firefox
- [ ] Edge

## 📋 **DEPLOYMENT STEPS**

### **Step 1: Backend Deployment (Render)**
1. ✅ Backend is deployed at: `https://ironlog.onrender.com`
2. ⚠️ Verify environment variables are set correctly
3. ⚠️ Test health endpoint: `https://ironlog.onrender.com/health`

### **Step 2: Frontend Deployment (Vercel)**
1. ⚠️ **CRITICAL**: Set `NEXT_PUBLIC_API_URL=https://ironlog.onrender.com/api/v1`
2. ⚠️ Redeploy after setting environment variable
3. ⚠️ Test the deployed frontend

## 🔍 **HOW TO VERIFY FIXES**

### **1. Check API Configuration**
Open browser developer tools on your Vercel site and check for:
```
🔗 API Client initialized with baseURL: https://ironlog.onrender.com/api/v1
```

### **2. Check API Connectivity**
In the browser console, you should see successful API calls, not:
```
❌ Access to XMLHttpRequest at 'http://localhost:3001/api/v1/...' from origin '...' has been blocked by CORS policy
```

### **3. Check Service Worker**
In browser dev tools → Application → Service Workers:
- Should show "Active" status
- No errors in console related to caching

## ⚡ **QUICK FIX COMMANDS**

If you need to redeploy with fixes:

```bash
# Frontend (if making code changes)
cd apps/web
npm run build

# Backend (if making code changes)
cd apps/server
npm run build
```

## 🎯 **SUCCESS CRITERIA**

When everything is working:
- ✅ No CORS errors in browser console
- ✅ API calls show successful responses (200/201 status codes)
- ✅ Users can register, login, and use all features
- ✅ PWA install prompt appears
- ✅ Service worker shows "Active" status
- ✅ App works offline with cached content

## 🆘 **TROUBLESHOOTING**

### **If API calls still fail after setting environment variables:**
1. Check if you redeployed Vercel after adding the environment variable
2. Clear browser cache and hard refresh (Cmd+Shift+R)
3. Check browser network tab to confirm API calls are going to the right URL

### **If CORS errors persist:**
1. Ensure `FRONTEND_URL` is set correctly on Render
2. Check that your Vercel domain matches the CORS allowlist in the backend

### **If service worker errors continue:**
1. Clear all browser data for the site
2. Check if the service worker is properly updated in dev tools

---

## 🎉 **FINAL STEP**

Once all checks pass, update this file to mark the project as **PRODUCTION READY** ✅
