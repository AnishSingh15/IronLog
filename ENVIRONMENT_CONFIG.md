# Environment Variables Configuration Guide

## 🚀 **Frontend (Vercel) Environment Variables**

### **Required Environment Variables for Vercel:**

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add these variables:**

```bash
# Production API URL (pointing to your Render backend)
NEXT_PUBLIC_API_URL=https://ironlog.onrender.com/api/v1

# Optional: Environment indicator
NODE_ENV=production
```

### **Important Notes:**
- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Make sure there are **no trailing slashes** in the API URL
- The URL must match exactly what your backend is deployed on

## 🔧 **Backend (Render) Environment Variables**

### **Required Environment Variables for Render:**

```bash
# Database connection
DATABASE_URL=postgresql://username:password@host:port/database

# JWT secrets (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-32-characters

# Environment
NODE_ENV=production

# Port (Render will set this automatically, but you can specify)
PORT=3001

# Frontend URL for CORS (optional, fallback is hardcoded)
FRONTEND_URL=https://ironlog-web.vercel.app
```

## 🔍 **How to Test Configuration:**

### **1. Check Frontend API URL:**
Open browser developer tools on your Vercel site and check the console for:
```
🔗 API Client initialized with baseURL: https://ironlog.onrender.com/api/v1
```

### **2. Check Backend Health:**
Visit: `https://ironlog.onrender.com/health`
Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-06-23T...",
  "environment": "production"
}
```

### **3. Test CORS:**
Make a request from your frontend and check for CORS errors in browser console.

## 📝 **Step-by-Step Fix for Current Issue:**

### **1. Update Vercel Environment Variables:**
1. Go to [Vercel Dashboard](https://vercel.app/dashboard)
2. Select your `ironlog-web` project
3. Go to Settings → Environment Variables
4. Add: `NEXT_PUBLIC_API_URL` = `https://ironlog.onrender.com/api/v1`
5. Redeploy your application

### **2. Update Render Environment Variables:**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your `ironlog` service
3. Go to Environment
4. Add: `FRONTEND_URL` = `https://ironlog-web.vercel.app`
5. The service will automatically redeploy

## 🛠️ **Quick Fix Commands:**

### **Redeploy Frontend (Vercel):**
```bash
# If you have Vercel CLI
vercel --prod

# Or just push to main branch to trigger auto-deploy
git push origin main
```

### **Redeploy Backend (Render):**
```bash
# Render auto-deploys on git push
git push origin main

# Or manually redeploy from Render dashboard
```

## ❌ **Common Issues & Solutions:**

### **Issue: API calls still going to localhost**
**Solution:** Environment variable not set correctly in Vercel
- Double-check the variable name: `NEXT_PUBLIC_API_URL`
- Ensure no typos in the URL
- Redeploy after adding the variable

### **Issue: CORS errors**
**Solution:** Backend doesn't recognize frontend domain
- Add your Vercel domain to CORS configuration
- Ensure environment variables are set in Render
- Check that HTTPS is used (not HTTP)

### **Issue: Service Worker errors**
**Solution:** Clear browser cache and service worker
- Open DevTools → Application → Storage → Clear storage
- Or use incognito mode for testing

## 🔄 **Testing Checklist:**

- [ ] Vercel environment variables set correctly
- [ ] Render environment variables set correctly
- [ ] Both services redeployed
- [ ] Health endpoint accessible
- [ ] No CORS errors in browser console
- [ ] Login flow works end-to-end
- [ ] Service worker errors resolved

After following these steps, your deployed application should work correctly! 🎉
