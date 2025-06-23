# IronLog Testing Guide

## 🧪 Testing the Complete PWA Implementation

### Prerequisites

- Node.js 18+
- pnpm installed
- PostgreSQL running
- Modern browser (Chrome, Firefox, Safari, Edge)

### Local Development Testing

#### 1. **Start Development Environment**

```bash
# Clone and setup (if not already done)
git clone https://github.com/AnishSingh15/Ironlog.git
cd Ironlog
pnpm install

# Generate Prisma client
cd apps/server && pnpm prisma generate && cd ../..

# Start all services
pnpm dev
```

#### 2. **Verify Services**

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Backend Health: http://localhost:3001/health
- Network Frontend: http://[YOUR_IP]:3000 (for mobile testing)

#### 3. **PWA Feature Testing**

##### **Service Worker**

1. Open Chrome DevTools → Application → Service Workers
2. Verify "IronLog Service Worker" is registered and active
3. Check cache storage for static assets

##### **Install Capability**

1. **Desktop (Chrome/Edge):** Look for install icon in address bar
2. **Mobile Chrome:** Menu → "Add to Home Screen"
3. **Mobile Safari:** Share → "Add to Home Screen"

##### **Offline Functionality**

1. Open DevTools → Network → Check "Offline"
2. Refresh page - should still load core pages
3. Check for offline indicator in UI

##### **Push Notifications**

1. Click "Enable Notifications" button
2. Grant permission when prompted
3. Test notifications (requires manual trigger)

### Production Testing

#### 1. **Build Production Version**

```bash
pnpm build
pnpm start
```

#### 2. **PWA Lighthouse Audit**

1. Open Chrome DevTools → Lighthouse
2. Select "Progressive Web App" audit
3. Run audit and verify score > 90

#### 3. **Multi-Device Testing**

- Desktop: Chrome, Firefox, Edge, Safari
- Mobile: iOS Safari, Android Chrome
- Tablet: iPad Safari, Android Chrome

### CI/CD Testing

#### 1. **GitHub Actions Workflow**

- Push changes to main branch
- Monitor workflow at: https://github.com/AnishSingh15/Ironlog/actions
- All jobs should pass: lint, test, build, e2e

#### 2. **Local CI Simulation**

```bash
# Run all CI checks locally
pnpm lint
pnpm type-check
pnpm build
pnpm test
```

### Database Testing

#### 1. **Prisma Operations**

```bash
cd apps/server

# Generate client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed database
pnpm prisma db seed

# View data
pnpm prisma studio
```

#### 2. **API Testing**

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Mobile Testing

#### 1. **Network Setup**

1. Ensure mobile device is on same WiFi network
2. Find your computer's IP address
3. Access http://[YOUR_IP]:3000 from mobile

#### 2. **PWA Installation**

1. **iOS:** Safari → Share → Add to Home Screen
2. **Android:** Chrome → Menu → Add to Home Screen

#### 3. **Offline Testing**

1. Install PWA on mobile
2. Turn off WiFi/cellular
3. Open installed app - should work offline

### Performance Testing

#### 1. **Lighthouse Metrics**

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
- PWA: > 90

#### 2. **Bundle Analysis**

```bash
cd apps/web
pnpm build
# Check bundle sizes in build output
```

### Security Testing

#### 1. **JWT Token Handling**

1. Login and inspect cookies
2. Verify httpOnly refresh token
3. Test token expiration/refresh

#### 2. **HTTPS Requirements**

- PWA features require HTTPS in production
- Service Worker requires secure context

### Troubleshooting

#### Common Issues

1. **Service Worker Not Registering**

   - Check browser console for errors
   - Verify HTTPS or localhost
   - Clear browser cache

2. **Prisma Client Not Found**

   - Run `pnpm prisma generate`
   - Check DATABASE_URL environment variable

3. **Build Failures**

   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies installed

4. **Mobile Access Issues**
   - Check firewall settings
   - Verify IP address is correct
   - Ensure same network connection

#### Debug Commands

```bash
# Check service status
pnpm dev

# Clear all caches
rm -rf node_modules .next dist
pnpm install

# Rebuild everything
pnpm build --force

# Check environment
node -v
pnpm -v
```

### Test Checklist

- [ ] ✅ Local development servers start
- [ ] ✅ Frontend accessible on localhost:3000
- [ ] ✅ Backend accessible on localhost:3001
- [ ] ✅ Service worker registers successfully
- [ ] ✅ PWA install prompt appears
- [ ] ✅ Offline functionality works
- [ ] ✅ Mobile access via network IP
- [ ] ✅ Database migrations run
- [ ] ✅ Database seeding works
- [ ] ✅ Build process completes
- [ ] ✅ All lint checks pass
- [ ] ✅ All type checks pass
- [ ] ✅ CI/CD pipeline passes
- [ ] ✅ PWA audit score > 90
- [ ] ✅ Cross-browser compatibility
- [ ] ✅ Mobile installation works
- [ ] ✅ Push notifications functional

---

**Happy Testing!** 🚀 The IronLog PWA is ready for production deployment.
