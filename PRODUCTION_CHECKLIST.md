# Production Deployment Checklist

## ✅ Pre-Deployment Verification

### Environment & Secrets
- [ ] **Never commit `.env.local` or `.env.production.local`** — Already configured in `.gitignore`
- [ ] Copy `.env.example` to `.env.local` (dev) or use secrets manager (production)
- [ ] **JWT_SECRET**: Generate a strong, random 32+ character string:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] **MONGODB_URI**: Use production MongoDB Atlas with:
  - IP whitelist enabled (restrict to your app servers)
  - Strong password (auto-generate in Atlas)
  - Connection string with `retryWrites=true&w=majority`
- [ ] Verify `NEXT_PUBLIC_API_URL` points to production domain (not localhost)

### Code Quality
- [x] TypeScript: `npx tsc --noEmit` passes (verified ✅)
- [ ] Lint check (install ESLint): `pnpm run lint`
- [x] All console.error/warn statements are intentional error logging (verified ✅)
- [x] No hardcoded secrets in code (verified ✅)
- [x] No TODO/FIXME comments left (or documented as known issues) (verified ✅)
- [ ] Remove test/debug API endpoints
- [ ] Remove any `console.log` or `console.debug` not related to errors

### Database
- [ ] MongoDB Atlas backup enabled
- [ ] Database indexes created: Run `npm run scripts/createIndexes.ts` once
- [ ] Database migration tested (if applicable)
- [ ] User model schema matches validation (verified ✅)
- [ ] Test write/read permissions from production app

### API Security
- [ ] CORS headers configured (if needed for cross-domain requests)
- [ ] All API routes have authentication checks where required
- [ ] Admin endpoints (`/api/admin/*`, `/api/properties/approval`) require role verification
- [ ] Password fields never exposed in API responses (verified ✅)
- [ ] Rate limiting implemented (not currently in place — consider adding)
- [ ] Input validation on all POST/PATCH/DELETE endpoints

### Frontend Security
- [ ] No sensitive data stored in localStorage unencrypted
- [ ] JWT tokens stored in httpOnly cookies (not localStorage)
- [ ] CSRF protection enabled if using form submissions
- [ ] XSS protections in place (Content-Security-Policy headers set ✅)
- [ ] All external image URLs validated

### Build & Runtime
- [ ] `next build` completes without errors
- [ ] No unused dependencies in `package.json`
- [ ] All required dependencies installed: `pnpm install --production`
- [ ] Build optimization: `productionBrowserSourceMaps: false` set ✅
- [ ] SWC minification enabled ✅

### Deployment Infrastructure
- [ ] Node.js version specified (package.json or `.nvmrc`)
- [ ] Environment variables configured in hosting platform (Vercel, Docker, etc.)
- [ ] Database connection tested from production environment
- [ ] Error monitoring / logging configured (e.g., Sentry, LogRocket)
- [ ] Uptime monitoring configured

### Testing Before Go-Live
- [ ] User registration flow tested
- [ ] User login/logout flow tested
- [ ] Token refresh/expiration tested
- [ ] Admin approval workflows tested
- [ ] Property CRUD operations tested
- [ ] Search/filter features tested
- [ ] Booking flows tested
- [ ] Messaging functionality tested
- [ ] Mobile responsiveness verified
- [ ] Load testing (if applicable)

### Monitoring & Maintenance
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Database backups scheduled
- [ ] Log rotation configured
- [ ] Security update process defined
- [ ] Incident response plan in place

---

## Key Files to Review

| File | Purpose | Status |
|------|---------|--------|
| `.env.example` | Template for environment variables | ✅ Created |
| `next.config.mjs` | Next.js config with security headers | ✅ Verified |
| `middleware.ts` | Auth middleware for protected routes | ✅ Verified |
| `app/api/auth/login/route.ts` | Login endpoint | Needs review |
| `app/api/auth/register/route.ts` | Registration endpoint | Needs review |
| `app/api/lib/models/User.ts` | User schema | ✅ Consolidated |
| `package.json` | Dependencies | Needs audit |

---

## Known Issues & TODOs

### 1. **Debugging Responses in Production** ⚠️
- **File**: `app/api/auth/register/route.ts` (lines 17, 131, 134)
- **Issue**: Comments indicate stack traces and verbose error responses should be removed in production
- **Action**: Before deploying, comment out or remove debug information

### 2. **Console Debug Code** ⚠️
- **File**: `app/page.tsx` (line 290-291)
- **Issue**: Comment says "DEBUG: comment out in production"
- **Action**: Remove or disable before production

### 3. **Rate Limiting Not Implemented** ⚠️
- **Impact**: API endpoints are vulnerable to brute-force attacks
- **Recommendation**: Add middleware using `next-rate-limit` or similar

### 4. **No HTTPS Enforcement** ⚠️
- **Impact**: Can leak JWT tokens if deployed over HTTP
- **Recommendation**: Add `Strict-Transport-Security` header; enforce HTTPS

### 5. **Test & v0 Route Files** ⚠️
- **Status**: Some routes have `routev0.ts` or `pagev0.ts` duplicates
- **Action**: Clean up after confirming v0 routes are no longer needed

---

## Quick Start for Production Deployment

### Local Testing
```bash
# 1. Install dependencies
pnpm install

# 2. Generate secure secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Generated JWT_SECRET: $JWT_SECRET"

# 3. Configure .env.local with production values
# MONGODB_URI = production MongoDB URI
# JWT_SECRET = generated above
# NEXT_PUBLIC_API_URL = production domain

# 4. Type check
npx tsc --noEmit

# 5. Build
pnpm build

# 6. Run tests/smoke test
pnpm dev
# Test: curl http://localhost:3000/api/health
```

### Docker Deployment (Example)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --production
COPY .next .next
COPY public public
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Vercel Deployment
1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `MONGODB_DB`
   - `NEXT_PUBLIC_API_URL` (production domain)
4. Deploy

---

## Security Best Practices

### API Routes
- ✅ Always verify authentication before returning user data
- ✅ Never expose password hashes in responses
- ✅ Validate and sanitize all inputs
- ✅ Use role-based access control for admin endpoints
- ⚠️ Add rate limiting to auth endpoints (login, register)
- ⚠️ Implement CAPTCHA for public forms

### Database
- ✅ Use MongoDB Atlas with IP whitelist
- ✅ Enable authentication (username/password)
- ⚠️ Regular backups (schedule in Atlas)
- ⚠️ Monitor database performance

### Frontend
- ✅ Store tokens in httpOnly cookies
- ✅ Validate JWT expiration
- ✅ Clear tokens on logout
- ✅ Redirect to login on 401 responses
- ⚠️ Implement CSRF tokens for state-changing operations

---

## Support & Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **MongoDB Atlas Security**: https://docs.atlas.mongodb.com/security/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc7519
- **OWASP Security Guidelines**: https://owasp.org/www-project-top-ten/

---

**Last Updated**: November 15, 2025
**Status**: Ready for deployment (pending security review and load testing)
