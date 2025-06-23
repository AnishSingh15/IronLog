# 🔧 Render Workspace Protocol Fix

## 🚨 Issue
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```

## 🔍 Root Cause
Render is trying to install dependencies from the root directory which contains pnpm workspace references that npm doesn't understand.

## ✅ **SOLUTION: Configure Root Directory**

### **Step 1: Update Render Service Settings**

1. **Go to**: [Render Dashboard](https://dashboard.render.com/)
2. **Find your backend service** → **Settings**
3. **Update these settings**:

   ```
   Root Directory: apps/server
   Build Command: npm run render:build
   Start Command: npm start
   ```

   **OR use the full command:**
   ```
   Root Directory: apps/server  
   Build Command: npm install && npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run build
   Start Command: npm start
   ```

### **Step 2: Save and Redeploy**

1. **Click "Save Changes"**
2. **Go to Manual Deploy** → **Deploy Latest Commit**

## 🎯 **Why This Works**

- **Root Directory: `apps/server`** tells Render to run all commands from the server directory
- This avoids the workspace protocol issues in the root package.json
- The server directory has its own package.json with regular npm dependencies

## 🔍 **Alternative Solutions**

### **Option B: If Root Directory doesn't work**

Use Build Command:
```bash
cd apps/server && npm install && npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run build
```

### **Option C: Use the custom script**

Build Command: `cd apps/server && npm run render:build`

## ✅ **Success Verification**

After the fix, the build should:
1. ✅ Install dependencies without workspace errors
2. ✅ Generate Prisma client successfully  
3. ✅ Run database migrations
4. ✅ Seed the database
5. ✅ Build the TypeScript application
6. ✅ Start the server successfully

## 🧪 **Test After Fix**

```bash
curl -X POST "https://ironlog.onrender.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpass123"}'
```

Should return success response instead of 500 error.

---

**The key is setting `Root Directory: apps/server` in Render settings!**
