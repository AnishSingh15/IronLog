#!/bin/bash

# 🔍 IronLog Deployment Verification Script
# This script helps verify that your production deployment is working correctly

echo "🚀 IronLog Production Deployment Verification"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://ironlog.onrender.com"
FRONTEND_URL="https://ironlog-web.vercel.app"  # Update this with your actual Vercel URL

echo ""
echo "📡 Testing Backend Health..."
if curl -s "${BACKEND_URL}/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
    
    # Test specific endpoints
    echo ""
    echo "🔐 Testing Authentication Endpoints..."
    
    # Test register endpoint (should return method not allowed for GET)
    REGISTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/v1/auth/register")
    if [ "$REGISTER_STATUS" = "405" ] || [ "$REGISTER_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Register endpoint accessible${NC}"
    else
        echo -e "${RED}❌ Register endpoint issue (Status: $REGISTER_STATUS)${NC}"
    fi
    
    # Test login endpoint
    LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/v1/auth/login")
    if [ "$LOGIN_STATUS" = "405" ] || [ "$LOGIN_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Login endpoint accessible${NC}"
    else
        echo -e "${RED}❌ Login endpoint issue (Status: $LOGIN_STATUS)${NC}"
    fi
    
    # Test exercises endpoint (should require auth - 401)
    EXERCISES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/v1/exercises")
    if [ "$EXERCISES_STATUS" = "401" ]; then
        echo -e "${GREEN}✅ Exercises endpoint properly protected${NC}"
    else
        echo -e "${YELLOW}⚠️ Exercises endpoint status: $EXERCISES_STATUS${NC}"
    fi
    
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo "   Check your Render deployment status"
fi

echo ""
echo "🌐 Testing Frontend..."
if curl -s "${FRONTEND_URL}" > /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
    echo "   Check your Vercel deployment status"
fi

echo ""
echo "🔧 Environment Variable Checks..."
echo "   Backend URL: ${BACKEND_URL}"
echo "   Frontend URL: ${FRONTEND_URL}"
echo ""
echo -e "${YELLOW}⚠️ Manual checks required:${NC}"
echo "1. Open ${FRONTEND_URL} in browser"
echo "2. Open Developer Tools → Console"
echo "3. Look for: '🔗 API Client initialized with baseURL: ${BACKEND_URL}/api/v1'"
echo "4. Try registering a new user"
echo "5. Check for any CORS or network errors"

echo ""
echo "📱 PWA Checks..."
echo -e "${YELLOW}⚠️ Manual PWA checks required:${NC}"
echo "1. Open ${FRONTEND_URL} in Chrome/Safari mobile"
echo "2. Check for install prompt or 'Add to Home Screen' option"
echo "3. Install the app and verify it works"
echo "4. Test offline functionality (disable network in dev tools)"

echo ""
echo "🎯 Success Criteria:"
echo -e "   ${GREEN}✅${NC} No CORS errors in browser console"
echo -e "   ${GREEN}✅${NC} API calls return proper responses"
echo -e "   ${GREEN}✅${NC} User registration and login work"
echo -e "   ${GREEN}✅${NC} PWA install prompt appears"
echo -e "   ${GREEN}✅${NC} App works offline"

echo ""
echo "💡 If you see issues, check PRODUCTION_DEPLOYMENT_CHECKLIST.md"
echo "🔗 Backend Health: ${BACKEND_URL}/health"
echo "🔗 Frontend: ${FRONTEND_URL}"

echo ""
echo "=============================================="
echo "🏁 Verification Script Complete"
