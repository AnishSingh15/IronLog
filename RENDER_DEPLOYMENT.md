# Render Deployment Guide for IronLog

## 🚀 **Deploying IronLog Backend to Render**

### **1. Prerequisites**
- GitHub repository with IronLog code
- Render account (free tier available)
- PostgreSQL database (can use Render's free PostgreSQL)

### **2. Database Setup**

#### **Option A: Use Render PostgreSQL (Recommended)**
1. Go to Render Dashboard
2. Click "New" → "PostgreSQL"
3. Configure:
   - Name: `ironlog-db`
   - Database: `ironlog`
   - User: `ironlog`
   - Region: Choose closest to your users
4. Note down the connection details

#### **Option B: External PostgreSQL**
- Use any PostgreSQL provider (Supabase, Neon, etc.)
- Ensure it's accessible from Render

### **3. Backend Service Setup**

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: ironlog-backend
   Environment: Node
   Region: (same as database)
   Branch: main
   Root Directory: apps/server
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=<your_postgresql_connection_string>
   JWT_SECRET=<generate_strong_secret>
   JWT_REFRESH_SECRET=<generate_strong_refresh_secret>
   PORT=3001
   ```

4. **Advanced Settings**
   - Auto-Deploy: Yes
   - Health Check Path: `/health`

### **4. Environment Variables Details**

```bash
# Required Environment Variables
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-chars
NODE_ENV=production
PORT=3001

# Optional Environment Variables
SEED_DATABASE=true  # Only for initial deployment
```

### **5. Database Migration & Seeding**

#### **Initial Deployment**
1. After service is deployed, access the service shell
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Seed initial data:
   ```bash
   npx prisma db seed
   ```

#### **Subsequent Deployments**
- Migrations run automatically via the build command
- Seeding is optional and controlled by `SEED_DATABASE` env var

### **6. Frontend Deployment (Optional)**

If deploying frontend to Render as well:

1. **Create Static Site**
   - New → Static Site
   - Root Directory: `apps/web`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com/api/v1
   ```

### **7. Custom Build Script (Alternative)**

If you prefer using the provided build script:

1. **Build Command**: `./render-build.sh`
2. **Start Command**: `npm start`

### **8. Troubleshooting**

#### **Common Issues**

1. **Prisma Client Not Generated**
   ```
   Error: Cannot find module '@prisma/client'
   ```
   **Solution**: Ensure `npx prisma generate` runs before `npm run build`

2. **Database Connection Failed**
   ```
   Error: Can't reach database server
   ```
   **Solution**: Check DATABASE_URL format and network access

3. **TypeScript Compilation Errors**
   ```
   Error: Module '@prisma/client' has no exported member 'SetRecord'
   ```
   **Solution**: Ensure Prisma client is generated before TypeScript compilation

#### **Build Command Debugging**
```bash
# Full build command with debugging
npm install && \
npx prisma generate && \
npx prisma migrate deploy && \
npm run build && \
echo "Build completed successfully"
```

### **9. Health Check**

Render will automatically check: `https://your-service.onrender.com/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-06-23T10:30:00.000Z",
  "environment": "production"
}
```

### **10. Monitoring & Logs**

- **Logs**: Available in Render dashboard
- **Metrics**: Basic metrics provided by Render
- **Health**: Automatic health checks every 30 seconds

### **11. Security Considerations**

1. **Environment Variables**: Never commit secrets to repository
2. **Database**: Use strong passwords and limit access
3. **JWT Secrets**: Generate cryptographically secure secrets
4. **CORS**: Configure appropriate origins for production

### **12. Performance Optimization**

1. **Instance Type**: Start with free tier, upgrade as needed
2. **Database**: Consider connection pooling for high traffic
3. **Caching**: Implement Redis for session storage if needed
4. **CDN**: Use Render's CDN for static assets

---

## 🎯 **Quick Setup Checklist**

- [ ] Create PostgreSQL database on Render
- [ ] Note database connection string
- [ ] Create web service with correct build/start commands
- [ ] Set all required environment variables
- [ ] Deploy and check health endpoint
- [ ] Run database migrations and seeding
- [ ] Test API endpoints
- [ ] Configure frontend to use deployed backend URL

---

## 🆘 **Support**

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test database connectivity
4. Review build command output
5. Check health endpoint response

The deployment should be successful with these configurations! 🚀
